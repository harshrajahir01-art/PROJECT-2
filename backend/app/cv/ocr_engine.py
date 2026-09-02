import cv2
import numpy as np
from typing import List, Tuple, Dict, Any, Optional

class OCREngine:
    """
    Dual-engine OCR processor with EasyOCR (primary) and PyTesseract (fallback).
    """

    def __init__(self):
        self._easyocr_reader = None
        self._initialized = False

    def _get_reader(self):
        if self._easyocr_reader is None:
            try:
                import easyocr
                # Initialize English OCR with CPU inference
                self._easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
                self._initialized = True
            except Exception as e:
                print(f"[WARN] EasyOCR init error: {e}")
                self._easyocr_reader = None
        return self._easyocr_reader

    def recognize_text(self, image: np.ndarray) -> Tuple[str, float, List[Dict[str, Any]]]:
        """
        Runs OCR on the given image.
        Returns: (combined_raw_text, average_confidence, details_list)
        """
        if image is None or image.size == 0:
            return "", 0.0, []

        reader = self._get_reader()
        if reader is not None:
            try:
                # EasyOCR returns: [ (bbox, text, confidence), ... ]
                # We test both direct RGB/BGR image and enhanced grayscale
                results = reader.readtext(
                    image,
                    detail=1,
                    paragraph=False,
                    allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -."
                )

                if results:
                    text_parts = []
                    conf_scores = []
                    details = []

                    # Sort results left-to-right, top-to-bottom
                    results_sorted = sorted(results, key=lambda r: (r[0][0][1] // 20, r[0][0][0]))

                    for bbox, text, conf in results_sorted:
                        clean_item = text.strip()
                        if clean_item:
                            text_parts.append(clean_item)
                            conf_scores.append(float(conf))
                            details.append({
                                "text": clean_item,
                                "confidence": float(conf),
                                "bbox": [[int(pt[0]), int(pt[1])] for pt in bbox]
                            })

                    raw_text = " ".join(text_parts)
                    avg_conf = float(np.mean(conf_scores)) if conf_scores else 0.0
                    return raw_text, avg_conf, details
            except Exception as e:
                print(f"[ERROR] EasyOCR recognition error: {e}")

        # Fallback to PyTesseract if available
        try:
            import pytesseract
            # Configure tesseract for single line / single word uppercase alphanumeric
            custom_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            text = pytesseract.image_to_string(image, config=custom_config).strip()
            if text:
                return text, 0.70, [{"text": text, "confidence": 0.70, "bbox": []}]
        except Exception as e:
            pass

        return "", 0.0, []

# Singleton instance
ocr_engine = OCREngine()
