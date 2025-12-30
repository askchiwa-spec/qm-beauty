@echo off
echo ========================================
echo Cleaning up large files from Git history
echo ========================================
echo.

cd /d "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"

echo Step 1: Removing large file from git history...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch 'qm-beauty/components/product/pictures/drive-download-20251227T161915Z-3-001.zip.fdmdownload'" --prune-empty --tag-name-filter cat -- --all

echo.
echo Step 2: Cleaning up...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Step 3: Force pushing to GitHub...
echo (Enter your GitHub credentials when prompted)
git push -u origin main --force

echo.
echo ========================================
echo Done! Check if push succeeded above.
echo ========================================
pause
