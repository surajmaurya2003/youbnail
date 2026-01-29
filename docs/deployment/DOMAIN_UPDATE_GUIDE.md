# 🌐 Complete Domain Update Guide

This guide lists **ALL** places where you need to update your domain/localhost references when deploying to production.

---

## 📋 Quick Checklist

- [ ] **Railway Environment Variables** (Frontend)
- [ ] **Supabase Edge Function Secrets** (Backend)
- [ ] **DodoPayments Webhook URL** (if using)
- [ ] **Supabase CORS Settings** (if needed)
- [ ] **Supabase Auth Redirect URLs** (if using OAuth)

---

## 1️⃣ Railway Environment Variables (Frontend)

**Location:** Railway Dashboard → Your Project → **Variables** tab

**Variables to Update:**

```
VITE_APP_URL=https://your-app.up.railway.app
```

**Or if using custom domain:**
```
VITE_APP_URL=https://yourdomain.com
```

**How to Update:**
1. Go to Railway Dashboard
2. Click your project
3. Click **"Variables"** tab
4. Find `VITE_APP_URL`
5. Update the value to your production URL
6. Click **"Save"**
7. Railway will automatically redeploy

**Important:**
- Use `https://` (not `http://`)
- Include the full URL (e.g., `https://your-app.up.railway.app`)
- If your app uses `/app/` base path, the URL should still be the root domain (Railway handles routing)

---

## 2️⃣ Supabase Edge Function Secrets (Backend)

**Location:** Supabase Dashboard → Edge Functions → Settings → **Secrets**

**Secret to Update:**

```
APP_URL=https://your-app.up.railway.app
```

**Or if using custom domain:**
```
APP_URL=https://yourdomain.com
```

**How to Update:**
1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **"Edge Functions"** in left sidebar
4. Click **"Settings"** (gear icon)
5. Go to **"Secrets"** tab
6. Find `APP_URL` secret
7. Click **"Edit"** or **"Update"**
8. Change value from `http://localhost:3000` to your production URL
9. Click **"Save"**

**⚠️ CRITICAL: After updating, you MUST redeploy Edge Functions!**

**Redeploy Commands:**
```bash
# Login to Supabase
supabase login

# Link to your project (if not already)
supabase link --project-ref YOUR_PROJECT_REF

# Redeploy all functions
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy dodo-webhook --no-verify-jwt
supabase functions deploy cancel-subscription --no-verify-jwt
```

**Why redeploy?** Edge Functions load secrets at deployment time, so changes require redeployment.

**Functions that use `APP_URL`:**
- ✅ `create-checkout` - For payment redirect URLs
- ✅ `dodo-webhook` - For webhook callbacks (if needed)
- ✅ `cancel-subscription` - For redirect URLs

---

## 3️⃣ DodoPayments Webhook URL (If Using)

**Location:** DodoPayments Dashboard → Webhooks → Your Webhook

**URL to Update:**

```
https://xxxxx.supabase.co/functions/v1/dodo-webhook
```

**Note:** This is your **Supabase Edge Function URL**, not your Railway URL. This should already be correct if you set it up initially.

