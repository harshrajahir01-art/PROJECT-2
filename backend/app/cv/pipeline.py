import os
import uuid
import cv2
import numpy as np
from typing import Dict, Any, Optional, Tuple
from app.cv.detector import plate_detector
from app.cv.preprocessor import preprocess_for_ocr, deskew_plate
from app.cv.ocr_engine import ocr_engine
from app.cv.normalizer import normalize_indian_plate
from app.config import settings

class VehicleShieldCVPipeline:
    """
    Unified Computer Vision and OCR Pipeline for Indian License Plate Recognition.
    """

    def __init__(self):
        self.detector = plate_detector
        self.ocr = ocr_engine

    def process_image(self, image_np: np.ndarray) -> Dict[str, Any]:
        """
        Executes end-to-end CV pipeline on raw image frame:
        1. Plate localization & ROI extraction
        2. Perspective deskewing
        3. CLAHE enhancement & bilateral filtering
        4. Multi-variant OCR extraction
        5. Indian plate syntax normalization & ambiguity resolution
        6. Confidence scoring & quality rejection gate
        """
        if image_np is None or image_np.size == 0:
            return {
                "success": False,
                "error_message": "Invalid or empty image frame provided.",
                "registration_number": None,
                "ocr_confidence": 0.0,
                "plate_detection_confidence": 0.0
            }

        # Step 1: Detect and crop candidate license plate region
        plate_crop, bbox, det_conf = self.detector.detect_plate(image_np)
        
        if plate_crop is None or plate_crop.size == 0:
            return {
                "success": False,
                "error_message": "No vehicle license plate detected in the frame. Please align the number plate inside the target reticle.",
                "registration_number": None,
                "ocr_confidence": 0.0,
                "plate_detection_confidence": 0.0
            }

        # Step 2: Perspective deskewing
        deskewed = deskew_plate(plate_crop)

        # Step 3: Enhancement and Preprocessing
        enhanced_gray, thresholded = preprocess_for_ocr(deskewed)

        # Step 4: Multi-variant OCR analysis
        # Variant A: Deskewed BGR crop
        raw_text_a, conf_a, details_a = self.ocr.recognize_text(deskewed)
        # Variant B: Enhanced CLAHE Grayscale
        raw_text_b, conf_b, details_b = self.ocr.recognize_text(enhanced_gray)
        # Variant C: Adaptive Thresholding
        raw_text_c, conf_c, details_c = self.ocr.recognize_text(thresholded)

        # Pick the best candidate based on normalization score & OCR confidence
        candidates = [
            (raw_text_a, conf_a, "BGR"),
            (raw_text_b, conf_b, "CLAHE_GRAY"),
            (raw_text_c, conf_c, "THRESH")
        ]

        best_normalized = None
        best_composite_score = -1.0
        best_raw_text = ""
        best_ocr_conf = 0.0
        best_format_type = "NONE"

        for raw_text, conf, variant in candidates:
            if not raw_text.strip():
                continue
            normalized, fmt_score, fmt_type = normalize_indian_plate(raw_text)
            
            # Composite score = 60% OCR confidence + 40% format validity
            composite_score = (conf * 0.60) + (fmt_score * 0.40)
            
            if composite_score > best_composite_score:
                best_composite_score = composite_score
                best_normalized = normalized
                best_raw_text = raw_text
                best_ocr_conf = conf
                best_format_type = fmt_type

        # If all three gave empty or low text, try fallback on full image crop directly
        if (not best_normalized) or best_composite_score < settings.MIN_OCR_CONFIDENCE:
            if best_composite_score < 0.20:
                return {
                    "success": False,
                    "error_message": "License plate characters could not be read clearly. Ensure adequate lighting, minimize glare, and hold phone steady.",
                    "raw_text": best_raw_text,
                    "registration_number": None,
                    "ocr_confidence": round(best_ocr_conf, 3),
                    "plate_detection_confidence": round(det_conf, 3),
                    "bounding_box": bbox
                }

        # Step 5: Save cropped plate to disk for record / dashboard viewing
        crop_filename = f"crop_{uuid.uuid4().hex[:12]}.jpg"
        crop_path = os.path.join(settings.UPLOAD_DIR, crop_filename)
        try:
            cv2.imwrite(crop_path, deskewed)
        except Exception:
            crop_filename = None

        return {
            "success": True,
            "raw_text": best_raw_text,
            "registration_number": best_normalized,
            "ocr_confidence": round(best_ocr_conf, 3),
            "plate_detection_confidence": round(det_conf, 3),
            "bounding_box": bbox,
            "format_type": best_format_type,
            "plate_crop_path": crop_filename,
            "error_message": None
        }

# Singleton instance
cv_pipeline = VehicleShieldCVPipeline()
