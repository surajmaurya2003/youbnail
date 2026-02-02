# 🔒 Turnstile Implementation Guide

## Step 1: Get Turnstile Keys
1. Go to Cloudflare Dashboard → Turnstile
2. Create a new site
3. Get Site Key and Secret Key

## Step 2: Add Environment Variables
Add to `.env.local` and Cloudflare Pages:
```env
VITE_TURNSTILE_SITE_KEY=your_site_key_here
```

## Step 3: Update CSP Headers
Add to index.html and _headers:
```
https://challenges.cloudflare.com
```

## Step 4: Add Turnstile Script
Add to index.html:
```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

## Step 5: Implement Widget
Create Turnstile component and integrate into auth forms.

## Step 6: Configure Supabase
Enable CAPTCHA in Supabase Auth settings with your secret key.