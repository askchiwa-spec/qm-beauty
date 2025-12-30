@echo off
echo ========================================
echo Checking Git Status
echo ========================================
echo.

cd /d "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"

echo Current commit:
git log --oneline -3

echo.
echo Last push status:
git status

echo.
echo ========================================
echo Done
echo ========================================
pause
