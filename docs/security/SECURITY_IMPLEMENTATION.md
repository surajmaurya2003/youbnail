# 🔒 Security Implementation Steps

This document provides step-by-step instructions to implement all security fixes.

---

## ✅ Phase 1: Fix Exposed API Keys (CRITICAL - Do First)

### Step 1.1: Add GEMINI_API_KEY to Supabase Secrets

1. Go to: **Supabase Dashboard → Edge Functions → Settings → Secrets**
2. Click **"Add Secret"** or **"New Secret"**
3. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key
4. Click **"Save"**

---

### Step 1.2: Deploy the New Edge Function

The new `generate-thumbnail` Edge Function has been created. Deploy it:

```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the new function
supabase functions deploy generate-thumbnail --no-verify-jwt
```

**Expected output:**
```
Deployed Functions on project xxxxx: generate-thumbnail
You can inspect your deployment in the Dashboard: https://supabase.com/dashboard/project/xxxxx/functions
```

---

### Step 1.3: Verify Deployment

1. Go to: **Supabase Dashboard → Edge Functions**
2. You should see:
   - ✅ `generate-thumbnail` (with URL)
3. Click on `generate-thumbnail` → **Logs** to verify it's deployed

---

### Step 1.4: Test the New Function

1. Run your app locally: `npm run dev`
2. Try generating a thumbnail
3. Check the browser console for any errors
4. Check Edge Function logs in Supabase Dashboard

---

### Step 1.5: Verify API Key is Not Exposed

1. Build your app: `npm run build`
2. Check `dist/assets/*.js` files
3. Search for your Gemini API key
4. **Should NOT find:** Your API key in the bundle
5. **Should find:** Only Supabase anon key (safe for frontend)

---

## ✅ Phase 2: Rate Limiting (Already Implemented)

### What's Been Done:

1. **Backend Rate Limiting:**
   - ✅ Added to `generate-thumbnail` Edge Function
   - ✅ Per-user rate limits based on plan
   - ✅ Per-minute and per-hour limits

2. **Frontend Rate Limiting:**
   - ✅ Added 2-second cooldown between requests
   - ✅ User-friendly error messages

### Rate Limits Configured:

- **Free users:** 5 requests/minute, 50 requests/hour
- **Starter users:** 10 requests/minute, 200 requests/hour
- **Pro users:** 20 requests/minute, 500 requests/hour

### Testing Rate Limiting:

1. Try generating 10 thumbnails in quick succession
2. **Should see:** Rate limit error after limit reached
3. **Should see:** "Please wait X seconds" message

---

## ✅ Phase 3: Input Validation (Already Implemented)

### What's Been Done:

1. **Backend Validation:**
   - ✅ Prompt length validation (max 2000 chars)
   - ✅ Input sanitization (removes script tags, etc.)
   - ✅ Image validation (type, size)
   - ✅ Aspect ratio validation

2. **Frontend Validation:**
   - ✅ Prompt length check
   - ✅ Overlay text length check
   - ✅ Basic sanitization

### Testing Input Validation:

1. Try prompt with 5000 characters
   - **Should see:** "Prompt is too long" error

2. Try prompt with `<script>alert('xss')</script>`
   - **Should see:** Script tags removed or error

3. Try uploading non-image file
   - **Should see:** "Invalid image format" error

---

## 📋 Complete Deployment Checklist

### Before Deploying:

- [ ] ✅ `GEMINI_API_KEY` added to Supabase secrets
- [ ] ✅ `generate-thumbnail` Edge Function deployed
- [ ] ✅ API keys removed from `vite.config.ts`
- [ ] ✅ Frontend updated to use Edge Function
- [ ] ✅ Rate limiting tested
- [ ] ✅ Input validation tested
- [ ] ✅ Build tested locally (`npm run build`)
- [ ] ✅ No API keys found in build output
- [ ] ✅ All Edge Functions redeployed

---

## 🚀 Deployment Steps

### Step 1: Deploy Edge Function

```bash
supabase functions deploy generate-thumbnail --no-verify-jwt
```

### Step 2: Update Environment Variables (if needed)

If you're using a hosting platform (Vercel, Netlify, etc.), you don't need to add `GEMINI_API_KEY` there - it's only in Supabase.

### Step 3: Build and Deploy Frontend

```bash
npm run build
# Then deploy dist/ folder to your hosting platform
```

### Step 4: Verify Everything Works

1. Visit your deployed app
2. Sign in
3. Try generating a thumbnail
4. Check Edge Function logs for any errors

---

## 🔍 Troubleshooting

### Issue: "Missing GEMINI_API_KEY environment variable"

**Solution:**
1. Go to: Supabase Dashboard → Edge Functions → Settings → Secrets
2. Verify `GEMINI_API_KEY` is set
3. Redeploy the function: `supabase functions deploy generate-thumbnail --no-verify-jwt`

---

### Issue: "Unauthorized: Missing authorization header"

**Solution:**
- This means the user is not authenticated
- Make sure user is signed in
- Check that Supabase client is properly initialized

---

### Issue: "Rate limit exceeded"

**Solution:**
- This is expected behavior - rate limiting is working!
- Wait for the retry time shown in the error message
- Or upgrade your plan for higher limits

---

### Issue: "Prompt is too long"

**Solution:**
- This is expected behavior - input validation is working!
- Reduce prompt length to under 2000 characters

---

### Issue: Thumbnail generation still uses old API

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that `services/geminiService.ts` is using `supabase.functions.invoke`
4. Verify Edge Function is deployed

---

## 📊 Security Status

### ✅ Fixed:
- [x] API keys moved to backend
- [x] Rate limiting implemented
- [x] Input validation added
- [x] Input sanitization added
- [x] File upload validation added

### 🔄 Optional Improvements:
- [ ] Use Deno KV or Redis for persistent rate limiting
- [ ] Add request logging/monitoring
- [ ] Implement CAPTCHA for suspicious activity
- [ ] Add IP-based rate limiting
- [ ] Set up security alerts

---

## 📞 Need Help?

If you encounter issues:

1. **Check Edge Function Logs:**
   - Supabase Dashboard → Edge Functions → `generate-thumbnail` → Logs

2. **Check Browser Console:**
   - Open DevTools (F12) → Console tab
   - Look for error messages

3. **Verify Secrets:**
   - Supabase Dashboard → Edge Functions → Settings → Secrets
   - Make sure `GEMINI_API_KEY` is set

4. **Test Locally:**
   - Run `npm run dev`
   - Try generating a thumbnail
   - Check for errors

---

**Last Updated:** 2025-01-27
**Status:** Ready for Deployment
