# 🔒 Security Guide - Protecting Your Webapp

This guide addresses three critical security vulnerabilities and provides step-by-step solutions.

---

## 🚨 Critical Vulnerabilities Identified

### 1. **Exposed API Keys** ⚠️ CRITICAL
**Risk:** API keys are exposed in the frontend bundle, making them accessible to anyone.

**Current Issues:**
- `GEMINI_API_KEY` is exposed in `vite.config.ts` via `define` section
- API key is bundled into client-side JavaScript
- Anyone can extract the key from the browser's developer tools

**Impact:**
- Unauthorized API usage
- Potential financial losses
- Service abuse
- Account suspension

---

### 2. **No Rate Limiting** ⚠️ HIGH
**Risk:** No protection against abuse, DDoS, or resource exhaustion.

**Current Issues:**
- No rate limiting on frontend API calls
- No rate limiting on Edge Functions
- No protection against rapid-fire requests
- No per-user request limits

**Impact:**
- API quota exhaustion
- Increased costs
- Service degradation
- Potential DoS attacks

---

### 3. **No Input Validation** ⚠️ HIGH
**Risk:** Malicious input can cause errors, data corruption, or security breaches.

**Current Issues:**
- No prompt length validation
- No input sanitization
- No file type/size validation
- No SQL injection protection (though using Supabase helps)
- No XSS protection on user inputs

**Impact:**
- Application crashes
- Data corruption
- Potential XSS attacks
- Resource exhaustion

---

## ✅ Solution 1: Fix Exposed API Keys

### Step 1.1: Create Backend Edge Function for Gemini API

**Why:** API keys should NEVER be in frontend code. Move all API calls to backend.

**Action:** Create a new Edge Function `generate-thumbnail` that:
- Receives user prompts and options from frontend
- Uses Gemini API key from server-side secrets
- Returns generated thumbnails
- Validates user authentication
- Implements rate limiting

**Location:** `supabase/functions/generate-thumbnail/index.ts`

---

### Step 1.2: Update Frontend to Use Edge Function

**Action:** Modify `services/geminiService.ts` to:
- Call Supabase Edge Function instead of direct API
- Remove all API key references
- Handle authentication tokens

---

### Step 1.3: Remove API Keys from Vite Config

**Action:** Update `vite.config.ts`:
- Remove `process.env.API_KEY` from `define` section
- Remove `process.env.GEMINI_API_KEY` from `define` section
- Keep only `VITE_` prefixed variables (safe for frontend)

---

### Step 1.4: Add Gemini API Key to Supabase Secrets

**Action:**
1. Go to: **Supabase Dashboard → Edge Functions → Settings → Secrets**
2. Add new secret:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key
3. Redeploy Edge Functions

---

## ✅ Solution 2: Implement Rate Limiting

### Step 2.1: Add Rate Limiting to Edge Functions

**Implementation Options:**

#### Option A: Supabase Built-in Rate Limiting (Recommended)
- Uses Supabase's built-in rate limiting
- Configure in Edge Function settings
- Per-user limits

#### Option B: Custom Rate Limiting with Redis/KV Store
- Use Deno KV or external Redis
- Track requests per user/IP
- Implement sliding window or token bucket

**Action:** Add rate limiting middleware to all Edge Functions:
- `generate-thumbnail`
- `create-checkout`
- `dodo-webhook`
- `cancel-subscription`

---

### Step 2.2: Add Client-Side Rate Limiting

**Action:** Add rate limiting in frontend:
- Track request timestamps
- Prevent rapid-fire requests
- Show user-friendly error messages
- Implement exponential backoff

**Location:** `services/geminiService.ts` and `App.tsx`

---

### Step 2.3: Configure Rate Limits

**Recommended Limits:**
- **Free users:** 5 requests/minute, 50 requests/hour
- **Starter users:** 10 requests/minute, 200 requests/hour
- **Pro users:** 20 requests/minute, 500 requests/hour

---

## ✅ Solution 3: Add Input Validation

### Step 3.1: Validate User Prompts

**Action:** Add validation in Edge Function:
- **Length:** Max 2000 characters
- **Content:** Sanitize HTML/script tags
- **Pattern:** Allow only safe characters
- **Rate:** Check per-user limits

---

### Step 3.2: Validate File Uploads

**Action:** Add validation for:
- **File type:** Only images (PNG, JPG, WebP)
- **File size:** Max 10MB
- **Dimensions:** Validate image dimensions
- **Content:** Scan for malicious content

---

### Step 3.3: Sanitize All User Inputs

**Action:**
- Use libraries like `DOMPurify` for HTML sanitization
- Escape special characters
- Validate UUIDs, emails, and other structured data
- Use parameterized queries (Supabase handles this)

---

## 📋 Implementation Checklist

