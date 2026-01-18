@echo off
echo ========================================
echo QM BEAUTY BACKEND - INSTALLATION SCRIPT
echo ========================================
echo.

cd /d "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"

echo [1/5] Installing backend dependencies...
call npm install @prisma/client @supabase/supabase-js prisma --save

echo.
echo [2/5] Generating Prisma client...
call npx prisma generate

echo.
echo [3/5] Creating .env.local file (if not exists)...
if not exist .env.local (
    copy .env.local.example .env.local
    echo Created .env.local - Please edit with your credentials
) else (
    echo .env.local already exists - skipping
)

echo.
echo [4/5] Installation complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Edit .env.local with your credentials
echo 2. Run: npx prisma db push
echo 3. Run: npm run dev
echo 4. Test API: http://localhost:3001/api/cart/create
echo.
echo See BACKEND_SETUP.md for full documentation
echo ========================================

pause
