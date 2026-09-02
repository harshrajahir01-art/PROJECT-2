import unittest
from app.cv.normalizer import normalize_indian_plate, clean_ocr_text

class TestIndianPlateNormalizer(unittest.TestCase):

    def test_clean_ocr_text(self):
        self.assertEqual(clean_ocr_text("GJ-01-AB-1234"), "GJ01AB1234")
        self.assertEqual(clean_ocr_text("mh 12 cd 5678"), "MH12CD5678")
        self.assertEqual(clean_ocr_text(" DL.01.EF.9012 "), "DL01EF9012")

    def test_standard_plate_normalization(self):
        plate, score, fmt = normalize_indian_plate("GJ01AB1234")
        self.assertEqual(plate, "GJ01AB1234")
        self.assertGreaterEqual(score, 0.85)
        self.assertEqual(fmt, "STANDARD_INDIAN")

    def test_slot_based_ocr_corrections(self):
        # Position 1-2 should be letters (0 -> O, 8 -> B)
        # Position 3-4 should be digits (O -> 0, I -> 1, B -> 8)
        # Position 5-6 should be letters (0 -> O)
        # Position 7-10 should be digits (O -> 0, I -> 1, S -> 5, B -> 8)
        
        # Test case 1: 'GJ O1 AB I234' with 'O' in RTO and 'I' in number
        plate, score, _ = normalize_indian_plate("GJ O1 AB I234")
        self.assertEqual(plate, "GJ01AB1234")

        # Test case 2: 'MH I2 CD 567B' with 'I' in RTO and 'B' in number
        plate, score, _ = normalize_indian_plate("MH I2 CD 567B")
        self.assertEqual(plate, "MH12CD5678")

        # Test case 3: 'DL 01 EF 9OIS' with 'O', 'I', 'S' in number
        plate, score, _ = normalize_indian_plate("DL 01 EF 9OIS")
        self.assertEqual(plate, "DL01EF9015")

    def test_bharat_series(self):
        plate, score, fmt = normalize_indian_plate("22BH1234AA")
        self.assertEqual(plate, "22BH1234AA")
        self.assertEqual(fmt, "BH_SERIES")

    def test_invalid_short_string(self):
        plate, score, fmt = normalize_indian_plate("GJ")
        self.assertIsNone(plate)
        self.assertEqual(score, 0.0)

if __name__ == "__main__":
    unittest.main()
