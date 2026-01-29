# 🌐 Custom Domain Setup Guide

This guide will walk you through adding your custom domain to your ThumbPro webapp.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Your domain registered (e.g., `thumbpro.com`, `thumbpro.ai`)
- ✅ Access to your domain registrar's DNS settings
- ✅ Your app deployed to a hosting platform (Vercel, Netlify, Railway, etc.)
- ✅ Access to your Supabase Dashboard

---

## 🎯 Step 1: Choose Your Hosting Platform

If you haven't deployed yet, choose one of these platforms:

### Option A: Vercel (Recommended for React/Vite apps)
- Free tier available
- Automatic HTTPS
- Easy custom domain setup
- Great for Vite/React apps

### Option B: Netlify
- Free tier available
- Automatic HTTPS
- Easy deployment from Git

### Option C: Railway
- Easy deployment
- Automatic HTTPS
- Simple domain setup

### Option D: Other Platforms
- AWS Amplify
- GitHub Pages (limited)
- Any static hosting service

---

## 🚀 Step 2: Deploy Your App

### If Using Vercel:

#### 2.1 Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

#### 2.2 Deploy
```bash
# From your project root
vercel

# For production
vercel --prod
```

**Or use Vercel Dashboard:**
1. Go to https://vercel.com
2. Import your Git repository
3. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Deploy

---

### If Using Netlify:

#### 2.1 Install Netlify CLI (if not installed)
```bash
npm install -g netlify-cli
```

#### 2.2 Deploy
```bash
# Build your app first
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Or use Netlify Dashboard:**
1. Go to https://app.netlify.com
2. Drag and drop your `dist` folder
3. Or connect your Git repository

---

### If Using Railway:

1. Go to https://railway.app
2. Create a new project
3. Connect your Git repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Start command:** (leave empty for static sites)
   - **Output directory:** `dist`
5. Deploy

---

## 🌍 Step 3: Add Custom Domain to Your Hosting Platform

### For Vercel:

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter your domain (e.g., `thumbpro.com` or `www.thumbpro.com`)
5. Vercel will show you DNS records to add:
   - **A Record** pointing to Vercel's IP
   - **CNAME Record** for www subdomain
6. Copy these DNS records (you'll add them in Step 4)

**Note:** Vercel also supports:
- **Apex Domain:** `thumbpro.com` (requires A record)
- **WWW Subdomain:** `www.thumbpro.com` (requires CNAME record)
- **Wildcard:** `*.thumbpro.com` (requires CNAME record)

---

### For Netlify:

1. Go to your site dashboard on Netlify
2. Click **Domain settings**
3. Click **Add custom domain**
4. Enter your domain
5. Netlify will show you DNS records:
   - **A Record** for apex domain
   - **CNAME Record** for www subdomain
6. Copy these DNS records

---

### For Railway:

1. Go to your Railway project
2. Click **Settings** → **Domains**
3. Click **Generate Domain** or **Add Custom Domain**
4. Enter your domain
5. Railway will provide DNS records to add

---

## 🔧 Step 4: Configure DNS Records

Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.) and add the DNS records provided by your hosting platform.

### Common DNS Record Types:

#### A Record (for apex domain: `thumbpro.com`)
```
Type: A
Name: @ (or leave blank)
Value: [IP address from hosting platform]
TTL: 3600 (or Auto)
```

#### CNAME Record (for www: `www.thumbpro.com`)
```
Type: CNAME
Name: www
Value: [CNAME target from hosting platform]
TTL: 3600 (or Auto)
```

### Example DNS Configuration:

**For Vercel:**
```
A Record:
@ → 76.76.21.21

CNAME Record:
www → cname.vercel-dns.com
```

**For Netlify:**
```
A Record:
@ → 75.2.60.5

CNAME Record:
www → your-site.netlify.app
```

---

## ⏱️ Step 5: Wait for DNS Propagation

DNS changes can take:
- **Minimum:** 5-10 minutes
- **Average:** 1-2 hours
- **Maximum:** 24-48 hours

**Check DNS propagation:**
- Use https://dnschecker.org
- Enter your domain and check globally

**Verify your domain is active:**
- Visit your domain in a browser
- You should see your app (may take a few minutes)

---

## 🔐 Step 6: Update Environment Variables

### 6.1 Update Supabase Edge Function Secrets

Your Edge Functions use `APP_URL` for redirects. Update it to your new domain:

1. Go to: **Supabase Dashboard → Edge Functions → Settings → Secrets**
2. Find the `APP_URL` secret
3. Update it to your new domain:
   - **Old:** `http://localhost:3000` or `https://old-domain.vercel.app`
   - **New:** `https://yourdomain.com` (or `https://www.yourdomain.com`)

**Important:** Use `https://` (not `http://`) for production!

### 6.2 Redeploy Edge Functions

After updating the secret, redeploy your functions:

```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already)
supabase link --project-ref YOUR_PROJECT_REF

# Redeploy all functions
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy dodo-webhook --no-verify-jwt
supabase functions deploy cancel-subscription --no-verify-jwt
```

