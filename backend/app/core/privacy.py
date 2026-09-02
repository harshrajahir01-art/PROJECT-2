import re
from typing import Optional

def mask_owner_name(name: Optional[str]) -> Optional[str]:
    """
    Masks civilian vehicle owner names to prevent unauthorized privacy exposure.
    Example: 'Rajesh Kumar Patel' -> 'R****h K***r P***l'
    """
    if not name:
        return None
    words = name.strip().split()
    masked_words = []
    for word in words:
        if len(word) <= 2:
            masked_words.append(word[0] + "*")
        else:
            masked_words.append(word[0] + ("*" * (len(word) - 2)) + word[-1])
    return " ".join(masked_words)

def mask_phone_number(phone: Optional[str]) -> Optional[str]:
    """
    Masks contact numbers.
    Example: '+919876543210' -> '+91*****43210' or '9876543210' -> '98*****210'
    """
    if not phone:
        return None
    clean = re.sub(r"[^\d+]", "", phone)
    if len(clean) >= 10:
        return clean[:2] + ("*" * (len(clean) - 5)) + clean[-3:]
    return "*****"
