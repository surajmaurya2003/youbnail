# Edge Function Environment Variables Setup

## ⚠️ Important Note

**Edge Functions DO NOT use `.env` files!** Environment variables for Edge Functions must be set in the **Supabase Dashboard**.

---

## Required Environment Variables for `create-checkout` Function

Set these in **Supabase Dashboard → Edge Functions → Settings → Secrets**:

### DodoPayments Configuration
- `DODO_API_KEY` - Your DodoPayments API key (test or live)
- `DODO_PRODUCT_STARTER_MONTHLY` - Product ID for Starter Monthly plan
- `DODO_PRODUCT_STARTER_ANNUAL` - Product ID for Starter Annual plan
- `DODO_PRODUCT_PRO_MONTHLY` - Product ID for Pro Monthly plan
- `DODO_PRODUCT_PRO_ANNUAL` - Product ID for Pro Annual plan

### App Configuration
- `APP_URL` - Your app's base URL
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

### Supabase Configuration
- `SUPABASE_URL` - Your Supabase project URL  
  - Found in: Dashboard → Settings → API → Project URL  
  - Format: `https://xxxxx.supabase.co`  
  - Note: Edge Functions often have this injected automatically; adding it as a secret is optional.

- `SERVICE_ROLE_KEY` - Service role key (⚠️ Keep secret!)
  - Found in: Dashboard → Settings → API → service_role key
  - This key bypasses Row Level Security (RLS)

---

## How to Set Environment Variables

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project

### Step 2: Navigate to Edge Functions Settings
1. Click **"Edge Functions"** in the left sidebar
2. Click **"Settings"** (or gear icon)
3. Go to **"Secrets"** tab

### Step 3: Add Each Secret
1. Click **"Add Secret"** or **"New Secret"**
2. Enter the **Name** (e.g., `DODO_API_KEY`)
3. Enter the **Value** (your actual API key)
4. Click **"Save"** or **"Add"**

### Step 4: Repeat for All Variables
Add all 8 environment variables listed above.

---

## Example Values (Replace with Your Actual Values)

```
DODO_API_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DODO_PRODUCT_STARTER_MONTHLY=prod_xxxxxxxxxxxxx
DODO_PRODUCT_STARTER_ANNUAL=prod_xxxxxxxxxxxxx
DODO_PRODUCT_PRO_MONTHLY=prod_xxxxxxxxxxxxx
DODO_PRODUCT_PRO_ANNUAL=prod_xxxxxxxxxxxxx
APP_URL=http://localhost:3000
SUPABASE_URL=https://xxxxx.supabase.co
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Verification

After setting the secrets:

1. **Deploy the function** (if not already deployed):
   ```bash
   supabase functions deploy create-checkout
   ```

2. **Check function logs** in Supabase Dashboard:
   - Edge Functions → create-checkout → Logs
   - Look for any errors related to missing environment variables

3. **Test the function**:
   - Use the function URL from deployment
   - Or test locally with `supabase functions serve create-checkout`

---

## Security Notes

⚠️ **Never commit secrets to Git!**
- Edge Function secrets are stored securely in Supabase
- They are only accessible to the Edge Functions at runtime
- Use different keys for test and production environments

---

## Troubleshooting

### "Environment variable not found" error
- ✅ Check that the secret name matches exactly (case-sensitive)
- ✅ Verify the secret was saved in Supabase Dashboard
- ✅ Redeploy the function after adding new secrets

### Function can't access Supabase
- ✅ Verify `SUPABASE_URL` is correct (from Settings → API)
- ✅ Verify `SERVICE_ROLE_KEY` is the service_role key (not anon key)
- ✅ Check that the service_role key has proper permissions

---

## Next Steps

After setting environment variables:
1. ✅ Deploy the function: `supabase functions deploy create-checkout`
2. ✅ Test the function endpoint
3. ✅ Proceed to Step 9: Create Webhook Function
