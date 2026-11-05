@echo off
setlocal
cd /d "%~dp0"
title DRIP ORIGIN - local preview

echo.
echo ======================================================
echo   DRIP / ORIGIN - starting local website
 echo ======================================================
echo.
where node >nul 2>nul
if errorlevel 1 goto NO_NODE
where npm >nul 2>nul
if errorlevel 1 goto NO_NPM
if exist node_modules\next\dist\bin\next goto READY
 echo Installing npm dependencies. Internet required once.
call npm install
if errorlevel 1 goto FAILED
:READY
 echo.
echo Local site: http://localhost:3000
echo DO NOT CLOSE THIS WINDOW while using the site.
start "" "http://localhost:3000"
call npm run dev
if errorlevel 1 goto FAILED
goto END
:NO_NODE
 echo ERROR: Node.js was not found.
echo Download Node.js LTS from https://nodejs.org
 goto END
:NO_NPM
 echo ERROR: npm was not found. Reinstall Node.js LTS.
 goto END
:FAILED
 echo.
echo ERROR: A command failed. Read the messages above.
echo You can also run: npm install ^&^& npm run dev
:END
echo.
pause
endlocal
