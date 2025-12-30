@echo off
echo ========================================
echo Final Clean Push to GitHub
echo ========================================
echo.

cd /d "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"

echo Step 1: Deleting all backup and large files...
del /f /q "*.bundle" 2>nul
del /f /q "backup*.bundle" 2>nul

echo.
echo Step 2: Starting fresh git repository...
rd /s /q .git

echo.
echo Step 3: Initializing and committing...
git init
git add .
git commit -m "QM Beauty - Complete website with WhatsApp and Prisma integration"
git branch -M main
git remote add origin https://github.com/askchiwa-spec/qm-beauty.git

echo.
echo Step 4: Pushing to GitHub...
echo (Enter credentials when prompted)
echo.
git push -u origin main --force

echo.
echo ========================================
echo Done! Check if successful above.
echo ========================================
pause
