@echo off
setlocal EnableExtensions

rem Double-click this file to launch the Medical Portal on Windows.
rem It installs dependencies, opens the browser, and starts the portal.

cd /d "%~dp0"

set "PYTHON_CMD="
where py >nul 2>nul
if not errorlevel 1 set "PYTHON_CMD=py -3"
if not defined PYTHON_CMD (
    where python >nul 2>nul
    if not errorlevel 1 set "PYTHON_CMD=python"
)

if not defined PYTHON_CMD (
    echo Python 3 was not found on PATH.
    echo Install Python 3.8+ and try again.
    pause
    exit /b 1
)

for %%P in (3000 5050) do call :kill_port %%P

echo Installing portal dependencies...
call %PYTHON_CMD% -m pip install -r portal\requirements.txt -q
if errorlevel 1 goto :pip_failed

if exist "Handoff\handoff-tool\requirements.txt" (
    echo Installing Handoff Tool dependencies...
    call %PYTHON_CMD% -m pip install -r Handoff\handoff-tool\requirements.txt -q
    if errorlevel 1 goto :pip_failed
)

if exist "Admissions\package.json" (
    where npm >nul 2>nul
    if errorlevel 1 (
        echo Admissions source detected, but npm was not found. Using existing dist\ if available.
    ) else (
        echo Building Admissions...
        pushd Admissions
        call npm run build --silent
        if errorlevel 1 echo [admissions] Build failed - using last good dist\
        popd
    )
)

echo.
echo   ================================================
echo     Medical Portal - Starting all services...
echo   ================================================
echo.
echo   Portal:     http://localhost:3000
echo   Handoff:    managed (internal)
echo   Admissions: static (built-in)
echo.
echo   Press Ctrl+C in this window to stop everything.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:3000'"
call %PYTHON_CMD% portal\app.py
exit /b %errorlevel%

:kill_port
for /f "tokens=5" %%I in ('netstat -ano ^| findstr /R /C:":%~1 .*LISTENING"') do (
    echo   Cleaning up stale process on port %~1 ^(PID %%I^)...
    taskkill /PID %%I /F >nul 2>nul
)
exit /b 0

:pip_failed
echo Failed to install Python dependencies.
pause
exit /b 1
