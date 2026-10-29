@echo off
title CrystalSpace Runner
cls
echo ========================================================
echo               CrystalSpace Ecosystem Runner             
echo ========================================================
echo.

echo [1/2] Launching Go Backend API (http://localhost:8080)...
start "CrystalSpace - Backend API" cmd /k "cd /d "%~dp0Backend" && go run ./cmd/api"

echo [2/2] Launching React Vite Frontend (http://localhost:5173)...
start "CrystalSpace - Frontend Web" cmd /k "cd /d "%~dp0Frontend\web" && npm run dev"

echo.
echo ========================================================
echo  Both services are running in their respective windows!
echo    Backend API:  http://localhost:8080/health
echo    Frontend Web: http://localhost:5173
echo ========================================================
echo.
echo You can close this launcher window anytime.
pause
