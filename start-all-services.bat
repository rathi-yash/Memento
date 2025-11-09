@echo off
echo ============================================================
echo Starting Memento Backend Services
echo ============================================================
echo.
echo This will open 3 terminal windows:
echo   1. Main Backend (port 8000)
echo   2. Speech API (port 8001)
echo   3. Face Recognition
echo.
echo Press CTRL+C in each window to stop the services
echo ============================================================
pause

REM Start Main Backend
start "Memento - Main Backend" cmd /k "cd /d %~dp0 && python main.py"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak

REM Start Speech API
start "Memento - Speech API" cmd /k "cd /d %~dp0 && python speech_api.py"

REM Wait 3 seconds for speech API to start
timeout /t 3 /nobreak

REM Start Face Recognition
start "Memento - Face Recognition" cmd /k "cd /d %~dp0 && python FaceRecognition.py"

echo.
echo ============================================================
echo All services started!
echo ============================================================
echo.
echo - Main Backend:        http://localhost:8000
echo - Speech API:          http://localhost:8001
echo - Face Recognition:    Running in separate window
echo.
echo To stop all services: Close each terminal window or press CTRL+C
echo ============================================================
pause
