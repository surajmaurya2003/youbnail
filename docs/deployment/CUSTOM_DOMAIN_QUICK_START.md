# 🚀 Custom Domain Quick Start

A condensed checklist for adding your custom domain.

---

## 📌 Prerequisites Checklist

- [ ] Domain registered (e.g., `thumbpro.com`)
- [ ] Access to domain registrar DNS settings
- [ ] App deployed to hosting platform (Vercel/Netlify/Railway)
- [ ] Supabase project access

---

## ⚡ Quick Steps

### 1️⃣ Deploy Your App (if not already)

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

### 2️⃣ Add Domain in Hosting Platform

**Vercel:**
- Dashboard → Settings → Domains → Add Domain
- Enter: `yourdomain.com`

**Netlify:**
- Site Settings → Domain management → Add custom domain
- Enter: `yourdomain.com`

**Railway:**
- Project → Settings → Domains → Add Custom Domain
- Enter: `yourdomain.com`

---

### 3️⃣ Add DNS Records at Registrar

Copy the DNS records shown by your hosting platform and add them at your domain registrar:

**Typical Records:**
```
A Record:
@ → [IP from hosting platform]

CNAME Record:
www → [CNAME target from hosting platform]
```

**Wait 5 minutes to 2 hours for DNS to propagate.**

---

### 4️⃣ Update Supabase Secrets

1. Go to: **Supabase Dashboard → Edge Functions → Settings → Secrets**
2. Update `APP_URL`:
   - **From:** `http://localhost:3000`
   - **To:** `https://yourdomain.com`
3. **Redeploy functions:**
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy create-checkout --no-verify-jwt
   supabase functions deploy dodo-webhook --no-verify-jwt
   supabase functions deploy cancel-subscription --no-verify-jwt
   ```

---

### 5️⃣ Update Frontend Environment Variables

**Vercel:**
- Project Settings → Environment Variables
- Add/Update: `VITE_APP_URL=https://yourdomain.com`
- Redeploy

**Netlify:**
- Site Settings → Environment Variables
- Add/Update: `VITE_APP_URL=https://yourdomain.com`
- Redeploy

---

### 6️⃣ Check Vite Config (Optional)

If you want your app at root (not `/app/`), update `vite.config.ts`:

```typescript
base: '/',  // Change from '/app/' to '/'
```

Then rebuild and redeploy.

---

### 7️⃣ Verify

- [ ] Visit `https://yourdomain.com` - app loads
- [ ] HTTPS padlock icon visible
- [ ] Test login/signup
- [ ] Test payment flow
- [ ] Check Supabase Edge Function logs for correct `APP_URL`

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Domain not loading | Wait for DNS (up to 48h), check DNS records |
| No HTTPS | Wait 5-10 min, check hosting platform SSL status |
| Redirects broken | Update `APP_URL` secret, redeploy functions |
| 404 errors | Check `vite.config.ts` base path, verify build output |

---

## ✅ Final Checklist

- [ ] Domain added in hosting platform
- [ ] DNS records added at registrar
- [ ] Domain accessible (`https://yourdomain.com`)
- [ ] `APP_URL` updated in Supabase secrets
- [ ] Edge Functions redeployed
- [ ] Frontend env vars updated
- [ ] App tested and working

---

**📖 For detailed instructions, see: `CUSTOM_DOMAIN_SETUP.md`**