### Phase 1: Fix API Key Exposure (CRITICAL - Do First)
- [ ] Create `generate-thumbnail` Edge Function
- [ ] Move Gemini API calls to backend
- [ ] Update frontend to use Edge Function
- [ ] Remove API keys from `vite.config.ts`
- [ ] Add `GEMINI_API_KEY` to Supabase secrets
- [ ] Test thumbnail generation
- [ ] Redeploy Edge Functions

### Phase 2: Add Rate Limiting
- [ ] Add rate limiting middleware to Edge Functions
- [ ] Implement per-user rate limits
- [ ] Add client-side rate limiting
- [ ] Configure limits based on user plan
- [ ] Add rate limit headers to responses
- [ ] Test rate limiting

### Phase 3: Add Input Validation
- [ ] Add prompt validation (length, content)
- [ ] Add file upload validation
- [ ] Sanitize all user inputs
- [ ] Add validation error messages
- [ ] Test with malicious inputs

### Phase 4: Security Hardening
- [ ] Add CORS restrictions (specific origins)
- [ ] Add request size limits
- [ ] Implement request timeout
- [ ] Add logging for security events
- [ ] Set up monitoring/alerts

---

## 🔧 Quick Fixes (Immediate Actions)

### Fix 1: Remove API Key from Vite Config (5 minutes)

**File:** `vite.config.ts`

**Before:**
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

**After:**
```typescript
define: {
  // Remove API keys - they should be server-side only
}
```

---

### Fix 2: Add Basic Input Validation (10 minutes)

**File:** `App.tsx` - `handleGenerate` function

Add validation:
```typescript
// Validate prompt length
if (currentPrompt && currentPrompt.length > 2000) {
  alert("Prompt is too long. Maximum 2000 characters.");
  return;
}

// Sanitize prompt (remove script tags, etc.)
const sanitizedPrompt = currentPrompt.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
```

---

### Fix 3: Add Basic Rate Limiting (15 minutes)

**File:** `App.tsx`

Add rate limiting state:
```typescript
const [lastRequestTime, setLastRequestTime] = useState<number>(0);
const REQUEST_COOLDOWN = 2000; // 2 seconds between requests

// In handleGenerate:
const now = Date.now();
if (now - lastRequestTime < REQUEST_COOLDOWN) {
  alert("Please wait a moment before generating another thumbnail.");
  return;
}
setLastRequestTime(now);
```

---

## 📚 Additional Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use `VITE_` prefix only for safe frontend variables
- ✅ Store secrets in Supabase Dashboard
- ✅ Use different keys for dev/staging/prod

### 2. Authentication
- ✅ Always verify user authentication in Edge Functions
- ✅ Use Supabase RLS policies
- ✅ Validate JWT tokens
- ✅ Check user permissions

### 3. Error Handling
- ✅ Don't expose internal errors to users
- ✅ Log errors server-side
- ✅ Use generic error messages for users
- ✅ Monitor error rates

### 4. CORS Configuration
- ✅ Restrict CORS to specific origins
- ✅ Don't use `*` in production
- ✅ Validate Origin header

### 5. Monitoring
- ✅ Set up error tracking (Sentry, etc.)
- ✅ Monitor API usage
- ✅ Alert on suspicious activity
- ✅ Track rate limit violations

---

## 🧪 Testing Security Fixes

### Test 1: API Key Exposure
1. Build your app: `npm run build`
2. Check `dist/assets/*.js` files
3. Search for your API key
4. **Should NOT find:** API keys in bundle
5. **Should find:** Only Supabase anon key (safe for frontend)

### Test 2: Rate Limiting
1. Try to generate 10 thumbnails in quick succession
2. **Should see:** Rate limit error after limit reached
3. **Should see:** Requests blocked appropriately

### Test 3: Input Validation
1. Try prompt with 5000 characters
2. Try prompt with `<script>alert('xss')</script>`
3. Try uploading non-image file
4. **Should see:** Validation errors, not crashes

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All API keys moved to backend
- [ ] Rate limiting implemented and tested
- [ ] Input validation added and tested
- [ ] CORS configured for production domain
- [ ] Error handling improved
- [ ] Security monitoring set up
- [ ] All secrets in Supabase Dashboard
- [ ] `.env` files not committed to Git
- [ ] Build tested locally
- [ ] Edge Functions redeployed

---

## 📞 Need Help?

If you encounter issues:
1. Check Edge Function logs in Supabase Dashboard
2. Verify secrets are set correctly
3. Test rate limiting with different user plans
4. Review error messages for clues

---

## 🔗 Additional Resources

- [Supabase Edge Functions Security](https://supabase.com/docs/guides/functions/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Input Validation Guide](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

**Last Updated:** 2025-01-27
**Status:** Implementation Guide - Follow step-by-step
