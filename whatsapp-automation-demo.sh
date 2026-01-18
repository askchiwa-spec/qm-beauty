#!/bin/bash
# WhatsApp Automation Demo Script
# Demonstrates how to trigger automated WhatsApp messages

echo "🚀 WhatsApp Automation Demo"
echo "=========================="

# Configuration
API_BASE_URL="http://localhost:3000/api/whatsapp/automation"
SECRET="${WHATSAPP_AUTOMATION_SECRET:-demo-secret}"

echo "Using API Base URL: $API_BASE_URL"
echo ""

# Function to make API calls
make_api_call() {
    local action=$1
    echo "📋 Triggering action: $action"
    
    # Using curl to make the API call
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"action\":\"$action\",\"secret\":\"$SECRET\"}" \
        "$API_BASE_URL")
    
    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
}

# Health check first
echo "🔍 Health Check:"
health_response=$(curl -s "$API_BASE_URL")
echo "$health_response" | jq '.' 2>/dev/null || echo "$health_response"
echo ""

# Trigger cart follow-up
echo "🛒 Running Cart Follow-up:"
make_api_call "cart_followup"

# Trigger scheduled messages
echo "📅 Running Scheduled Messages:"
make_api_call "scheduled_messages"

# Run all automation tasks
echo "🔄 Running All Automation Tasks:"
make_api_call "all"

echo "✅ Demo completed!"
echo ""
echo "💡 Tips:"
echo "- Set WHATSAPP_AUTOMATION_SECRET environment variable for production"
echo "- Schedule this script to run hourly for automatic cart follow-ups"
echo "- Monitor logs for message delivery status"
echo "- Test with real phone numbers in development environment"