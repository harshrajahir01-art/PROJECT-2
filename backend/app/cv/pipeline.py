import os
import uuid
import cv2
import numpy as np
from typing import Dict, Any, Optional, Tuple, List
from app.cv.detector import plate_detector
from app.cv.ocr_engine import ocr_engine
from app.cv.normalizer import normalize_indian_plate
from app.config import settings

class VehicleShieldCVPipeline:
    """
    Unified High-Performance Computer Vision & ANPR Pipeline for Indian License Plates.
    Engineered for ultra-fast <2s response times and robust multi-box character isolation.
    """

    def __init__(self):
        self.detector = plate_detector
        self.ocr = ocr_engine

    def _extract_best_plate_from_ocr(self, raw_text: str, avg_conf: float, details: List[Dict[str, Any]]) -> Tuple[Optional[str], float, float, str, Optional[Dict[str, Any]]]:
        """
        Extracts and normalizes the true vehicle plate from individual bounding boxes,
        adjacent pairs, or concatenated text.
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
        Executes fast, single/dual-pass ANPR on image frame.
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

        # Extract prioritized candidate plate crops (character clusters, contrast-bounded rectangles, fallback frames)
        candidates = self.detector.get_candidate_crops(image_np)
        if not candidates:
            candidates = [(image_np, {"x": 0, "y": 0, "width": w, "height": h}, 0.50)]

        best_norm = None
        best_score = -1.0
        best_conf = 0.0
        best_typ = "NONE"
        best_raw = ""
        best_crop_img = image_np
        best_bbox = {"x": 0, "y": 0, "width": w, "height": h}

        # Run multi-candidate evaluation
        for c_img, c_box, c_conf in candidates:
            if c_img is None or c_img.size == 0:
                continue

            raw_text, avg_conf, details = self.ocr.recognize_text(c_img, apply_enhancement=True)
            norm, score, conf, typ, _ = self._extract_best_plate_from_ocr(raw_text, avg_conf, details)

            if norm and score > best_score:
                best_norm = norm
                best_score = score
                best_conf = conf
                best_typ = typ
                best_raw = raw_text
                best_crop_img = c_img
                best_bbox = c_box

                # If we achieved a high-confidence structural plate match, break early for sub-second speed!
                if score >= 0.85:
                    break

        if not best_norm or best_score < 0.35:
            return {
                "success": False,
                "error_message": "Could not recognize vehicle number plate. Please align the number plate inside the center reticle and ensure it is clearly visible.",
                "raw_text": best_raw,
                "registration_number": None,
                "ocr_confidence": round(best_conf, 3),
                "plate_detection_confidence": 0.0
            }

        norm = best_norm
        score = best_score
        conf = best_conf
        typ = best_typ
        raw_text = best_raw
        crop_to_run = best_crop_img
        crop_bbox = best_bbox

        # Save cropped plate image for audit / preview
        crop_filename = f"crop_{uuid.uuid4().hex[:12]}.jpg"
        crop_path = os.path.join(settings.UPLOAD_DIR, crop_filename)
        try:
            cv2.imwrite(crop_path, crop_to_run)
        except Exception:
            crop_filename = None

        return {
            "success": True,
            "raw_text": raw_text,
            "registration_number": norm,
            "ocr_confidence": round(conf, 3),
            "plate_detection_confidence": round(score, 3),
            "bounding_box": crop_bbox,
            "format_type": typ,
            "plate_crop_path": crop_filename,
            "error_message": None
        }

# Singleton instance
cv_pipeline = VehicleShieldCVPipeline()
