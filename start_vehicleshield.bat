@echo off
title VehicleShield System Launcher
echo ===================================================
echo   VehicleShield: Real-World Vehicle Detection System
echo ===================================================
echo.
echo Starting Backend (FastAPI + AI Engine on Port 8000)...
start "VehicleShield Backend API" cmd /k "set PYTHONPATH=backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Frontend (Vite UI on Port 5173)...
start "VehicleShield Frontend" cmd /k "cd frontend && npm.cmd run dev -- --host 0.0.0.0 --port 5173"

echo.
echo ===================================================
echo   Both services are launching!
echo   Frontend URL: http://localhost:5173
echo   Backend API:  http://localhost:8000/docs
echo ===================================================
echo.
timeout /t 5
start http://localhost:5173
