import cv2
import numpy as np
import torch
from typing import List, Tuple, Dict, Any, Optional

# Disable gradient calculation for inference to minimize RAM
torch.set_grad_enabled(False)
try:
    torch.set_num_threads(1)
except Exception:
    pass

class OCREngine:
    """
    Lightweight, memory-optimized Dual-engine OCR processor with EasyOCR (primary) and PyTesseract (fallback).
    Optimized for low-RAM cloud containers (Render 512MB).
    """

    def __init__(self):
        self._easyocr_reader = None
        self._initialized = False

    def _get_reader(self):
        if self._easyocr_reader is None:
            try:
                import easyocr
                # Initialize English OCR with CPU inference and low memory footprint
                self._easyocr_reader = easyocr.Reader(
                    ['en'],
                    gpu=False,
                    verbose=False,
                    quantize=True
                )
                self._initialized = True
            except Exception as e:
                print(f"[WARN] EasyOCR init error: {e}")
                self._easyocr_reader = None
        return self._easyocr_reader

    def recognize_text(self, image: np.ndarray) -> Tuple[str, float, List[Dict[str, Any]]]:
        """
        Runs OCR on the given image with size standardization to conserve RAM.
        Returns: (combined_raw_text, average_confidence, details_list)
        """
        if image is None or image.size == 0:
            return "", 0.0, []

        # Standardize plate image size: optimal for CRNN recognition is height ~80-120px
        h, w = image.shape[:2]
        if h > 180 or w > 600:
            scale = min(120.0 / h, 500.0 / w)
            new_w, new_h = max(int(w * scale), 32), max(int(h * scale), 32)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        elif h < 45 or w < 140:
            scale = max(70.0 / h, 220.0 / w)
            new_w, new_h = int(w * scale), int(h * scale)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

        reader = self._get_reader()
        if reader is not None:
            try:
                with torch.no_grad():
                    results = reader.readtext(
                        image,
                        detail=1,
                        paragraph=False,
                        batch_size=1,
                        workers=0,
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
            custom_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            text = pytesseract.image_to_string(image, config=custom_config).strip()
            if text:
                return text, 0.70, [{"text": text, "confidence": 0.70, "bbox": []}]
        except Exception:
            pass

        return "", 0.0, []

# Singleton instance
ocr_engine = OCREngine()
