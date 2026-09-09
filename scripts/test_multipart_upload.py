import urllib.request
import uuid
import json
import cv2
import numpy as np

# Create test image
img = np.zeros((150, 400, 3), dtype=np.uint8)
img[:] = (255, 255, 255)
cv2.rectangle(img, (10, 10), (390, 140), (0, 0, 0), 4)
cv2.putText(img, 'MH12CD4455', (30, 95), cv2.FONT_HERSHEY_SIMPLEX, 1.6, (0, 0, 0), 4)
_, buf = cv2.imencode('.jpg', img)

boundary = '----WebKitFormBoundary' + uuid.uuid4().hex
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="test_plate.jpg"\r\n'
    f'Content-Type: image/jpeg\r\n\r\n'
).encode('utf-8') + buf.tobytes() + f'\r\n--{boundary}--\r\n'.encode('utf-8')

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/scan',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)
res = urllib.request.urlopen(req)
data = json.loads(res.read())
print('Upload response:', data['success'], data['registration_number'], data['saved_to_registry'])
