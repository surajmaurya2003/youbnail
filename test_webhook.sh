#!/bin/bash

# DodoPayments Webhook Testing Script
# This script helps test your webhook integration

echo "🧪 DodoPayments Webhook Testing Script"
echo "========================================"
echo ""

# Configuration
WEBHOOK_URL="https://wawfgjzpwykvjgmuaueb.supabase.co/functions/v1/dodo-webhook"
WEBHOOK_SECRET="whsec_dggt+3Ed7+IjsOWJOL0vQkvZvSAIlNXL"

echo "📍 Webhook URL: $WEBHOOK_URL"
echo "🔐 Webhook Secret: ${WEBHOOK_SECRET:0:20}..."
echo ""

# Test 1: Check if webhook endpoint is accessible
echo "Test 1: Checking webhook endpoint accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$WEBHOOK_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Webhook endpoint is accessible (HTTP $HTTP_CODE)"
else
    echo "❌ Webhook endpoint returned HTTP $HTTP_CODE"
    echo "   Expected: 200"
fi
echo ""

# Test 2: Send a test subscription.active event
echo "Test 2: Sending test subscription.active event..."
TEST_PAYLOAD='{
  "type": "subscription.active",
  "data": {
    "subscription_id": "sub_test_123",
    "product_id": "pdt_0NWhJkEv6LSnQGtBixl57",
    "customer_id": "cus_test_123",
    "metadata": {
      "user_id": "test-user-id-123",
      "plan_id": "starter",
      "billing_period": "monthly"
    },
    "amount": 2000,
    "currency": "USD"
  }
}'

echo "Payload:"
echo "$TEST_PAYLOAD" | jq '.'
echo ""

# Calculate signature (simplified - you may need to adjust based on DodoPayments format)
SIGNATURE=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | base64)

echo "Calculated Signature: ${SIGNATURE:0:30}..."
echo ""

RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-dodo-signature: v1,$SIGNATURE" \
  -d "$TEST_PAYLOAD")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 3: Check Supabase function logs
echo "Test 3: Fetching recent webhook logs..."
echo "Run this command to see logs:"
echo "  supabase functions logs dodo-webhook --limit 10"
echo ""

# Test 4: Verify webhook configuration
echo "Test 4: Webhook Configuration Checklist"
echo "----------------------------------------"
echo ""
echo "Please verify the following in DodoPayments Dashboard:"
echo "  1. Webhook URL is set to: $WEBHOOK_URL"
echo "  2. Webhook secret matches your environment variable"
echo "  3. Following events are subscribed:"
echo "     - payment.cancelled"
echo "     - payment.failed"
echo "     - payment.succeeded"
echo "     - subscription.active"
echo "     - subscription.cancelled"
echo "     - subscription.expired"
echo "     - subscription.failed"
echo "     - subscription.plan_changed"
echo "     - subscription.renewed"
echo "     - subscription.updated"
echo ""

echo "🎯 Next Steps:"
echo "1. Check the logs in Supabase dashboard"
echo "2. If signature verification fails, check the secret"
echo "3. Make a real test payment to verify end-to-end flow"
echo ""

echo "✨ Done!"
