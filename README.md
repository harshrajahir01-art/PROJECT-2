# VehicleShield - Real-World Vehicle Identification & Stolen Vehicle Detection System

**VehicleShield** is a production-oriented, privacy-conscious vehicle identification and stolen vehicle detection platform designed specifically for real-world field operations (e.g., law enforcement checkpoints, highway patrols, gate security).

It pairs a high-performance **Mobile Scanning Application** with a real **OpenCV & EasyOCR Computer-Vision Pipeline**, an async **FastAPI Backend**, an encrypted **Relational Database**, and an interactive **Investigation Dashboard**.

---

## 🌟 Key Features

1. **Real Computer-Vision & OCR Pipeline (India-Specific)**:
   - OpenCV morphological edge detection and contour aspect-ratio filtering for plate localization.
   - 4-point perspective warp and deskewing for tilted/angled captures.
   - Contrast Limited Adaptive Histogram Equalization (CLAHE) & bilateral filtering for handling shadows, bright sunlight, and glare.
   - EasyOCR deep-learning text recognition engine with PyTesseract fallback.
   - Comprehensive Indian License Plate normalizer resolving OCR ambiguities (e.g., `0` vs `O`, `1` vs `I`, `8` vs `B`, `5` vs `S`) and validating standard State Codes, RTO district codes, and Bharat (BH) series formats.
   - Strict confidence thresholding (< 0.40 rejected with actionable retake guidance).

2. **Mobile Application (Field Officer App)**:
   - Full live camera viewport (`getUserMedia`) with targeting reticle HUD.
   - Real-time flashlight/torch control and front/rear camera switching.
   - Instant visual and audial status feedback:
     - **GREEN Banner**: `Vehicle Status: Clear` (Normal vehicle)
     - **RED Flashing Banner**: `🚨 ALERT: VEHICLE FLAGGED (STOLEN)` (High risk)
   - Displays Registration Number, Make/Model, Color, Risk Level, Detection Location, and Recommended Action.
   - Fallback photo upload & one-click synthetic test cases for offline/controlled demonstrations.

3. **Investigation & Admin Web Portal**:
   - Live KPI metric analytics (Total Scans, Flagged Vehicles, Active Alerts, Average OCR Confidence).
   - Interactive **Leaflet Movement / Observation Timeline Map**: Plots chronological checkpoint sightings with connecting trajectory lines.
   - Real-time Alert Triage Center: Acknowledge, triage, add dispatch notes, and mark resolved.
   - Vehicle Registry Management: Add vehicles, update stolen/flagged status, modify risk levels.
   - Immutable Compliance & Audit Trail: Tamper-evident logging of all logins, scans, and registry modifications.

4. **Privacy-by-Design & Security**:
   - Role-Based Access Control (`ADMIN`, `OPERATOR`, `AUDITOR`).
   - Vehicle owner personal identifiable information (PII) is masked (e.g. `R****h K***r P***l`) for regular field officers and only visible to authorized administrators.
   - Explicit location permission requirement.
   - Secure bcrypt password hashing and JWT authentication tokens.

---

## 📊 Controlled Synthetic Test Dataset

The system includes pre-seeded synthetic vehicle records and sample test plates:

| Plate Number | Status | Risk Level | Vehicle Details | Scenario / Location |
|---|---|---|---|---|
| `GJ01AB1234` | **CLEAR** | NONE | Honda City ZX, White | Regular civilian vehicle, clean record. |
| `GJ05XY7865` | **STOLEN** | HIGH | Hyundai i20, Red | Reported stolen in Surat (FIR #402/2026). Multiple observation sightings across Gujarat (Ahmedabad $\rightarrow$ Gandhinagar $\rightarrow$ Mehsana). |
| `MH12CD5678` | **CLEAR** | NONE | Mahindra XUV700, Black | Commercial IT transport fleet. |
| `DL01EF9012` | **CLEAR** | NONE | Maruti Dzire, Blue | Clear taxi vehicle. |
| `KA03GH3456` | **WANTED** | CRITICAL | Tata Harrier, Black | Wanted in hit-and-run incident (FIR #918/2026 Bengaluru). |
| `DL04JK9988` | **VIOLATIONS**| MEDIUM | Royal Enfield Classic 350 | Unpaid traffic warrants and challans. |
| `22BH1234AA` | **CLEAR** | NONE | Hyundai Creta, Silver | Bharat Series interstate vehicle. |

---

## 🚀 Quick Start & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose

### 1. Backend Setup & Run
```bash
# Set PYTHONPATH and install dependencies
cd project2
pip install -r backend/requirements.txt

# Run backend service
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- The backend will automatically create SQLite database tables and seed test records on first run.
- OpenAPI Swagger documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup & Run
```bash
cd project2/frontend
npm install
npm run dev
```
- Open your browser at `http://localhost:5173`.

### 3. Demo Credentials
| Role | Email | Password | Access Level |
|---|---|---|---|
| **Field Officer** | `officer@vehicleshield.gov` | `Officer@1234` | Mobile Scanner, Manual Check, History |
| **Chief Inspector (Admin)** | `admin@vehicleshield.gov` | `Admin@1234` | Full Portal, Registry CRUD, Map, Audit Logs |
| **Auditor** | `auditor@vehicleshield.gov` | `Auditor@1234` | Audit Logs, Read-Only Registry |

---

## 🧪 Running Automated Tests

Run the complete test suite:

```bash
# Set PYTHONPATH
$env:PYTHONPATH="backend"

# 1. Test Indian Plate Normalizer & Regex rules
python -m unittest backend/tests/test_normalizer.py

# 2. Test Computer Vision & OCR Pipeline on synthetic plates
python -m unittest backend/tests/test_cv_pipeline.py

# 3. Test API Auth, Scans, Alerts, and Endpoints
python -m unittest backend/tests/test_api.py
```

---

## 🐳 Docker Deployment

To launch the full stack with PostgreSQL, FastAPI, and Nginx:

```bash
docker-compose up --build -d
```

Services will run on:
- Frontend & Gateway: `http://localhost:80`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 📱 Mobile APK / PWA Deployment Instructions

1. **Progressive Web App (PWA) / Mobile Browser**:
   - Access `http://<your-server-ip>:5173/scan` from your mobile browser (Chrome / Safari / Firefox).
   - Tap **"Add to Home screen"** to install VehicleShield as a native-like fullscreen app with camera and GPS access.
2. **Capacitor Mobile APK**:
   ```bash
   cd frontend
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init VehicleShield com.vehicleshield.app
   npm run build
   npx cap add android
   npx cap copy
   npx cap open android
   # Build APK in Android Studio
   ```

---

## 🔒 Security & Privacy Architecture

- **No Public Scraping**: Operates exclusively against an authorized internal law enforcement database.
- **Observation Model**: Mobile scans represent single point-in-time observation events. Historical movements are plotted from discrete sightings rather than persistent tracking.
- **Encrypted Audit Logs**: Every scan, lookup, and record modification is recorded with timestamp, officer ID, IP address, and metadata.
