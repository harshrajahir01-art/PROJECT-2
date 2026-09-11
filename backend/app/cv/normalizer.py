import re
from typing import Tuple, Optional, Set, Dict

# Indian State & Union Territory codes
INDIAN_STATE_CODES = {
    "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", 
    "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD", "MH", 
    "ML", "MN", "MP", "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", 
    "TN", "TR", "TS", "UK", "UP", "WB", "AN"
}

# Cache of official RTO codes per state
VALID_RTOS_BY_STATE: Dict[str, Set[str]] = {}

def _init_rto_cache():
    global VALID_RTOS_BY_STATE
    if not VALID_RTOS_BY_STATE:
        try:
            from app.seed.rto_data import RTO_OFFICES_DATA
            for rto in RTO_OFFICES_DATA:
                st = rto.get("state_code", "")
                code = rto.get("rto_code", "").replace("-", "")[2:]
                if st and code:
                    VALID_RTOS_BY_STATE.setdefault(st, set()).add(code)
        except Exception:
            pass

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
    """Removes non-plate words, dealer text, HSRP hologram labels, and non-alphanumeric noise."""
    if not text:
        return ""
    t = re.sub(
        r'\b(IND|INDIA|BHARAT|GOVT|POLICE|HYUNDAI|SUZUKI|HONDA|TATA|MAHINDRA|TOYOTA|MALAD|MOTORS|COMM|CAR|DEALER)\b',
        ' ',
        text,
        flags=re.IGNORECASE
    )
    cleaned = re.sub(r'[^A-Za-z0-9]', '', t).upper()
    if cleaned.startswith("IND") and len(cleaned) >= 11:
        cleaned = cleaned[3:]
    if cleaned.endswith("IND") and len(cleaned) >= 11:
        cleaned = cleaned[:-3]
    return cleaned

def normalize_indian_plate(raw_text: str) -> Tuple[Optional[str], float, str]:
    """
    Normalizes and validates an Indian vehicle registration number using structural rules,
    exhaustive OCR confusion resolution, authoritative RTO matching, and MoRTH BH rules.
    Returns: (normalized_plate, format_validity_score, detected_format_type)
    """
    if not raw_text:
        return None, 0.0, "EMPTY"

    _init_rto_cache()

    # --- Step 1: Check for Bharat (BH) Series ---
    # Pattern: [2-digit year][BH code][4-digit number][1-2 letters]
    # BH code can be read as BH, 8H, B4, 84, BA, 8A
    bh_pattern = r'([0-9OI7Z]{2})\s*(?:BH|8H|B4|84|BA|8A)\s*([0-9OISZBG]{4})\s*([A-Z0-9]{1,2})'
    m_bh = re.search(bh_pattern, raw_text, re.IGNORECASE)
    if m_bh:
        yy_raw, num_raw, ser_raw = m_bh.groups()
        yy = "".join(CHAR_TO_DIGIT.get(c, c) for c in yy_raw)
        # Fix year: 73 -> 23, 71 -> 21, 72 -> 22, etc.
        if len(yy) == 2 and yy[0] in ('7', 'Z'):
            yy = '2' + yy[1]
        num = "".join(CHAR_TO_DIGIT.get(c, c) for c in num_raw)
        ser = "".join(DIGIT_TO_CHAR.get(c, c) for c in ser_raw)

        # In current BH series, letters run from A-Z (single letter). Exclude border noise if letter is doubled
        if len(ser) == 2 and ser[0].isalpha():
            ser_cand = ser[0]
        else:
            ser_cand = ser

        # MoRTH Rule G.S.R. 594(E): Letters I and O are strictly prohibited in BH series suffix
        if yy.isdigit() and len(yy) == 2 and num.isdigit() and len(num) == 4 and ser_cand.isalpha() and ser_cand not in ('I', 'O'):
            native_digits = sum(1 for c in num_raw if c.isdigit())
            is_exact = (yy_raw == yy and num_raw == num and ser_raw == ser_cand)
            score = 0.99 if is_exact else (0.88 + (0.025 * native_digits))
            return f"{yy}BH{num}{ser_cand}", score, "BH_SERIES"

    # --- Step 2: Tokenize and extract standard plate candidates ---
    tokens = re.findall(r'[A-Za-z0-9]+', raw_text)
    pairs = [f"{tokens[i]}{tokens[i+1]}" for i in range(len(tokens)-1)]
    cleaned_all = clean_ocr_text(raw_text)
    all_candidates = tokens + pairs + ([cleaned_all] if cleaned_all else [])

    best_plate = None
    best_score = -1.0
    best_type = "UNRESOLVED"

    for cand in all_candidates:
        cand_clean = clean_ocr_text(cand)
        if len(cand_clean) < 8 or len(cand_clean) > 13:
            continue

        # Look for State Code
        for i in range(len(cand_clean) - 7):
            state_sub = cand_clean[i:i+2]
            fixed_state = "".join(DIGIT_TO_CHAR.get(c, c) for c in state_sub)
            if fixed_state in INDIAN_STATE_CODES:
                sub = cand_clean[i:]
                for length in [10, 9, 11, 8]:
                    if len(sub) >= length:
                        target = sub[:length]
                        last_4 = target[-4:]
                        fixed_num = "".join(CHAR_TO_DIGIT.get(c, c) for c in last_4)
                        if not fixed_num.isdigit():
                            continue

                        middle = target[2:-4]
                        if not middle:
                            continue

                        for rto_len in [2, 1]:
                            if len(middle) >= rto_len:
                                rto_raw = middle[:rto_len]
                                ser_raw = middle[rto_len:]

                                # RTO options: L -> 4 or 1, Z -> 2, etc.
                                rto_opts = [""]
                                for char in rto_raw:
                                    next_opts = []
                                    for opt in rto_opts:
                                        if char.isdigit():
                                            next_opts.append(opt + char)
                                        else:
                                            d1 = CHAR_TO_DIGIT.get(char, char)
                                            next_opts.append(opt + d1)
                                            if char in ('L', 'A', 'H'):
                                                next_opts.append(opt + '4')
                                            if char in ('Z', 'S'):
                                                next_opts.append(opt + '2')
                                    rto_opts = next_opts

                                valid_rtos = VALID_RTOS_BY_STATE.get(fixed_state, set())
                                best_rto = None
                                for r_cand in rto_opts:
                                    r_fmt = r_cand.zfill(2)
                                    if r_fmt in valid_rtos:
                                        best_rto = r_fmt
                                        break
                                if not best_rto and rto_opts:
                                    best_rto = rto_opts[0].zfill(2)

                                ser_fixed = "".join(DIGIT_TO_CHAR.get(c, c) for c in ser_raw)
                                if best_rto and best_rto.isdigit() and (not ser_fixed or ser_fixed.isalpha()):
                                    full_plate = f"{fixed_state}{best_rto}{ser_fixed}{fixed_num}"
                                    # Exact format without substitution gets highest confidence
                                    score = 0.99 if (target == full_plate) else 0.90
                                    if score > best_score:
                                        best_score = score
                                        best_plate = full_plate
                                        best_type = "STANDARD_INDIAN"

    if best_plate:
        return best_plate, best_score, best_type

    # --- Step 3: Fallback regex search ---
    general_match = re.search(r'([A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{4})', cleaned_all)
    if general_match:
        norm = clean_ocr_text(general_match.group(1))
        return norm, 0.70, "REGEX_FALLBACK"

    return cleaned_all if len(cleaned_all) >= 6 else None, 0.30, "UNSTRUCTURED"
