import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def generate_indian_plate_image(
    plate_text: str, 
    output_path: str,
    bg_color: tuple = (245, 245, 245),
    text_color: tuple = (20, 20, 20),
    is_ev: bool = False,
    is_commercial: bool = False,
    tilt_angle: float = 0.0
):
    """
    Generates a realistic high-resolution Indian vehicle registration number plate image.
    """
    width = 520
    height = 140

    if is_ev:
        bg_color = (34, 139, 34)  # Green
        text_color = (255, 255, 255) # White
    elif is_commercial:
        bg_color = (245, 200, 0)  # Yellow
        text_color = (20, 20, 20)  # Black

    # 1. Base Plate Canvas
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # 2. Outer and Inner Border
    border_color = (20, 20, 20) if not is_ev else (255, 255, 255)
    draw.rounded_rectangle([4, 4, width - 4, height - 4], radius=10, outline=border_color, width=4)
    draw.rounded_rectangle([8, 8, width - 8, height - 8], radius=8, outline=border_color, width=1)

    # 3. IND Blue Strip on the left
    ind_width = 45
    draw.rectangle([8, 8, ind_width, height - 8], fill=(0, 51, 153))
    
    # Try default fonts or draw fallback
    try:
        font_ind = ImageFont.truetype("arial.ttf", 14)
        draw.text((15, 95), "IND", fill=(255, 255, 255), font=font_ind)
    except Exception:
        draw.text((15, 95), "IND", fill=(255, 255, 255))

    # Ashoka Chakra symbol circle in blue strip
    draw.ellipse([18, 40, 36, 58], outline=(255, 215, 0), width=2)

    # 4. License Plate Characters
    # Split plate text with realistic spacing
    formatted_text = plate_text
    if len(plate_text) == 10:
        # e.g., GJ 01 AB 1234
        formatted_text = f"{plate_text[:2]} {plate_text[2:4]} {plate_text[4:6]} {plate_text[6:]}"
    elif len(plate_text) == 9:
        formatted_text = f"{plate_text[:2]} {plate_text[2:3]} {plate_text[3:5]} {plate_text[5:]}"

    try:
        # Use bold font
        font_plate = ImageFont.truetype("arialbd.ttf", 54)
    except Exception:
        try:
            font_plate = ImageFont.truetype("arial.ttf", 54)
        except Exception:
            font_plate = ImageFont.load_default()

    # Draw Text centered in the remaining area
    text_bbox = draw.textbbox((0, 0), formatted_text, font=font_plate)
    text_w = text_bbox[2] - text_bbox[0]
    text_h = text_bbox[3] - text_bbox[1]
    
    text_x = ind_width + ((width - ind_width - text_w) // 2)
    text_y = (height - text_h) // 2 - 6

    draw.text((text_x, text_y), formatted_text, fill=text_color, font=font_plate)

    # Convert PIL Image to OpenCV numpy array
    cv_img = np.array(img)
    cv_img = cv2.cvtColor(cv_img, cv2.COLOR_RGB2BGR)

    # 5. Add Realistic Lighting & Noise
    # Subtle gaussian blur & noise
    noise = np.random.normal(0, 3, cv_img.shape).astype(np.int16)
    noisy_img = np.clip(cv_img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    # 6. Apply slight tilt if specified
    if abs(tilt_angle) > 0.1:
        center = (width // 2, height // 2)
        matrix = cv2.getRotationMatrix2D(center, tilt_angle, 1.0)
        # Add background canvas padding
        pad_img = cv2.copyMakeBorder(noisy_img, 40, 40, 40, 40, cv2.BORDER_CONSTANT, value=[120, 120, 120])
        pad_center = (pad_img.shape[1] // 2, pad_img.shape[0] // 2)
        matrix = cv2.getRotationMatrix2D(pad_center, tilt_angle, 1.0)
        rotated = cv2.warpAffine(pad_img, matrix, (pad_img.shape[1], pad_img.shape[0]), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        noisy_img = rotated

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, noisy_img)
    print(f"[GEN] Generated plate image: {output_path} ({plate_text})")
    return output_path

def generate_all_test_plates():
    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "test_images")
    os.makedirs(base_dir, exist_ok=True)

    test_plates = [
        ("GJ01AB1234", "plate_clear_honda.jpg", False, False, 0.0),
        ("GJ05XY7865", "plate_stolen_i20.jpg", False, False, -2.5),
        ("MH12CD5678", "plate_clear_xuv700.jpg", False, False, 1.5),
        ("DL01EF9012", "plate_clear_taxi.jpg", False, True, 0.0),
        ("KA03GH3456", "plate_wanted_harrier.jpg", False, False, -1.0),
        ("GJ18PQ4521", "plate_ev_nexon.jpg", True, False, 0.0),
        ("22BH1234AA", "plate_bh_series.jpg", False, False, 0.0),
    ]

    for text, filename, is_ev, is_comm, tilt in test_plates:
        out_path = os.path.join(base_dir, filename)
        generate_indian_plate_image(text, out_path, is_ev=is_ev, is_commercial=is_comm, tilt_angle=tilt)

if __name__ == "__main__":
    generate_all_test_plates()
