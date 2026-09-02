@echo off
echo Starting VehicleShield FastAPI Backend & AI Service...
set PYTHONPATH=backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
