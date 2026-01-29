# 🔧 Fix Redirect URLs (Localhost → Production)

## Problem
When logging in with Google, signing up, or resetting password, redirects go to `localhost` instead of your production domain.

## ✅ Solution

### Step 1: Set Environment Variable in Railway

1. Go to **Railway Dashboard** → Your Project → **Variables** tab
2. Add or update:
   ```
   VITE_APP_URL=https://youbnail.com
   ```
   (Replace with your actual domain)
3. Click **Save**
4. Railway will automatically redeploy

### Step 2: Configure Supabase Auth Redirect URLs

**This is the most important step!** Supabase needs to allow redirects to your production domain.

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **Authentication** → **URL Configuration**
4. Under **"Redirect URLs"**, add:
   ```
   https://youbnail.com/**
   ```
   (Replace with your actual domain)
5. Click **"Save"**

**Important:** The `**` wildcard allows all paths under your domain to work.

### Step 3: Verify Edge Function APP_URL

1. Go to **Supabase Dashboard** → **Edge Functions** → **Settings** → **Secrets**
2. Check that `APP_URL` is set to:
   ```
   https://youbnail.com
   ```
   (Not `http://localhost:3000`)
3. If it's wrong, update it and **redeploy Edge Functions**:
   ```bash
   supabase functions deploy create-checkout --no-verify-jwt
   supabase functions deploy dodo-webhook --no-verify-jwt
   supabase functions deploy cancel-subscription --no-verify-jwt
   ```

### Step 4: Test

1. Try Google sign-in - should redirect to `https://youbnail.com` (not localhost)
2. Try password reset - should redirect to `https://youbnail.com/reset-password`
3. Try signup - should work correctly

## 🔍 How It Works

The code now uses:
```typescript
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
```

- If `VITE_APP_URL` is set in Railway, it uses that (production)
- Otherwise, it falls back to `window.location.origin` (current domain)

## ⚠️ Common Issues

### Still redirecting to localhost?

1. **Check Railway Variables:**
   - Make sure `VITE_APP_URL` is set correctly
   - Make sure it starts with `https://` (not `http://`)
   - Redeploy after setting the variable

2. **Check Supabase Auth Settings:**
   - Go to Authentication → URL Configuration
   - Make sure your production domain is in the Redirect URLs list
   - Use `https://youbnail.com/**` format

3. **Clear Browser Cache:**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or clear cache and cookies

4. **Check Browser Console:**
   - Open DevTools → Console
   - Look for any errors related to redirects
   - Check Network tab to see where redirects are going

## 📝 Quick Checklist

- [ ] `VITE_APP_URL` set in Railway to `https://youbnail.com`
- [ ] Railway redeployed after setting variable
- [ ] Supabase Auth Redirect URLs includes `https://youbnail.com/**`
- [ ] Supabase `APP_URL` secret is set to `https://youbnail.com`
- [ ] Edge Functions redeployed after updating `APP_URL`
- [ ] Tested Google sign-in redirect
- [ ] Tested password reset redirect
- [ ] Tested signup flow

---

**After completing these steps, all redirects should go to your production domain!**
