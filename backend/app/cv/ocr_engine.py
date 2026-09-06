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
    Ultra-lightweight, high-speed OCR processor with EasyOCR and PyTesseract fallback.
    Configured for fast 1-second inference under Render's 512MB RAM limit.
    """

    def __init__(self):
        self._easyocr_reader = None
        self._initialized = False

    def _get_reader(self):
        if self._easyocr_reader is None:
            try:
                import easyocr
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
        Runs fast, memory-capped OCR with canvas_size=640 and mag_ratio=1.0.
        Returns: (combined_raw_text, average_confidence, details_list)
        """
        if image is None or image.size == 0:
            return "", 0.0, []

        h, w = image.shape[:2]
        # Only scale down if image exceeds 960px to prevent memory spikes
        if max(h, w) > 960:
            scale = 960.0 / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        elif h < 40 or w < 120:
            scale = max(60.0 / max(h, 1), 180.0 / max(w, 1))
            new_w, new_h = int(w * scale), int(h * scale)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

        reader = self._get_reader()
        if reader is not None:
            try:
                with torch.no_grad():
                    # canvas_size=640 prevents CRAFT from allocating 2560x2560 intermediate tensors!
                    results = reader.readtext(
                        image,
                        detail=1,
                        paragraph=False,
                        batch_size=1,
                        workers=0,
                        canvas_size=640,
                        mag_ratio=1.0,
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
