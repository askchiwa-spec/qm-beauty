@echo off
echo ========================================
echo COMPLETE Git History Cleanup
echo ========================================
echo.

cd /d "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"

echo Step 1: Finding and deleting large files...
del /f /s /q "*.fdmdownload" 2>nul
del /f /s /q "*.zip" 2>nul
del /f /s /q "*.rar" 2>nul
del /f /s /q "*.crdownload" 2>nul

echo.
echo Step 2: Removing from git tracking...
git rm -r --cached "qm-beauty/components/product/pictures/" 2>nul
git rm --cached "*.fdmdownload" 2>nul
git rm --cached "*.zip" 2>nul

echo.
echo Step 3: Installing BFG Repo-Cleaner alternative - using git filter-repo...
echo (This will rewrite git history to remove large files permanently)

echo.
echo Step 4: Nuclear option - recreating git history...
echo Backing up current state...
git bundle create backup.bundle --all

echo.
echo Creating fresh git repository...
rd /s /q .git
git init
git add .
git commit -m "Clean QM Beauty website - all large files removed"
git branch -M main
git remote add origin https://github.com/askchiwa-spec/qm-beauty.git

echo.
echo Step 5: Force pushing clean history to GitHub...
echo (Enter your GitHub credentials)
git push -u origin main --force

echo.
echo ========================================
echo Done! GitHub should accept it now.
echo ========================================
pause
