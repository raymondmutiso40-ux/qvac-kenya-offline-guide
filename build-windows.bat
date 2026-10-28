@echo off
setlocal
title Build QVAC Offline AI App
echo ===========================================
echo   QVAC - Kenya Public Service Guide + AI
echo   Windows EXE builder
echo ===========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Install Node.js 22.21+ LTS from https://nodejs.org/
  pause
  exit /b 1
)
node -e "const v=process.versions.node.split('.').map(Number); if(v[0]<22 || (v[0]===22 && v[1]<17)) process.exit(1)"
if errorlevel 1 (
  echo QVAC SDK needs Node.js 22.17 or newer. Install Node.js 22.21+ LTS.
  pause
  exit /b 1
)
echo Installing QVAC SDK and desktop build tools...
call npm install
if errorlevel 1 (
  echo npm install failed. Check internet access and try again.
  pause
  exit /b 1
)
echo.
echo Building Windows installer and portable EXE...
call npm run build:win
if errorlevel 1 (
  echo Build failed. Check the error above.
  echo QVAC local inference on Windows requires Vulkan 1.4 support and compatible GPU drivers.
  pause
  exit /b 1
)
echo.
echo SUCCESS! Look inside the dist folder for the QVAC EXE files.
explorer "%~dp0dist"
pause
