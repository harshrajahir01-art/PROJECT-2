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

        # 1. First priority: Try contour-based plate crop
        plate_crop, bbox, det_conf = self.detector.detect_plate(image_np)
        
        # 2. Check if contour is a valid plate aspect ratio
        crop_to_run = plate_crop
        crop_bbox = bbox
        crop_conf = det_conf

        if crop_to_run is None or crop_to_run.size == 0:
            # Fallback to center optical reticle (center 70% width, center 40% height)
            rx1, rx2 = int(w * 0.15), int(w * 0.85)
            ry1, ry2 = int(h * 0.25), int(h * 0.75)
            crop_to_run = image_np[ry1:ry2, rx1:rx2]
            crop_bbox = {"x": rx1, "y": ry1, "width": rx2 - rx1, "height": ry2 - ry1}
            crop_conf = 0.75

        # Run Primary OCR pass on crop
        raw_text, avg_conf, details = self.ocr.recognize_text(crop_to_run)
        norm, score, conf, typ, detected_box = self._extract_best_plate_from_ocr(raw_text, avg_conf, details)

        # If primary crop didn't find a valid plate and the input was a full image, try the full image once
        if (not norm or score < 0.60) and (crop_to_run is not image_np) and max(h, w) <= 960:
            raw_text_full, avg_conf_full, details_full = self.ocr.recognize_text(image_np)
            norm_full, score_full, conf_full, typ_full, _ = self._extract_best_plate_from_ocr(raw_text_full, avg_conf_full, details_full)
            if norm_full and score_full > (score or 0.0):
                norm = norm_full
                score = score_full
                conf = conf_full
                typ = typ_full
                raw_text = raw_text_full
                crop_to_run = image_np

        if not norm or score < 0.35:
            return {
                "success": False,
                "error_message": "Could not recognize vehicle number plate. Please align the number plate inside the center reticle with good lighting and hold steady.",
                "raw_text": raw_text,
                "registration_number": None,
                "ocr_confidence": round(conf, 3),
                "plate_detection_confidence": 0.0
            }

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
