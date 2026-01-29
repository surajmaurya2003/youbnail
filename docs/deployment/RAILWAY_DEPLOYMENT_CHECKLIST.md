# 🚂 Railway Production Deployment Checklist

Use this checklist to verify your app is ready for Railway deployment.

---

## ✅ Pre-Deployment Checklist

### 1. Code Readiness
- [x] All Cloudflare references removed
- [x] No Google AI Studio branding visible
- [x] `.nvmrc` file exists (Node.js 20)
- [x] `package.json` has build script
- [x] `vite.config.ts` configured correctly
- [x] `.gitignore` excludes sensitive files

### 2. Environment Variables Required

**Frontend Variables (Set in Railway):**
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- [ ] `VITE_APP_URL` - Your Railway app URL (e.g., `https://your-app.up.railway.app`)
- [ ] `VITE_DODO_API_KEY` - DodoPayments public key (if using)

**Backend Variables (Set in Supabase Edge Functions):**
- [ ] `GEMINI_API_KEY` - Already set in Supabase secrets ✅
- [ ] `DODO_API_KEY` - DodoPayments API key
- [ ] `DODO_WEBHOOK_SECRET` - DodoPayments webhook secret
- [ ] `APP_URL` - Your Railway app URL (for redirects)
- [ ] `SERVICE_ROLE_KEY` - Supabase service role key
- [ ] All DodoPayments product IDs

---

## 🚀 Railway Deployment Steps

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Sign up/Login
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository: `✅thumbpro-ai`

### Step 2: Configure Build Settings

Railway will auto-detect, but verify:

**Build Settings:**
- **Build Command:** `npm run build`
- **Start Command:** (Leave empty for static sites, or use `npx serve dist -s`)
- **Output Directory:** `dist`
- **Root Directory:** `/` (default)

**For Static Site Serving:**
Railway can serve static files automatically, but if you need a custom server:

1. Install `serve` package:
   ```bash
   npm install --save-dev serve
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "start": "serve dist -s -l 3000"
   }
   ```

3. Set **Start Command** in Railway: `npm start`

**OR** Railway can auto-serve static files from `dist/` without a start command.

### Step 3: Set Environment Variables

1. Go to your Railway project
2. Click **"Variables"** tab
3. Add each variable:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_APP_URL=https://your-app.up.railway.app
VITE_DODO_API_KEY=pk_test_... (or pk_live_... for production)
```

**Important:**
- Use your **actual Railway URL** for `VITE_APP_URL` (you'll get this after first deployment)
- Update `VITE_APP_URL` after you get your Railway domain

### Step 4: Update Supabase Edge Functions

1. Go to **Supabase Dashboard → Edge Functions → Settings → Secrets**
2. Update `APP_URL` to your Railway URL:
   - **Old:** `http://localhost:3000`
   - **New:** `https://your-app.up.railway.app`
3. **Redeploy Edge Functions:**
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy create-checkout --no-verify-jwt
   supabase functions deploy dodo-webhook --no-verify-jwt
   supabase functions deploy cancel-subscription --no-verify-jwt
   ```

### Step 5: Deploy

1. Railway will automatically:
   - Clone your repo
   - Install dependencies (`npm install`)
   - Run build (`npm run build`)
   - Deploy your app

2. **Get your Railway URL:**
   - Format: `https://your-app.up.railway.app`
   - You'll see this in the deployment logs

3. **Update `VITE_APP_URL` and `APP_URL`:**
   - Update in Railway Variables
   - Update in Supabase Edge Function secrets
   - Redeploy if needed

---

## 🔍 Post-Deployment Verification

### 1. Test Your App
- [ ] Visit your Railway URL
- [ ] App loads correctly
- [ ] No console errors
- [ ] Authentication works (sign up/login)
- [ ] Navigation works
- [ ] Images/assets load

### 2. Test Environment Variables
Open browser console and check:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_APP_URL);
```
Should show your actual values (not `undefined`)

### 3. Test Key Features
- [ ] User registration
- [ ] User login
- [ ] Plan selection
- [ ] Payment flow (if applicable)
- [ ] Thumbnail generation
- [ ] Image uploads

### 4. Check Railway Logs
1. Go to Railway Dashboard → Your Project
2. Click **"Deployments"** tab
3. Check build logs for errors
4. Check runtime logs for issues

---

## ⚠️ Common Issues & Solutions

### Issue: Build Fails
**Solution:**
- Check Node.js version (should be 20 from `.nvmrc`)
- Verify `npm run build` works locally
- Check Railway build logs for specific errors

### Issue: App Shows 404
**Solution:**
- Verify `base: '/app/'` in `vite.config.ts` matches your routing
- Check that `dist/` folder is being served
- Verify React Router `basename="/app"` is set

### Issue: Environment Variables Not Working
**Solution:**
- Verify variables start with `VITE_` prefix
- Check Railway Variables tab
- Redeploy after adding variables

### Issue: API Calls Fail
**Solution:**
- Check Supabase CORS settings
- Verify `VITE_SUPABASE_URL` is correct
- Check browser console for CORS errors

---

## 📝 Railway Configuration File (Optional)

You can create `railway.json` for advanced configuration:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npx serve dist -s -l $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Note:** Railway usually auto-detects Vite projects, so this is optional.

---

## 🎯 Quick Reference

### Required Environment Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_URL
VITE_DODO_API_KEY (if using)
```

### Railway URLs
- **Dashboard:** https://railway.app
- **Your App:** `https://your-app.up.railway.app` (after deployment)

### Commands
```bash
# Local build test
npm run build

# Check dist folder
ls -la dist/

# Test locally
npm run preview
```

---

## ✅ Final Checklist Before Going Live

- [ ] All environment variables set in Railway
- [ ] `APP_URL` updated in Supabase Edge Functions
- [ ] Edge Functions redeployed
- [ ] App loads on Railway URL
- [ ] Authentication works
- [ ] Payment flow tested (if applicable)
- [ ] No console errors
- [ ] All features tested
- [ ] Custom domain configured (if applicable)

---

## 🎉 You're Ready!

Once all items are checked, your app is ready for production on Railway!

**Next Steps:**
1. Set up custom domain (optional)
2. Monitor Railway logs
3. Set up monitoring/alerts
4. Share your app!

---

**Last Updated:** 2024
**Version:** 1.0
