import os
import uuid
import cv2
import numpy as np
from typing import Dict, Any, Optional, Tuple, List
from app.cv.detector import plate_detector
from app.cv.preprocessor import preprocess_for_ocr, deskew_plate
from app.cv.ocr_engine import ocr_engine
from app.cv.normalizer import normalize_indian_plate
from app.config import settings

class VehicleShieldCVPipeline:
    """
    Unified Computer Vision and OCR Pipeline for Indian License Plate Recognition.
    Features multi-candidate token parsing, HSRP symbol isolation, and memory-safe execution.
    """

    def __init__(self):
        self.detector = plate_detector
        self.ocr = ocr_engine

    def _extract_best_plate_from_ocr(self, raw_text: str, avg_conf: float, details: List[Dict[str, Any]]) -> Tuple[Optional[str], float, float, str, Optional[Dict[str, Any]]]:
        """
        Scans detected text boxes, adjacent pairs (for multi-line plates), and full string
        to isolate the true vehicle registration number.
        Returns: (best_normalized, best_score, best_conf, best_type, best_bbox)
        """
        best_norm = None
        best_score = -1.0
        best_conf = 0.0
        best_type = "NONE"
        best_bbox = None

        # Check 1: Individual detected bounding boxes (highest precision)
        for d in details:
            text = d.get("text", "")
            norm, score, typ = normalize_indian_plate(text)
            if norm and score > best_score:
                best_score = score
                best_norm = norm
                best_conf = d.get("confidence", 0.0)
                best_type = typ
                best_bbox = d.get("bbox")

        # Check 2: Adjacent pairs (handles two-line motorcycle/commercial plates or split text)
        for i in range(len(details) - 1):
            pair_text = f"{details[i].get('text', '')} {details[i+1].get('text', '')}"
            norm, score, typ = normalize_indian_plate(pair_text)
            if norm and score > best_score:
                best_score = score
                best_norm = norm
                best_conf = (details[i].get("confidence", 0.0) + details[i+1].get("confidence", 0.0)) / 2.0
                best_type = typ
                best_bbox = details[i].get("bbox")

        # Check 3: Full concatenated raw text string
        if raw_text:
            norm, score, typ = normalize_indian_plate(raw_text)
            if norm and score > best_score:
                best_score = score
                best_norm = norm
                best_conf = avg_conf
                best_type = typ

        return best_norm, best_score, best_conf, best_type, best_bbox

    def process_image(self, image_np: np.ndarray) -> Dict[str, Any]:
        """
        Executes end-to-end CV pipeline on raw image frame:
        1. Plate localization & candidate ROI extraction
        2. Primary OCR on localized plate region
        3. Fallback OCR on central reticle / full frame if required
        4. Structured Indian registration plate normalization
        """
        if image_np is None or image_np.size == 0:
            return {
                "success": False,
                "error_message": "Invalid or empty image frame provided.",
                "registration_number": None,
                "ocr_confidence": 0.0,
                "plate_detection_confidence": 0.0
            }

        h, w = image_np.shape[:2]

        # Candidate regions to evaluate in priority order:
        # 1. Morphological/aspect-ratio plate contour
        # 2. Central optical reticle region (where user aligns the plate)
        # 3. Full camera frame
        regions_to_test = []

        # Region 1: Detected plate contour
        plate_crop, bbox, det_conf = self.detector.detect_plate(image_np)
        if plate_crop is not None and plate_crop.size > 0:
            regions_to_test.append((plate_crop, bbox, det_conf, "CONTOUR_ROI"))

        # Region 2: Central reticle region (typical phone camera target: center 70% width, center 40% height)
        rx1, rx2 = int(w * 0.15), int(w * 0.85)
        ry1, ry2 = int(h * 0.25), int(h * 0.75)
        reticle_crop = image_np[ry1:ry2, rx1:rx2]
        if reticle_crop.size > 0:
            regions_to_test.append((reticle_crop, {"x": rx1, "y": ry1, "width": rx2 - rx1, "height": ry2 - ry1}, 0.75, "RETICLE_ROI"))

        # Region 3: Full image frame (fallback)
        regions_to_test.append((image_np, {"x": 0, "y": 0, "width": w, "height": h}, 0.60, "FULL_FRAME"))

        best_overall_norm = None
        best_overall_score = -1.0
        best_overall_conf = 0.0
        best_overall_type = "NONE"
        best_crop_saved = None
        best_overall_bbox = bbox or {"x": 0, "y": 0, "width": w, "height": h}
        last_raw_text = ""

        for candidate_img, c_bbox, c_conf, label in regions_to_test:
            # Run OCR on candidate region (raw BGR provides best neural network accuracy)
            raw_text, avg_conf, details = self.ocr.recognize_text(candidate_img)
            last_raw_text = raw_text

            norm, score, conf, typ, detected_box = self._extract_best_plate_from_ocr(raw_text, avg_conf, details)
            
            if norm and score >= 0.70:
                best_overall_norm = norm
                best_overall_score = score
                best_overall_conf = conf
                best_overall_type = typ
                best_overall_bbox = c_bbox
                best_crop_saved = candidate_img
                # Found a verified standard plate -> Early exit!
                break
            elif norm and score > best_overall_score:
                best_overall_norm = norm
                best_overall_score = score
                best_overall_conf = conf
                best_overall_type = typ
                best_overall_bbox = c_bbox
                best_crop_saved = candidate_img

        # If no valid plate format was parsed
        if not best_overall_norm or best_overall_score < 0.35:
            return {
                "success": False,
                "error_message": "Could not recognize vehicle number plate. Please align the number plate inside the center reticle with good lighting and hold steady.",
                "raw_text": last_raw_text,
                "registration_number": None,
                "ocr_confidence": round(best_overall_conf, 3),
                "plate_detection_confidence": 0.0
            }

        # Save cropped plate image for audit / preview
        crop_filename = f"crop_{uuid.uuid4().hex[:12]}.jpg"
        crop_path = os.path.join(settings.UPLOAD_DIR, crop_filename)
        try:
            save_img = best_crop_saved if best_crop_saved is not None else image_np
            cv2.imwrite(crop_path, save_img)
        except Exception:
            crop_filename = None

        return {
            "success": True,
            "raw_text": last_raw_text,
            "registration_number": best_overall_norm,
            "ocr_confidence": round(best_overall_conf, 3),
            "plate_detection_confidence": round(best_overall_score, 3),
            "bounding_box": best_overall_bbox,
            "format_type": best_overall_type,
            "plate_crop_path": crop_filename,
            "error_message": None
        }

# Singleton instance
cv_pipeline = VehicleShieldCVPipeline()
