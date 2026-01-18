@echo off
echo ========================================
echo QM BEAUTY - EVOLUTION API SETUP
echo ========================================
echo.
echo This script will:
echo  1. Start Evolution API Docker container
echo  2. Create WhatsApp instance
echo  3. Display QR code for connection
echo.
pause

echo.
echo [1/3] Starting Evolution API...
docker-compose -f docker-compose.evolution.yml up -d

echo.
echo Waiting for Evolution API to start...
timeout /t 10 /nobreak

echo.
echo [2/3] Creating WhatsApp instance...
curl -X POST http://localhost:8080/instance/create ^
  -H "Content-Type: application/json" ^
  -H "apikey: change-me-to-strong-password" ^
  -d "{\"instanceName\":\"qm-beauty\",\"qrcode\":true,\"integration\":\"WHATSAPP-BAILEYS\"}"

echo.
echo.
echo [3/3] Getting QR code...
echo.
echo IMPORTANT: Open this URL in your browser to see the QR code:
echo http://localhost:8080/instance/qrcode/qm-beauty
echo.
echo Then scan it with WhatsApp:
echo  1. Open WhatsApp on your phone
echo  2. Go to Settings ^> Linked Devices
echo  3. Tap "Link a Device"
echo  4. Scan the QR code from the browser
echo.

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Evolution API is running on: http://localhost:8080
echo.
echo Next steps:
echo  1. Open http://localhost:8080/instance/qrcode/qm-beauty in browser
echo  2. Scan QR code with WhatsApp
echo  3. Edit .env.local and set USE_EVOLUTION_API="true"
echo  4. Start your Next.js app: npm run dev
echo.
echo To check status later:
echo   docker logs qm-beauty-whatsapp
echo.
echo To stop Evolution API:
echo   docker-compose -f docker-compose.evolution.yml down
echo.
pause
