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

    def detect_plate(self, image: np.ndarray) -> Tuple[Optional[np.ndarray], Dict[str, Any], float]:
        """
        Locates the license plate in an image.
        Returns: (cropped_plate_image, bounding_box_dict, detection_confidence)
        """
        if image is None or image.size == 0:
            return None, {"x": 0, "y": 0, "width": 0, "height": 0}, 0.0

        h, w = image.shape[:2]

        # Case 1: The input image is ALREADY a tightly cropped plate (aspect ratio ~ 2.0 - 6.0 and reasonable size)
        aspect_ratio = float(w) / float(max(h, 1))
        if 1.8 <= aspect_ratio <= 6.5 and h < 500 and w < 1200:
            # High likelihood input is direct plate crop
            return image, {"x": 0, "y": 0, "width": w, "height": h}, 0.90

        # Case 2: Full vehicle frame -> Search for candidate plate regions
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image.copy()

        # Apply Blackhat morphological operator to reveal dark text on light plate background
        rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (13, 5))
        blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, rect_kernel)

        # Compute Scharr gradient representation in X direction
        grad_x = cv2.Sobel(blackhat, ddepth=cv2.CV_32F, dx=1, dy=0, ksize=-1)
        grad_x = np.absolute(grad_x)
        (min_val, max_val) = (np.min(grad_x), np.max(grad_x))
        if max_val > min_val:
            grad_x = 255 * ((grad_x - min_val) / (max_val - min_val))
        grad_x = grad_x.astype("uint8")

        # Blur and threshold the gradient representation
        grad_x = cv2.GaussianBlur(grad_x, (5, 5), 0)
        grad_x = cv2.morphologyEx(grad_x, cv2.MORPH_CLOSE, rect_kernel)
        _, thresh = cv2.threshold(grad_x, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Perform a series of erosions and dilations to clean the mask
        thresh = cv2.erode(thresh, None, iterations=2)
        thresh = cv2.dilate(thresh, None, iterations=2)

        # Find contours
        contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:15]

        best_crop = None
        best_box = {"x": 0, "y": 0, "width": w, "height": h}
        best_confidence = 0.50

        for c in contours:
            (x, y, cw, ch) = cv2.boundingRect(c)
            ar = float(cw) / float(max(ch, 1))

            # Standard Indian plates aspect ratio typically between 2.2 and 5.5
            area = cw * ch
            frame_area = w * h
            
            # Reject if area is too small (< 0.5% of frame) or too large (> 85% of frame)
            if area < (0.005 * frame_area) or area > (0.85 * frame_area):
                continue

            if 2.0 <= ar <= 6.0:
                # Add slight padding around detected plate
                pad_x = int(cw * 0.05)
                pad_y = int(ch * 0.10)
                
                x1 = max(0, x - pad_x)
                y1 = max(0, y - pad_y)
                x2 = min(w, x + cw + pad_x)
                y2 = min(h, y + ch + pad_y)

                candidate_crop = image[y1:y2, x1:x2]
                if candidate_crop.size > 0:
                    best_crop = candidate_crop
                    best_box = {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1}
                    # Calculate confidence based on geometry
                    ar_closeness = 1.0 - abs(ar - 3.8) / 3.8
                    best_confidence = min(0.92, max(0.60, 0.65 + (ar_closeness * 0.25)))
                    break

        # If no specific contour was isolated, use the central lower region (typical front plate location in camera)
        if best_crop is None:
            # Fallback to center-focused region of interest
            crop_y1 = int(h * 0.20)
            crop_y2 = int(h * 0.80)
            crop_x1 = int(w * 0.10)
            crop_x2 = int(w * 0.90)
            best_crop = image[crop_y1:crop_y2, crop_x1:crop_x2]
            best_box = {"x": crop_x1, "y": crop_y1, "width": crop_x2 - crop_x1, "height": crop_y2 - crop_y1}
            best_confidence = 0.55

        return best_crop, best_box, best_confidence

# Singleton instance
plate_detector = PlateDetector()
