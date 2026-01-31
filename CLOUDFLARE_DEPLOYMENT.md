# Cloudflare Pages Deployment Guide

## 🚀 Quick Deploy to Cloudflare Pages

### Method 1: Git Integration (Recommended - Official Cloudflare Way)
1. **Connect GitHub:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
   - Select **Create application** → **Pages** → **Connect to Git**
   - Select your GitHub repository

2. **Build Configuration:**
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

3. **Environment Variables:**
   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_URL=https://youbnail.pages.dev
   ```

### Method 2: Direct Upload via Wrangler CLI
```bash
# Build the project
npm run build

# Deploy using Pages (not Workers)
npx wrangler pages deploy dist --project-name=youbnail --compatibility-date=2026-01-31

# For first deployment, create project first
npx wrangler pages project create youbnail
npx wrangler pages deploy dist --project-name=youbnail
```

### Method 3: Manual Upload
1. **Build**: Run `npm run build`
2. **Dashboard**: Go to Cloudflare Pages → **Upload assets**  
3. **Upload**: Drag and drop your `dist` folder
4. **Configure**: Set project name as "youbnail"

## 🔧 Post-Deployment Setup

### Update Supabase URLs
Update these in your Supabase dashboard:
- **Site URL**: `https://youbnail.pages.dev`
- **Redirect URLs**: Add `https://youbnail.pages.dev/**`

### Update DodoPayments URLs
- **Webhook URL**: Update to your new domain
- **Success URL**: `https://youbnail.pages.dev/plans?success=true`
- **Cancel URL**: `https://youbnail.pages.dev/plans?canceled=true`

## ⚡ Performance Features

✅ **Automatic optimizations enabled:**
- Global CDN with 300+ locations
- Brotli compression
- HTTP/3 support
- Smart chunk splitting
- Asset caching with proper headers

✅ **Security headers configured:**
- CSP, XSS protection, clickjacking protection
- CORS properly configured for Supabase

## 🌍 Custom Domain (Optional)
1. Go to Pages → Custom domains
2. Add your domain
3. Update DNS records as instructed
4. Update environment variables with your custom domain

## 🔍 Monitoring
- **Analytics**: Built into Cloudflare dashboard
- **Real User Monitoring**: Automatic
- **Error tracking**: Via browser console + Supabase logs

Your app is now production-ready on Cloudflare Pages! 🎉