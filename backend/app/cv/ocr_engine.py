import os
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

def enhance_for_anpr(image: np.ndarray) -> np.ndarray:
    """
    Optimizes image frames for license plate recognition under extreme conditions:
    - High-speed motion blur: unsharp high-pass filter
    - Mist, fog, rain, low-light: CLAHE contrast equalization
    - Digital screen / moire: highlight smoothing
    """
    if image is None or image.size == 0:
        return image

    # 1. CLAHE in LAB color space (equalizes illumination without hue distortion)
    if len(image.shape) == 3:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        merged = cv2.merge((cl, a, b))
        enhanced = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    else:
        clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
        enhanced = clahe.apply(image)

    # 2. Unsharp masking to sharpen blurred text from motion blur or screen capture
    blurred = cv2.GaussianBlur(enhanced, (0, 0), 2.0)
    sharpened = cv2.addWeighted(enhanced, 1.4, blurred, -0.4, 0)
    return sharpened

class OCREngine:
    """
    Ultra-lightweight, high-speed OCR processor with EasyOCR and PyTesseract fallback.
    Configured for fast sub-second inference under Render's 512MB RAM limit.
    """

    def __init__(self):
        self._easyocr_reader = None
        self._initialized = False
        # Enable low-memory mode automatically on Render or when memory is constrained (<1GB)
        self.is_low_memory = os.environ.get("RENDER") == "true" or os.environ.get("LOW_MEMORY_MODE", "").lower() in ("1", "true")

    def _get_reader(self):
        if self._easyocr_reader is None:
            try:
                import easyocr
                # On Render free tier (512MB RAM), detector=False only loads recognizer (340MB)
                # PlateDetector handles morphological plate cropping, avoiding CRAFT detector OOM
                self._easyocr_reader = easyocr.Reader(
                    ['en'],
                    gpu=False,
                    verbose=False,
                    quantize=False,
                    detector=not self.is_low_memory
                )
                self._initialized = True
                # Run a fast 1x1 dummy warmup inference
                try:
                    dummy = np.full((64, 128, 3), 255, dtype=np.uint8)
                    cv2.putText(dummy, "GJ01", (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
                    if self.is_low_memory:
                        self._easyocr_reader.recognize(dummy)
                    else:
                        self._easyocr_reader.readtext(dummy, canvas_size=128)
                except Exception:
                    pass
            except Exception as e:
                print(f"[WARN] EasyOCR init error: {e}")
                self._easyocr_reader = None
        return self._easyocr_reader

    def recognize_text(self, image: np.ndarray, apply_enhancement: bool = True) -> Tuple[str, float, List[Dict[str, Any]]]:
        """
        Runs fast, memory-capped OCR.
        On Render (512MB), uses direct recognition (<350MB RAM).
        Returns: (combined_raw_text, average_confidence, details_list)
        """
        if image is None or image.size == 0:
            return "", 0.0, []

        if apply_enhancement:
            image = enhance_for_anpr(image)

        h, w = image.shape[:2]
        # Scale down if image exceeds 960px to prevent memory spikes
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
                    if self.is_low_memory:
                        # Direct recognizer inference (ultra-lightweight <350MB RAM)
                        h_curr, w_curr = image.shape[:2]
                        if h_curr > 0 and w_curr / max(h_curr, 1) < 2.0:
                            # 2-line plate (motorcycle / high aspect ratio)
                            mid = h_curr // 2
                            p1 = image[:mid + 8, :]
                            p2 = image[mid - 8:, :]
                            r1 = reader.recognize(p1, allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -.")
                            r2 = reader.recognize(p2, allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -.")
                            results = r1 + r2
                        else:
                            results = reader.recognize(image, allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -.")
                    else:
                        # Full detection + recognition pipeline
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

                    for item in results:
                        if len(item) >= 3:
                            bbox, text, conf = item[0], item[1], item[2]
                        elif len(item) == 2:
                            bbox, text = item[0], item[1]
                            conf = 0.85
                        else:
                            continue

                        clean_item = text.strip()
                        if clean_item:
                            text_parts.append(clean_item)
                            conf_scores.append(float(conf))
                            details.append({
                                "text": clean_item,
                                "confidence": float(conf),
                                "bbox": [[int(pt[0]), int(pt[1])] for pt in bbox] if hasattr(bbox, '__iter__') else []
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
