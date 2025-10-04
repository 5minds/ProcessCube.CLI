@echo off
REM ProcessCube CLI - Windows Installer

echo 🚀 ProcessCube CLI Windows Installer
echo ====================================

set INSTALL_DIR=%USERPROFILE%\bin
set BINARY_NAME=pc.exe
set VERSION=latest
set BASE_URL=https://github.com/5minds/ProcessCube.CLI/releases/download

echo ✅ Detected platform: Windows x64
echo 📦 Binary to download: pc-win-x64.exe

REM Create install directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Download binary
echo ⬇️  Downloading ProcessCube CLI...
powershell -Command "Invoke-WebRequest -Uri '%BASE_URL%/%VERSION%/pc-win-x64.exe' -OutFile '%INSTALL_DIR%\%BINARY_NAME%'"

REM Test the binary
echo 🧪 Testing binary...
"%INSTALL_DIR%\%BINARY_NAME%" --version >nul

echo ✅ Installation complete!
echo 🎯 Installed to: %INSTALL_DIR%\%BINARY_NAME%

echo.
echo Add %INSTALL_DIR% to your PATH to use 'pc' command globally.
echo Or use the full path: %INSTALL_DIR%\%BINARY_NAME%
echo.
echo Usage:
echo   %INSTALL_DIR%\%BINARY_NAME% --help
echo   %INSTALL_DIR%\%BINARY_NAME% deploy-files process.bpmn
echo   %INSTALL_DIR%\%BINARY_NAME% list-process-models
echo.
echo 🎉 ProcessCube CLI is ready to use!

pause