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
    Optimized for fast inference and low memory footprint on cloud servers.
    """

    def __init__(self):
        self.detector = plate_detector
        self.ocr = ocr_engine

    def process_image(self, image_np: np.ndarray) -> Dict[str, Any]:
        """
        Executes end-to-end CV pipeline on raw image frame:
        1. Frame downscaling (if large mobile photo)
        2. Plate localization & ROI extraction
        3. Perspective deskewing
        4. Fast single-pass OCR with smart fallback
        5. Indian plate syntax normalization & ambiguity resolution
        """
        if image_np is None or image_np.size == 0:
            return {
                "success": False,
                "error_message": "Invalid or empty image frame provided.",
                "registration_number": None,
                "ocr_confidence": 0.0,
                "plate_detection_confidence": 0.0
            }

        # Step 0: Downscale huge smartphone images to max 960px to prevent OOM
        h, w = image_np.shape[:2]
        if max(h, w) > 960:
            scale = 960.0 / max(h, w)
            image_np = cv2.resize(image_np, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

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

        # Step 4: Run OCR Pass 1 (Enhanced CLAHE Grayscale - highest contrast)
        raw_text_1, conf_1, details_1 = self.ocr.recognize_text(enhanced_gray)
        norm_1, fmt_1, type_1 = normalize_indian_plate(raw_text_1) if raw_text_1 else (None, 0.0, "NONE")
        composite_1 = (conf_1 * 0.60) + (fmt_1 * 0.40)

        # Early exit if Pass 1 yielded a strong valid plate
        if norm_1 and (fmt_1 >= 0.60 or composite_1 >= 0.50):
            best_normalized = norm_1
            best_raw_text = raw_text_1
            best_ocr_conf = conf_1
            best_format_type = type_1
            best_composite_score = composite_1
        else:
            # Pass 2 Fallback (Deskewed BGR image)
            raw_text_2, conf_2, details_2 = self.ocr.recognize_text(deskewed)
            norm_2, fmt_2, type_2 = normalize_indian_plate(raw_text_2) if raw_text_2 else (None, 0.0, "NONE")
            composite_2 = (conf_2 * 0.60) + (fmt_2 * 0.40)

            if composite_2 > composite_1:
                best_normalized = norm_2
                best_raw_text = raw_text_2
                best_ocr_conf = conf_2
                best_format_type = type_2
                best_composite_score = composite_2
            else:
                best_normalized = norm_1
                best_raw_text = raw_text_1
                best_ocr_conf = conf_1
                best_format_type = type_1
                best_composite_score = composite_1

        # Check if plate was identified
        if (not best_normalized) or best_composite_score < 0.20:
            return {
                "success": False,
                "error_message": "License plate characters could not be read clearly. Ensure adequate lighting, minimize glare, and hold phone steady.",
                "raw_text": best_raw_text,
                "registration_number": None,
                "ocr_confidence": round(best_ocr_conf, 3),
                "plate_detection_confidence": round(det_conf, 3)
            }

        # Step 5: Save cropped plate image for audit / preview
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