**Why redeploy?** Edge Functions load secrets at deployment time, so changes require redeployment.

---

### 6.3 Update Frontend Environment Variables

If you're using environment variables in your frontend (like `VITE_APP_URL`), update them:

#### For Vercel:
1. Go to **Project Settings → Environment Variables**
2. Add or update:
   ```
   VITE_APP_URL=https://yourdomain.com
   ```
3. Redeploy your app

#### For Netlify:
1. Go to **Site Settings → Environment Variables**
2. Add or update:
   ```
   VITE_APP_URL=https://yourdomain.com
   ```
3. Redeploy your app

#### For Railway:
1. Go to **Variables** tab
2. Add or update:
   ```
   VITE_APP_URL=https://yourdomain.com
   ```
3. Redeploy your app

---

## 🔄 Step 7: Update Vite Configuration (if needed)

If your app is deployed to a subdirectory (not root), check `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/',  // Change from '/app/' to '/' for root domain
  // ... rest of config
});
```

**Current config shows `base: '/app/'`** - if you want your app at the root of your domain, change this to `base: '/'`.

After changing, rebuild and redeploy:
```bash
npm run build
# Then redeploy to your hosting platform
```

---

## ✅ Step 8: Verify Everything Works

### 8.1 Test Your Domain
1. Visit `https://yourdomain.com` in a browser
2. Verify your app loads correctly
3. Test authentication (login/signup)
4. Test payment flow (if applicable)

### 8.2 Test HTTPS
- Your hosting platform should automatically provide HTTPS
- Verify the padlock icon appears in the browser
- If not, check your hosting platform's SSL settings

### 8.3 Test Edge Functions
1. Go to: **Supabase Dashboard → Edge Functions → Logs**
2. Trigger a function (e.g., click "Choose Plan")
3. Check logs for correct `APP_URL` usage
4. Verify redirects work correctly

### 8.4 Test Payment Redirects
1. Try the checkout flow
2. Verify redirects go to `https://yourdomain.com` (not localhost or old domain)
3. Check that success/cancel pages load correctly

---

## 🔍 Step 9: Update DodoPayments Webhook (if applicable)

If you're using DodoPayments, update the webhook URL if needed:

1. Go to: **DodoPayments Dashboard → Webhooks**
2. Check your webhook endpoint URL
3. If it references your old domain, update it to:
   ```
   https://yourdomain.com/api/webhook
   ```
   (Or wherever your webhook handler is)

**Note:** If your webhook is handled by Supabase Edge Functions, you don't need to change it (it uses the Supabase URL, not your domain).

---

## 🛠️ Troubleshooting

### Domain Not Resolving
- **Wait longer:** DNS can take up to 48 hours
- **Check DNS records:** Verify they're correct in your registrar
- **Clear DNS cache:** 
  ```bash
  # macOS
  sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
  
  # Windows
  ipconfig /flushdns
  ```

### SSL Certificate Issues
- Most platforms auto-provision SSL certificates
- Wait 5-10 minutes after adding domain
- Check your hosting platform's SSL status

### Redirects Not Working
- Verify `APP_URL` secret is updated in Supabase
- Redeploy Edge Functions after updating `APP_URL`
- Check browser console for errors

### App Shows 404
- Check `vite.config.ts` `base` setting
- Verify build output directory is correct
- Check hosting platform's build settings

### Mixed Content Warnings
- Ensure all URLs use `https://` (not `http://`)
- Update `APP_URL` to use `https://`
- Check that all external resources use HTTPS

---

## 📝 Quick Checklist

- [ ] App deployed to hosting platform
- [ ] Custom domain added in hosting platform dashboard
- [ ] DNS records added at domain registrar
- [ ] DNS propagated (checked with dnschecker.org)
- [ ] Domain accessible in browser
- [ ] HTTPS working (padlock icon visible)
- [ ] `APP_URL` secret updated in Supabase
- [ ] Edge Functions redeployed
- [ ] Frontend environment variables updated (if needed)
- [ ] App tested (authentication, payments, etc.)
- [ ] Webhook URLs updated (if needed)

---

## 🎉 You're Done!

Your custom domain should now be live! If you encounter any issues, refer to the troubleshooting section or check your hosting platform's documentation.

---

## 📚 Additional Resources

- **Vercel Domains:** https://vercel.com/docs/concepts/projects/domains
- **Netlify Domains:** https://docs.netlify.com/domains-https/custom-domains/
- **Railway Domains:** https://docs.railway.app/guides/domains
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions

---

## ⚠️ Important Notes

1. **Always use HTTPS in production** - Never use `http://` for `APP_URL` in production
2. **Redeploy after secret changes** - Edge Functions need to be redeployed after updating secrets
3. **DNS propagation takes time** - Be patient, it can take up to 48 hours
4. **Test thoroughly** - Verify all features work with your new domain
5. **Keep old domain active** - Don't delete old deployments until new domain is fully working
