@echo off
cd /d "%~dp0"
set NODE="%~dp0..\..\..\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe"
if exist %NODE% (
  %NODE% serve.js
) else (
  node serve.js
)
