import os
import unittest
import cv2
from app.cv.pipeline import cv_pipeline

class TestCVPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.test_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "test_images")

    def test_plate_clear_honda(self):
        img_path = os.path.join(self.test_dir, "plate_clear_honda.jpg")
        if not os.path.exists(img_path):
            self.skipTest("Test image not found")
        
        img = cv2.imread(img_path)
        result = cv_pipeline.process_image(img)
        self.assertTrue(result["success"])
        self.assertEqual(result["registration_number"], "GJ01AB1234")
        self.assertGreaterEqual(result["ocr_confidence"], 0.40)

    def test_plate_stolen_i20(self):
        img_path = os.path.join(self.test_dir, "plate_stolen_i20.jpg")
        if not os.path.exists(img_path):
            self.skipTest("Test image not found")
        
        img = cv2.imread(img_path)
        result = cv_pipeline.process_image(img)
        self.assertTrue(result["success"])
        self.assertEqual(result["registration_number"], "GJ05XY7865")

    def test_plate_clear_xuv700(self):
        img_path = os.path.join(self.test_dir, "plate_clear_xuv700.jpg")
        if not os.path.exists(img_path):
            self.skipTest("Test image not found")
        
        img = cv2.imread(img_path)
        result = cv_pipeline.process_image(img)
        self.assertTrue(result["success"])
        self.assertEqual(result["registration_number"], "MH12CD5678")

    def test_plate_wanted_harrier(self):
        img_path = os.path.join(self.test_dir, "plate_wanted_harrier.jpg")
        if not os.path.exists(img_path):
            self.skipTest("Test image not found")
        
        img = cv2.imread(img_path)
        result = cv_pipeline.process_image(img)
        self.assertTrue(result["success"])
        self.assertEqual(result["registration_number"], "KA03GH3456")

if __name__ == "__main__":
    unittest.main()
