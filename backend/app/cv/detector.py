import cv2
import numpy as np
from typing import List, Tuple, Optional, Dict, Any

class PlateDetector:
    """
    License plate detector using Morphological Edge and Contour Aspect-Ratio Analysis.
    Detects rectangular plate candidates in full-frame vehicle images or verifies cropped plate images.
    """

    def __init__(self):
        pass

    def get_candidate_crops(self, image: np.ndarray) -> List[Tuple[np.ndarray, Dict[str, Any], float]]:
        """
        Extracts ordered high-probability license plate crops from a vehicle image:
        1. Tight white/yellow/green plate rectangles (contrast-based).
        2. Character-line clusters (horizontal rows of embossed characters).
        3. Dynamic edge and morphological plate candidates.
        4. Full image fallback.
        Returns: List of (cropped_image, bbox_dict, candidate_confidence)
        """
        if image is None or image.size == 0:
            return []

        h, w = image.shape[:2]
        aspect = float(w) / float(max(h, 1))
        candidates: List[Tuple[float, np.ndarray, Dict[str, Any]]] = []

        # If already a tight plate crop
        if 2.0 <= aspect <= 6.5 and h < 500 and w < 1200:
            candidates.append((0.95, image, {"x": 0, "y": 0, "width": w, "height": h}))

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image.copy()

        # Method 1: High-contrast plate candidate detection (white/yellow/green plates)
        for thresh_val in [185, 170, 150]:
            _, binary = cv2.threshold(gray, thresh_val, 255, cv2.THRESH_BINARY)
            kw = max(15, int(w * 0.035))
            kh = max(5, int(h * 0.02))
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kw, kh))
            closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            cnts, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for c in cnts:
                bx, by, bw, bh = cv2.boundingRect(c)
                ar = float(bw) / float(max(bh, 1))
                area_pct = (bw * bh) / float(w * h)
                if 2.2 <= ar <= 6.2 and 0.015 <= area_pct <= 0.60 and bw > 140 and bh > 28:
                    pad_x = int(bw * 0.03)
                    pad_y = int(bh * 0.05)
                    x1, y1 = max(0, bx - pad_x), max(0, by - pad_y)
                    x2, y2 = min(w, bx + bw + pad_x), min(h, by + bh + pad_y)
                    crop = image[y1:y2, x1:x2]
                    if crop.size > 0:
                        score = 1.0 - (abs(ar - 4.0) / 4.0)
                        candidates.append((score, crop, {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1}))

        # Method 2: Character-line cluster detection (detects horizontal row of 5+ characters)
        _, otsu_inv = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        cnts, _ = cv2.findContours(otsu_inv, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        char_boxes = []
        for c in cnts:
            bx, by, bw, bh = cv2.boundingRect(c)
            if bh > 20 and bw > 12 and 0.2 < (bw / float(bh)) < 1.2:
                char_boxes.append((bx, by, bw, bh))

        char_boxes.sort(key=lambda b: b[0])
        clusters = []
        for b in char_boxes:
            added = False
            for cl in clusters:
                avg_y = sum(item[1] for item in cl) / len(cl)
                avg_h = sum(item[3] for item in cl) / len(cl)
                if abs(b[1] - avg_y) < avg_h * 0.35 and abs(b[3] - avg_h) < avg_h * 0.35:
                    cl.append(b)
                    added = True
                    break
            if not added:
                clusters.append([b])

        for cl in clusters:
            if len(cl) >= 5:
                min_x = min(b[0] for b in cl)
                max_x = max(b[0] + b[2] for b in cl)
                min_y = min(b[1] for b in cl)
                max_y = max(b[1] + b[3] for b in cl)
                avg_h = (max_y - min_y)
                x1 = max(0, min_x - int(avg_h * 0.65))
                x2 = min(w, max_x + int(avg_h * 0.45))
                y1 = max(0, min_y - int(avg_h * 0.35))
                y2 = min(h, max_y + int(avg_h * 0.35))
                cw = x2 - x1
                ch = y2 - y1
                ar = float(cw) / float(max(ch, 1))
                if 2.2 <= ar <= 6.5:
                    crop = image[y1:y2, x1:x2]
                    if crop.size > 0:
                        candidates.append((1.2, crop, {"x": x1, "y": y1, "width": cw, "height": ch}))

        # Sort candidates by confidence score descending
        candidates.sort(key=lambda item: item[0], reverse=True)

        results: List[Tuple[np.ndarray, Dict[str, Any], float]] = []
        seen_boxes = set()

        for score, crop, box in candidates:
            box_key = (box["x"] // 15, box["y"] // 15, box["width"] // 25, box["height"] // 25)
            if box_key not in seen_boxes:
                seen_boxes.add(box_key)
                results.append((crop, box, min(0.95, round(score, 2))))

        # Fallback 1: Center lower vehicle crop
        crop_y1 = int(h * 0.15)
        crop_y2 = int(h * 0.85)
        crop_x1 = int(w * 0.08)
        crop_x2 = int(w * 0.92)
        center_crop = image[crop_y1:crop_y2, crop_x1:crop_x2]
        if center_crop.size > 0:
            results.append((center_crop, {"x": crop_x1, "y": crop_y1, "width": crop_x2 - crop_x1, "height": crop_y2 - crop_y1}, 0.60))

        # Fallback 2: Full raw image
        results.append((image, {"x": 0, "y": 0, "width": w, "height": h}, 0.50))
        return results

    def detect_plate(self, image: np.ndarray) -> Tuple[Optional[np.ndarray], Dict[str, Any], float]:
        """
        Locates the best license plate candidate in an image.
        Returns: (cropped_plate_image, bounding_box_dict, detection_confidence)
        """
        candidates = self.get_candidate_crops(image)
        if candidates:
            return candidates[0][0], candidates[0][1], candidates[0][2]
        h, w = (image.shape[:2]) if image is not None else (0, 0)
        return image, {"x": 0, "y": 0, "width": w, "height": h}, 0.50

# Singleton instance
plate_detector = PlateDetector()
