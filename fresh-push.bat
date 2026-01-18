@echo off
echo ========================================
echo Fresh Git Push - QM Beauty
echo ========================================
echo.

cd /d "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"

echo Step 1: Backing up current git...
git bundle create backup-before-fresh-push.bundle --all 2>nul

echo.
echo Step 2: Deleting .git folder and starting fresh...
rd /s /q .git

echo.
echo Step 3: Initializing fresh repository...
git init
git add .
git commit -m "QM Beauty - Complete website with WhatsApp integration"
git branch -M main

echo.
echo Step 4: Connecting to GitHub...
git remote add origin https://github.com/askchiwa-spec/qm-beauty.git

echo.
echo Step 5: Pushing to GitHub (fresh history, no large files)...
echo.
echo Enter your GitHub credentials:
echo Username: askchiwa-spec
echo Password: [Your GitHub Personal Access Token]
echo.
git push -u origin main --force

echo.
echo ========================================
echo Push complete! Check output above.
echo If successful, go to Vercel and import!
echo ========================================
echo.
pause
