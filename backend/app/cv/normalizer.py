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
    """Removes all whitespaces, dashes, dots, and non-alphanumeric symbols, and strips IND / INDIA."""
    if not text:
        return ""
    # Strip common non-plate words from HSRP plates and dealer frames
    t = re.sub(r'\b(IND|INDIA|BHARAT|GOVT|POLICE)\b', ' ', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'[^A-Za-z0-9]', '', t).upper()
    
    # Also strip prefix/suffix IND if attached
    if cleaned.startswith("IND") and len(cleaned) >= 11:
        cleaned = cleaned[3:]
    if cleaned.endswith("IND") and len(cleaned) >= 11:
        cleaned = cleaned[:-3]
        
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
    bh_match = re.search(r'([0-9OI]{2})(BH|8H)([0-9OISZB]{4})([A-Z0-9]{1,2})', cleaned)
    if bh_match:
        yy, bh, num, series = bh_match.groups()
        yy = ''.join(CHAR_TO_DIGIT.get(c, c) for c in yy)
        bh = 'BH'
        num = ''.join(CHAR_TO_DIGIT.get(c, c) for c in num)
        series = ''.join(DIGIT_TO_CHAR.get(c, c) for c in series)
        normalized = f"{yy}{bh}{num}{series}"
        return normalized, 0.95, "BH_SERIES"

    # 2. Extract potential plate candidate if extra text surrounds it (e.g. dealer frames or IND)
    target = cleaned
    if len(cleaned) > 10:
        # Search for known 2-letter state code position (including OCR-confused digits like 6J -> GJ)
        for i in range(len(cleaned) - 7):
            candidate_state = cleaned[i:i+2]
            fixed_cand = ''.join(DIGIT_TO_CHAR.get(c, c) for c in candidate_state)
            if fixed_cand in INDIAN_STATE_CODES:
                target = fixed_cand + cleaned[i+2:i+10]
                break

    # 3. Standard Indian Plate Format: [State(2 chars)][RTO(1-2 digits)][Series(1-3 chars)][Number(4 digits)]
    # Example: GJ01AB1234, MH12CD5678, DL1C1234, KA03GH3456
    if 8 <= len(target) <= 11:
        # Step A: First 2 chars -> State Code (Alphabet only)
        state_part = target[:2]
        fixed_state = ''.join(DIGIT_TO_CHAR.get(c, c) for c in state_part)
        
        rest = target[2:]
        
        # Step B: Identify the 4-digit trailing number (last 4 characters)
        last_4 = rest[-4:]
        fixed_last_4 = ''.join(CHAR_TO_DIGIT.get(c, c) for c in last_4)
        
        # Step C: Middle segment (RTO code + Series)
        middle = rest[:-4]
        
        rto_digits = []
        series_chars = []
        
        if len(middle) == 3: # e.g. '1AB' or '01A'
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
            rto_digits = [CHAR_TO_DIGIT.get(c, c) for c in middle]
            series_chars = []

        fixed_rto = ''.join(rto_digits)
        fixed_series = ''.join(series_chars)
        
        normalized = f"{fixed_state}{fixed_rto}{fixed_series}{fixed_last_4}"
        
        # Validate format using Standard Indian Regex
        standard_regex = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$'
        if re.match(standard_regex, normalized):
            score = 0.92 if fixed_state in INDIAN_STATE_CODES else 0.75
            return normalized, score, "STANDARD_INDIAN"
    
    # 4. Fallback General Regex Check
    general_match = re.search(r'([A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{4})', cleaned)
    if general_match:
        norm = clean_ocr_text(general_match.group(1))
        return norm, 0.70, "REGEX_FALLBACK"

    # If all structure matches fail, return cleaned text with low confidence
    return cleaned, 0.30, "UNSTRUCTURED"
