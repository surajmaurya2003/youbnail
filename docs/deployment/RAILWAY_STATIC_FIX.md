# 🚨 Railway Static File Serving Fix

## Issue: MIME Type Error & Blank Screen

**Error:** `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

**Problem:** The server is serving HTML instead of JavaScript files for asset requests.

---

## ✅ Solution: Use Railway's Built-in Static Serving

Railway can automatically serve static files without needing a custom server. This is more reliable for static sites.

### Option 1: Use Railway Static Serving (Recommended)

1. **In Railway Dashboard:**
   - Go to your project → **Settings** → **Service**
   - **Start Command:** Leave **EMPTY** (delete `npm start`)
   - **Output Directory:** Set to `dist`
   - Railway will automatically serve static files

2. **This approach:**
   - ✅ Automatically handles static files correctly
   - ✅ Proper MIME types for JS/CSS files
   - ✅ No need for `serve` package
   - ✅ Handles routing automatically

### Option 2: Fix Serve Configuration (If Option 1 doesn't work)

If you need to use `serve`, update the start command:

**In Railway Dashboard → Settings → Service:**
- **Start Command:** `cd dist && npx serve -s -l $PORT --no-clipboard`

**Or update package.json:**
```json
"start": "cd dist && npx serve -s -l $PORT --no-clipboard"
```

---

## 🔍 Root Cause

The issue is that when serving from `dist/` with base path `/app/`:
- Files are at: `dist/assets/index-*.js`
- Browser requests: `/app/assets/index-*.js`
- Server needs to serve the file correctly, not return HTML

Railway's built-in static serving handles this automatically.

---

## 📝 Steps to Fix

### Step 1: Update Railway Settings

1. Go to **Railway Dashboard** → Your Project
2. Click **Settings** → **Service**
3. **Start Command:** Delete/clear the value (leave empty)
4. **Output Directory:** `dist`
5. **Save**

### Step 2: Update Port in Railway Networking

1. Go to **Networking** tab
2. Check your domain configuration
3. Make sure port matches Railway's assigned port (usually auto-detected)
4. If you see port 8080, that's Railway's internal port - it's correct

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment
3. Or push a new commit

---

## ✅ Expected Result

After fixing:
- ✅ JavaScript files load with correct MIME type
- ✅ App renders correctly
- ✅ No blank screen
- ✅ All assets load properly

---

## 🆘 Alternative: Change Base Path to Root

If the `/app/` base path is causing issues, you can change it to root:

1. **Update `vite.config.ts`:**
   ```typescript
   base: '/',  // Change from '/app/'
   ```

2. **Update `index.tsx`:**
   ```typescript
   <BrowserRouter basename="/">  // Change from "/app"
   ```

3. **Rebuild and redeploy:**
   ```bash
   npm run build
   git add .
   git commit -m "Change base path to root"
   git push
   ```

4. **Update Railway:**
   - Visit: `https://your-app.up.railway.app/` (not `/app/`)
   - Update all domain references accordingly

---

**Recommended:** Try Option 1 first (Railway static serving) - it's the simplest and most reliable.
