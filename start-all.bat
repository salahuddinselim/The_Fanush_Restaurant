@echo off
title The Fanus Restaurant Full-Stack
echo ==========================================================
echo Starting The Fanus Restaurant Backend and Frontend...
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:4200 (Mobile-Ready)
echo ==========================================================
set ADMIN_INIT_PASSWORD=FanusAdmin123!
cd backend
python seed.py
echo CMS login: admin / FanusAdmin123!
start "Fanus API (Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
cd /d "%~dp0frontend"
npm start
