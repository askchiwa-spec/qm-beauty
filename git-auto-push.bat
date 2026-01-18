@echo off
REM Auto-push script for QM Beauty - Pushes all changes to GitHub
cd /d "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"

echo Adding all changes...
git add -A

echo Creating commit with timestamp...
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
git commit -m "Auto-update: %timestamp%"

echo Pushing to GitHub...
git push origin main

echo Done!
