import cv2
import numpy as np
from typing import Tuple, Optional

def enhance_plate_contrast(gray_img: np.ndarray) -> np.ndarray:
    """
    Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) to enhance
    contrast between plate background and embossed/printed characters.
    """
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray_img)
    return enhanced

def remove_noise(gray_img: np.ndarray) -> np.ndarray:
    """
    Applies Bilateral Filter to reduce noise while keeping character edges crisp.
    """
    filtered = cv2.bilateralFilter(gray_img, 9, 75, 75)
    return filtered

def deskew_plate(image: np.ndarray) -> np.ndarray:
    """
    Detects the orientation angle of the plate and rotates/deskews it.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()
        
    # Find all foreground pixels
    coords = np.column_stack(np.where(gray > 0))
    if coords.shape[0] < 10:
        return image
        
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    elif angle > 45:
        angle = 90 - angle
    else:
        angle = -angle

    # If angle is minor, avoid excessive interpolation blur
    if abs(angle) < 1.0 or abs(angle) > 35.0:
        return image

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated

def preprocess_for_ocr(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Preprocesses an image crop for optimal OCR reading.
    Returns: (enhanced_grayscale, binarized_thresholded)
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    # 1. Resize if too small (OCR models perform best when character height is ~30-50px)
    h, w = gray.shape[:2]
    if h < 60 or w < 180:
        scale = max(60 / max(h, 1), 180 / max(w, 1), 2.0)
        gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    # 2. Contrast Enhancement with CLAHE
    enhanced = enhance_plate_contrast(gray)

    # 3. Bilateral Noise Reduction
    denoised = remove_noise(enhanced)

    # 4. Adaptive Binarization (Otsu Thresholding)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Invert if text is white on dark background (e.g. commercial or EV plates)
    white_pixel_ratio = np.sum(thresh == 255) / (thresh.shape[0] * thresh.shape[1])
    if white_pixel_ratio < 0.35:
        thresh = cv2.bitwise_not(thresh)

    return denoised, thresh
