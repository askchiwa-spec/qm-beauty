@echo off
echo ========================================
echo Pushing QM Beauty to GitHub
echo ========================================
echo.

cd /d "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"

echo Step 1: Checking current branch...
git branch -M main

echo.
echo Step 2: Pushing to GitHub...
echo (You may need to enter your GitHub credentials)
echo Username: askchiwa-spec
echo Password: Use your GitHub Personal Access Token
echo.

git push -u origin main --force

echo.
echo ========================================
echo Done! Check the output above.
echo If successful, refresh GitHub and try Vercel again.
echo ========================================
pause
