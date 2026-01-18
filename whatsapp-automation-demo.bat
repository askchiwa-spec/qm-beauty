@echo off
REM WhatsApp Automation Demo Script (Windows)
REM Demonstrates how to trigger automated WhatsApp messages

echo 🚀 WhatsApp Automation Demo
echo ==========================

REM Configuration
set API_BASE_URL=http://localhost:3000/api/whatsapp/automation
set SECRET=%WHATSAPP_AUTOMATION_SECRET%

REM Use demo secret if not set
if "%SECRET%"=="" set SECRET=demo-secret

echo Using API Base URL: %API_BASE_URL%
echo.

REM Health check first
echo 🔍 Health Check:
curl -s %API_BASE_URL%
echo.
echo.

REM Trigger cart follow-up
echo 🛒 Running Cart Follow-up:
curl -s -X POST ^
    -H "Content-Type: application/json" ^
    -d "{\"action\":\"cart_followup\",\"secret\":\"%SECRET%\"}" ^
    %API_BASE_URL%
echo.
echo.

REM Trigger scheduled messages
echo 📅 Running Scheduled Messages:
curl -s -X POST ^
    -H "Content-Type: application/json" ^
    -d "{\"action\":\"scheduled_messages\",\"secret\":\"%SECRET%\"}" ^
    %API_BASE_URL%
echo.
echo.

REM Run all automation tasks
echo 🔄 Running All Automation Tasks:
curl -s -X POST ^
    -H "Content-Type: application/json" ^
    -d "{\"action\":\"all\",\"secret\":\"%SECRET%\"}" ^
    %API_BASE_URL%
echo.
echo.

echo ✅ Demo completed!
echo.
echo 💡 Tips:
echo - Set WHATSAPP_AUTOMATION_SECRET environment variable for production
echo - Schedule this script to run hourly for automatic cart follow-ups
echo - Monitor logs for message delivery status
echo - Test with real phone numbers in development environment
pause