**How to Verify:**
1. Go to **DodoPayments Dashboard**
2. Navigate to **Webhooks** → **Endpoints**
3. Check your webhook URL
4. It should point to: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/dodo-webhook`
5. If incorrect, update it

**This URL does NOT need to change** when deploying to Railway - it stays as your Supabase function URL.

---

## 4️⃣ Supabase CORS Settings (If Needed)

**Location:** Supabase Dashboard → Settings → API → **CORS**

**If you get CORS errors, add your Railway domain:**

1. Go to **Supabase Dashboard**
2. Click **Settings** → **API**
3. Scroll to **"CORS"** section
4. Add your Railway URL:
   ```
   https://your-app.up.railway.app
   ```
5. Or if using custom domain:
   ```
   https://yourdomain.com
   ```
6. Click **"Save"**

**Note:** Supabase usually allows all origins by default, but if you have restrictions, add your domain here.

---

## 5️⃣ Supabase Auth Redirect URLs (If Using OAuth)

**Location:** Supabase Dashboard → Authentication → URL Configuration

**If you're using Google OAuth or other OAuth providers:**

1. Go to **Supabase Dashboard**
2. Click **Authentication** → **URL Configuration**
3. Under **"Redirect URLs"**, add:
   ```
   https://your-app.up.railway.app/app/**
   ```
4. Or if using custom domain:
   ```
   https://yourdomain.com/app/**
   ```
5. Click **"Save"**

**Note:** The `**` wildcard allows all paths under `/app/` to work.

---

## 📝 Summary: All Places to Update

| Location | Variable/Setting | Old Value | New Value |
|----------|-----------------|-----------|-----------|
| **Railway** | `VITE_APP_URL` | `http://localhost:3000` | `https://your-app.up.railway.app` |
| **Supabase** | `APP_URL` (Secret) | `http://localhost:3000` | `https://your-app.up.railway.app` |
| **Supabase** | CORS (if restricted) | - | Add your Railway domain |
| **Supabase** | Auth Redirect URLs | - | Add your Railway domain |
| **DodoPayments** | Webhook URL | - | Keep as Supabase URL ✅ |

---

## 🔄 Update Order (Recommended)

1. **First:** Deploy to Railway and get your Railway URL
2. **Second:** Update Railway `VITE_APP_URL` environment variable
3. **Third:** Update Supabase `APP_URL` secret
4. **Fourth:** Redeploy Supabase Edge Functions
5. **Fifth:** Update Supabase CORS (if needed)
6. **Sixth:** Update Supabase Auth Redirect URLs (if using OAuth)
7. **Seventh:** Test everything

---

## ✅ Verification Steps

After updating all domains:

### 1. Test Frontend
```javascript
// Open browser console on your Railway app
console.log(import.meta.env.VITE_APP_URL);
// Should show: https://your-app.up.railway.app
```

### 2. Test Payment Flow
1. Try to select a plan
2. Check that redirect URLs go to your Railway domain (not localhost)
3. Verify payment success/cancel pages load correctly

### 3. Test Edge Functions
1. Go to **Supabase Dashboard → Edge Functions → Logs**
2. Trigger a function (e.g., create checkout)
3. Check logs for `APP_URL` usage
4. Verify it's using your production URL

### 4. Test OAuth (if using)
1. Try Google sign-in
2. Verify redirect goes to your Railway domain
3. Check that authentication completes successfully

---

## 🆘 Common Issues

### Issue: Redirects Still Go to Localhost

**Solution:**
- ✅ Verify `APP_URL` is updated in Supabase secrets
- ✅ **Redeploy Edge Functions** after updating `APP_URL`
- ✅ Clear browser cache
- ✅ Check Edge Function logs for actual `APP_URL` value

### Issue: CORS Errors

**Solution:**
- ✅ Add Railway domain to Supabase CORS settings
- ✅ Verify `VITE_SUPABASE_URL` is correct in Railway
- ✅ Check browser console for specific CORS error

### Issue: OAuth Redirect Fails

**Solution:**
- ✅ Add Railway domain to Supabase Auth Redirect URLs
- ✅ Include the `/app/**` path pattern
- ✅ Verify OAuth provider (Google) settings

---

## 📌 Quick Reference

### Railway URL Format
```
https://your-app.up.railway.app
```

### Custom Domain Format
```
https://yourdomain.com
```

### App Base Path
Your app uses `/app/` base path, so:
- Visit: `https://your-app.up.railway.app/app/`
- Or: `https://yourdomain.com/app/`

### Environment Variables Format
```
VITE_APP_URL=https://your-app.up.railway.app
APP_URL=https://your-app.up.railway.app
```

**Always use `https://` in production!**

---

## 🎯 Final Checklist

Before going live, verify:

- [ ] `VITE_APP_URL` set in Railway
- [ ] `APP_URL` updated in Supabase secrets
- [ ] Edge Functions redeployed after `APP_URL` update
- [ ] CORS settings updated (if needed)
- [ ] Auth redirect URLs updated (if using OAuth)
- [ ] Payment flow tested
- [ ] OAuth tested (if using)
- [ ] All redirects go to production URL (not localhost)

---

**Last Updated:** 2024
**Version:** 1.0
