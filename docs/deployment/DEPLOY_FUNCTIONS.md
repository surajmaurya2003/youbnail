# 🚀 Deploy Edge Functions to Supabase

## ✅ Prerequisites

You've already:
- ✅ Added secrets in Supabase Dashboard → Edge Functions → Settings → Secrets
- ✅ Updated code to use `SERVICE_ROLE_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open your browser to authenticate. After login, you'll be able to deploy.

---

## Step 2: Link to Your Project (if not already linked)

```bash
# Find your Project Reference ID:
# Go to Supabase Dashboard → Settings → General → Reference ID

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Example:
# supabase link --project-ref abc123xyz456example
```

You'll be prompted for your database password (from when you created the project).

---

## Step 3: Deploy All Functions

```bash
# Deploy create-checkout function
supabase functions deploy create-checkout --no-verify-jwt

# Deploy dodo-webhook function
supabase functions deploy dodo-webhook --no-verify-jwt

# Deploy cancel-subscription function
supabase functions deploy cancel-subscription --no-verify-jwt

# Deploy image-proxy function (for YouTube thumbnail CORS handling)
supabase functions deploy image-proxy --no-verify-jwt
```

**Expected output:**
```
Deployed Functions on project xxxxx: create-checkout
You can inspect your deployment in the Dashboard: https://supabase.com/dashboard/project/xxxxx/functions
```

---

## Step 4: Verify Deployment

1. Go to: **Supabase Dashboard → Edge Functions**
2. You should see:
   - ✅ `create-checkout` (with URL)
   - ✅ `dodo-webhook` (with URL)
   - ✅ `cancel-subscription` (with URL)

---

## Step 5: Verify Secrets Are Working

1. Go to: **Edge Functions → `create-checkout` → Logs**
2. Try triggering the function (click "Choose Plan" in your app)
3. Check logs - you should see:
   - ✅ "Product IDs loaded: { ... }" (should show "Set" for all)
   - ❌ No errors about missing environment variables

---

## 🔍 Troubleshooting

### "Access token not provided"
- Run: `supabase login`
- Authenticate in browser

### "Project not linked"
- Run: `supabase link --project-ref YOUR_PROJECT_REF`
- Enter database password when prompted

### "Function deployment failed"
- Check that you're in the correct directory
- Verify function files exist: `supabase/functions/create-checkout/index.ts`

### "Missing environment variables" in logs
- Go to: Dashboard → Edge Functions → Settings → Secrets
- Verify all secrets are set:
  - `DODO_API_KEY`
  - `DODO_PRODUCT_STARTER_MONTHLY`
  - `DODO_PRODUCT_STARTER_ANNUAL`
  - `DODO_PRODUCT_PRO_MONTHLY`
  - `DODO_PRODUCT_PRO_ANNUAL`
  - `APP_URL`
  - `SERVICE_ROLE_KEY` (not `SUPABASE_SERVICE_ROLE_KEY`)
  - `SUPABASE_URL` (optional - auto-provided, but safe to add)

---

## 📝 Quick Checklist

- [ ] ✅ Logged in: `supabase login`
- [ ] ✅ Project linked: `supabase link --project-ref YOUR_REF`
- [ ] ✅ `create-checkout` deployed
- [ ] ✅ `dodo-webhook` deployed
- [ ] ✅ `cancel-subscription` deployed
- [ ] ✅ Functions visible in Dashboard
- [ ] ✅ Tested checkout flow (no 500 errors)
- [ ] ✅ Tested cancel subscription flow

---

## ⚠️ Important Notes

1. **`.env.local` is NOT used by Edge Functions**
   - Edge Functions only read from Supabase Dashboard Secrets
   - `.env.local` is only for your frontend React app

2. **After adding new secrets, redeploy functions**
   - Secrets are loaded when function is deployed
   - Changes to secrets require redeployment

3. **`SUPABASE_URL` is auto-provided**
   - You don't need to add it as a secret
   - But it's safe to add if you want to be explicit
