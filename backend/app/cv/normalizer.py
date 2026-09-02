import re
from typing import Tuple, Optional

# Indian State & Union Territory codes
INDIAN_STATE_CODES = {
    "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", 
    "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD", "MH", 
    "ML", "MN", "MP", "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", 
    "TN", "TR", "TS", "UK", "UP", "WB", "AN"
}

# OCR Confusion character mapping
CHAR_TO_DIGIT = {
    'O': '0', 'D': '0', 'Q': '0', 'U': '0',
    'I': '1', 'L': '1', 'T': '1', '|': '1',
    'Z': '2',
    'E': '3',
    'A': '4',
    'S': '5',
    'G': '6', 'b': '6',
    'B': '8',
    'g': '9', 'q': '9', 'P': '9'
}

DIGIT_TO_CHAR = {
    '0': 'O',
    '1': 'I',
    '2': 'Z',
    '3': 'E',
    '4': 'A',
    '5': 'S',
    '6': 'G',
    '8': 'B',
    '9': 'P'
}

def clean_ocr_text(text: str) -> str:
    """Removes all whitespaces, dashes, dots, and non-alphanumeric symbols."""
    if not text:
        return ""
    # Filter out non-alphanumeric
    cleaned = re.sub(r'[^A-Za-z0-9]', '', text).upper()
    return cleaned

def normalize_indian_plate(raw_text: str) -> Tuple[Optional[str], float, str]:
    """
    Normalizes and validates an Indian vehicle registration number using structural rules.
    Returns: (normalized_plate, format_validity_score, detected_format_type)
    """
    cleaned = clean_ocr_text(raw_text)
    if len(cleaned) < 6:
        return None, 0.0, "INVALID_TOO_SHORT"
    
    # 1. Check for Bharat (BH) series: e.g. 22BH1234AA or 21BH5678A
    bh_match = re.match(r'^([0-9OI]{2})(BH|8H)([0-9OISZB]{4})([A-Z0-9]{1,2})$', cleaned)
    if bh_match:
        yy, bh, num, series = bh_match.groups()
        yy = ''.join(CHAR_TO_DIGIT.get(c, c) for c in yy)
        bh = 'BH'
        num = ''.join(CHAR_TO_DIGIT.get(c, c) for c in num)
        series = ''.join(DIGIT_TO_CHAR.get(c, c) for c in series)
        normalized = f"{yy}{bh}{num}{series}"
        return normalized, 0.95, "BH_SERIES"

    # 2. Standard Indian Plate Format: [State(2 chars)][RTO(1-2 digits)][Series(1-3 chars)][Number(4 digits)]
    # Example: GJ01AB1234, MH12CD5678, DL1C1234, KA03GH3456
    # Let's perform slot-based correction if length is 9 or 10
    if 8 <= len(cleaned) <= 11:
        # Step A: First 2 chars -> State Code (Alphabet only)
        state_part = cleaned[:2]
        fixed_state = ''.join(DIGIT_TO_CHAR.get(c, c) for c in state_part)
        
        # If not in state codes, try checking closest match
        if fixed_state not in INDIAN_STATE_CODES:
            # Maybe the state code had a typo
            pass
        
        rest = cleaned[2:]
        
        # Step B: Identify the 4-digit trailing number (last 4 characters)
        last_4 = rest[-4:]
        fixed_last_4 = ''.join(CHAR_TO_DIGIT.get(c, c) for c in last_4)
        
        # Step C: Middle segment (RTO code + Series)
        middle = rest[:-4]
        
        # Usually RTO code is 1-2 digits and series is 1-3 letters
        # Let's partition middle into digits then letters
        # Find transition from digits to letters
        rto_digits = []
        series_chars = []
        
        # Typical pattern: 2 digits RTO, 1-2 letters series
        if len(middle) == 3: # e.g. '1AB' or '01A'
            # Try 2 digits + 1 letter or 1 digit + 2 letters
            if middle[0].isdigit() and middle[1].isdigit():
                rto_digits = [CHAR_TO_DIGIT.get(c, c) for c in middle[:2]]
                series_chars = [DIGIT_TO_CHAR.get(c, c) for c in middle[2:]]
            else:
                rto_digits = [CHAR_TO_DIGIT.get(c, c) for c in middle[:1]]
                series_chars = [DIGIT_TO_CHAR.get(c, c) for c in middle[1:]]
        elif len(middle) == 4: # e.g. '01AB' or '12CD'
            rto_digits = [CHAR_TO_DIGIT.get(c, c) for c in middle[:2]]
            series_chars = [DIGIT_TO_CHAR.get(c, c) for c in middle[2:]]
        elif len(middle) == 2: # e.g. '1A' or '01'
            if middle.isdigit():
                rto_digits = [CHAR_TO_DIGIT.get(c, c) for c in middle]
                series_chars = []
            else:
                rto_digits = [CHAR_TO_DIGIT.get(middle[0], middle[0])]
                series_chars = [DIGIT_TO_CHAR.get(middle[1], middle[1])]
        elif len(middle) == 5: # e.g. '01ABC'
            rto_digits = [CHAR_TO_DIGIT.get(c, c) for c in middle[:2]]
            series_chars = [DIGIT_TO_CHAR.get(c, c) for c in middle[2:]]
        else:
            # Fallback direct pass
            rto_digits = [CHAR_TO_DIGIT.get(c, c) for c in middle]
            series_chars = []

        fixed_rto = ''.join(rto_digits)
        fixed_series = ''.join(series_chars)
        
        normalized = f"{fixed_state}{fixed_rto}{fixed_series}{fixed_last_4}"
        
        # Validate format using Standard Indian Regex
        standard_regex = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$'
        if re.match(standard_regex, normalized):
            score = 0.90 if fixed_state in INDIAN_STATE_CODES else 0.70
            return normalized, score, "STANDARD_INDIAN"
    
    # 3. Fallback General Regex Check
    general_match = re.search(r'([A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{4})', cleaned)
    if general_match:
        norm = clean_ocr_text(general_match.group(1))
        return norm, 0.65, "REGEX_FALLBACK"

    # If all structure matches fail, return cleaned text with low confidence
    return cleaned, 0.30, "UNSTRUCTURED"
