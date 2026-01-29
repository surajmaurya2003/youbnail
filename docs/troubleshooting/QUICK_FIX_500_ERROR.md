# 🔧 Quick Fix: 500 Error After API URL Update

## ⚠️ Important: You Must Redeploy!

After updating the API URL in the code, **you MUST redeploy the function** for changes to take effect.

---

## Step 1: Redeploy the Function

Run this command in your terminal:

```bash
supabase functions deploy create-checkout --no-verify-jwt
```

**Expected output:**
```
Deployed Functions on project YOUR_PROJECT_REF: create-checkout
You can inspect your deployment in the Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions
```

---

## Step 2: Check the Logs

After redeploying, test again and check logs:

1. **Go to:** Supabase Dashboard → Edge Functions → `create-checkout` → Logs
2. **Look for:**
   - ✅ "Calling DodoPayments API at: https://test.dodopayments.com" (should show correct URL now)
   - ❌ Any new error messages

---

## Step 3: Common Errors After Fix

### If you still see DNS error:
- ✅ Verify you redeployed after the code change
- ✅ Check logs show the new URL (`test.dodopayments.com` not `api.dodopayments.com`)

### If you see "401 Unauthorized":
- ✅ Check `DODO_API_KEY` secret is set correctly
- ✅ Verify API key is valid in DodoPayments dashboard

### If you see "404 Not Found":
- ✅ The endpoint path might be wrong
- ✅ Check DodoPayments documentation for correct endpoint

### If you see "400 Bad Request":
- ✅ Check request body format matches DodoPayments API
- ✅ Verify product IDs are correct

---

## Step 4: Verify Secrets Are Set

Go to: **Supabase Dashboard → Edge Functions → Settings → Secrets**

Make sure these are all set:
- ✅ `DODO_API_KEY`
- ✅ `DODO_PRODUCT_STARTER_MONTHLY`
- ✅ `DODO_PRODUCT_STARTER_ANNUAL`
- ✅ `DODO_PRODUCT_PRO_MONTHLY`
- ✅ `DODO_PRODUCT_PRO_ANNUAL`
- ✅ `APP_URL`
- ✅ `SERVICE_ROLE_KEY`
- ✅ `SUPABASE_URL` (optional, but safe to add)

---

## What Changed

The function now uses:
- **Test mode:** `https://test.dodopayments.com/v1/checkout/sessions` (default)
- **Live mode:** `https://live.dodopayments.com/v1/checkout/sessions` (if `DODO_API_MODE=live`)

**Before:** `https://api.dodopayments.com` ❌ (doesn't exist)
**After:** `https://test.dodopayments.com` ✅ (correct)

---

## Next Steps

1. ✅ Redeploy: `supabase functions deploy create-checkout --no-verify-jwt`
2. ✅ Test checkout flow again
3. ✅ Check logs for new error (if any)
4. ✅ Share the new error message if still failing
