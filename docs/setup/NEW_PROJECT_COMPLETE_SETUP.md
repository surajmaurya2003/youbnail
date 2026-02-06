# 🚀 Complete Setup Guide for New Supabase Project

This guide will help you set up everything from scratch in a new Supabase project.

---

## 📋 What You'll Set Up

1. ✅ **Database Schema** (SQL scripts)
2. ✅ **Secrets/Environment Variables** (8 secrets)
3. ✅ **Edge Functions** (2 functions)
4. ✅ **DodoPayments Webhook** (1 endpoint)

---

## Step 1: Create New Supabase Project

### 1.1 Create Project
1. Go to: https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** ThumbPro AI (or your choice)
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### 1.2 Get Project Credentials
1. Go to: **Settings → API**
2. Copy these (you'll need them):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ⚠️ Keep secret!

---

## Step 2: Set Up Database Schema

### 2.1 Open SQL Editor
1. In Supabase Dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New Query"**

### 2.2 Run Base Schema Script

Copy and paste this **entire script** into SQL Editor:

```sql
-- ============================================
-- BASE SCHEMA: Tables, Indexes, RLS Policies
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 2,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Subscription columns (for DodoPayments)
  subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  subscription_product_id TEXT,
  subscription_billing_period TEXT CHECK (subscription_billing_period IN ('monthly', 'annual')),
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  payment_customer_id TEXT
);

-- Thumbnails table
CREATE TABLE IF NOT EXISTS public.thumbnails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage records table
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('generation', 'edit')),
  mode TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 1,
  prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscription history table
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status TEXT NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  started_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_thumbnails_user_id ON public.thumbnails(user_id);
CREATE INDEX IF NOT EXISTS idx_thumbnails_created_at ON public.thumbnails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON public.usage_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON public.subscription_history(subscription_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for thumbnails table
CREATE POLICY "Users can view their own thumbnails"
  ON public.thumbnails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own thumbnails"
  ON public.thumbnails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thumbnails"
  ON public.thumbnails FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for usage_records table
CREATE POLICY "Users can view their own usage records"
  ON public.usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage records"
  ON public.usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscription_history table
CREATE POLICY "Users can view their own subscription history"
  ON public.subscription_history FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger function to create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, credits, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    2,  -- Free users get 2 credits
    'free'  -- Free plan (no paid plan)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 2.3 Execute Script
1. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for success message: **"Success. No rows returned"**
3. If you see errors, check them carefully

### 2.4 Verify Tables Created
1. Go to: **Table Editor** in left sidebar
2. You should see these tables:
   - ✅ `users`
   - ✅ `thumbnails`
   - ✅ `usage_records`
   - ✅ `subscription_history`

---

## Step 3: Set Up Edge Functions Secrets

### 3.1 Navigate to Secrets
1. Go to: **Edge Functions** in left sidebar
2. Click **"Settings"** (gear icon)
3. Click **"Secrets"** tab

### 3.2 Add All 8 Secrets

Click **"Add Secret"** for each of these:

#### Secret 1: `DODO_API_KEY`
- **Name:** `DODO_API_KEY`
- **Value:** Your DodoPayments API key (from DodoPayments Dashboard → Developer → API Keys)
- **Format:** `pk_test_xxxxxxxxxxxxx` or `pk_live_xxxxxxxxxxxxx`

#### Secret 2: `DODO_PRODUCT_STARTER_MONTHLY`
- **Name:** `DODO_PRODUCT_STARTER_MONTHLY`
- **Value:** Product ID from DodoPayments Dashboard → Products
- **Format:** `prod_xxxxxxxxxxxxx`

#### Secret 3: `DODO_PRODUCT_STARTER_ANNUAL`
- **Name:** `DODO_PRODUCT_STARTER_ANNUAL`
- **Value:** Product ID from DodoPayments Dashboard → Products
- **Format:** `prod_xxxxxxxxxxxxx`

#### Secret 4: `DODO_PRODUCT_PRO_MONTHLY`
- **Name:** `DODO_PRODUCT_PRO_MONTHLY`
- **Value:** Product ID from DodoPayments Dashboard → Products
- **Format:** `prod_xxxxxxxxxxxxx`

#### Secret 5: `DODO_PRODUCT_PRO_ANNUAL`
- **Name:** `DODO_PRODUCT_PRO_ANNUAL`
- **Value:** Product ID from DodoPayments Dashboard → Products
- **Format:** `prod_xxxxxxxxxxxxx`

#### Secret 6: `APP_URL`
- **Name:** `APP_URL`
- **Value:** 
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

#### Secret 7: `SUPABASE_URL`
- **Name:** `SUPABASE_URL`
- **Value:** Your Supabase project URL (from Settings → API)
- **Format:** `https://xxxxx.supabase.co`
- Note: In some environments this is injected automatically, but adding it as a secret is safe.

#### Secret 8: `SERVICE_ROLE_KEY`
- **Name:** `SERVICE_ROLE_KEY`
- **Value:** Service role key (from Settings → API → service_role key)
- **Format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- ⚠️ **Keep this secret!** Never share it publicly.

#### Optional Secret 9: `DODO_WEBHOOK_SECRET`
- **Name:** `DODO_WEBHOOK_SECRET`
- **Value:** Webhook secret from DodoPayments Dashboard → Developer → Webhooks
- **Format:** `whsec_xxxxxxxxxxxxx`

---

## Step 4: Deploy Edge Functions

You have **2 options**: Terminal (recommended) or Manual.

---

### Option A: Deploy via Terminal (Recommended)

#### 4.1 Install Supabase CLI (if not installed)

```bash
# macOS
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

#### 4.2 Link to Your Project

```bash
# Navigate to your project directory
cd "/Users/mnvkhatri/Documents/NoCode Manav 2026/ThumbPro Files/✅thumbpro-ai"

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# You'll be prompted to enter:
# - Database password (from Step 1.1)
# - Confirm linking
```

**To find your Project Ref:**
- Go to Supabase Dashboard → Settings → General
- Look for **"Reference ID"** (e.g., `wawfgjzpwykvjgmuaueb`)

#### 4.3 Deploy Functions

```bash
# Deploy create-checkout function
supabase functions deploy create-checkout --no-verify-jwt

# Deploy dodo-webhook function
supabase functions deploy dodo-webhook --no-verify-jwt
```

**Expected output:**
```
Deployed Functions on project xxxxx: create-checkout
You can inspect your deployment in the Dashboard: https://supabase.com/dashboard/project/xxxxx/functions
```

#### 4.4 Verify Deployment

1. Go to: Supabase Dashboard → Edge Functions
2. You should see:
   - ✅ `create-checkout` (with URL)
   - ✅ `dodo-webhook` (with URL)

---

### Option B: Deploy Manually (via Dashboard)

#### 4.1 Create Function Files Locally

Your functions are already in:
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/dodo-webhook/index.ts`

#### 4.2 Deploy via Dashboard

1. Go to: **Edge Functions** in Supabase Dashboard
2. Click **"Deploy a new function"**
3. Choose **"Create from scratch"** or **"Upload from file"**

**For `create-checkout`:**
1. Click **"Deploy a new function"**
2. Name: `create-checkout`
3. Copy contents from `supabase/functions/create-checkout/index.ts`
4. Paste into editor
5. Click **"Deploy"**

**For `dodo-webhook`:**
1. Click **"Deploy a new function"**
2. Name: `dodo-webhook`
3. Copy contents from `supabase/functions/dodo-webhook/index.ts`
4. Paste into editor
5. Click **"Deploy"**

**Note:** Manual deployment is more tedious. Terminal method is recommended.

---

## Step 5: Set Up DodoPayments Webhook

### 5.1 Get Webhook URL

After deploying `dodo-webhook`, get its URL:
1. Go to: Supabase Dashboard → Edge Functions → `dodo-webhook`
2. Copy the **Function URL**
3. Format: `https://xxxxx.supabase.co/functions/v1/dodo-webhook`

### 5.2 Configure in DodoPayments

1. Go to: DodoPayments Dashboard → Webhooks → Endpoints
2. Click **"Add Endpoint"** or **"Create Webhook"**
3. **URL:** Paste the `dodo-webhook` URL from Step 5.1
4. **Events:** Select all subscription events:
   - ✅ `payment.succeeded`
   - ✅ `payment.failed`
   - ✅ `subscription.active`
   - ✅ `subscription.renewed`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.failed`
   - ✅ `subscription.expired`
   - ✅ `subscription.updated`
   - ✅ `subscription.plan_changed`
5. Click **"Save"** or **"Create"**

---

## Step 6: Update Frontend Environment Variables

### 6.1 Update `.env.local` File

In your project root, update or create `.env.local`:

```env
# Supabase Configuration (NEW PROJECT)
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY

# Existing (keep these)
GEMINI_API_KEY=your_gemini_key_here

# DodoPayments (if using in frontend)
VITE_DODO_API_KEY=pk_test_xxxxxxxxxxxxx
VITE_APP_URL=http://localhost:3000
```

**Replace:**
- `YOUR_NEW_PROJECT_REF` = Your new Supabase project reference ID
- `YOUR_NEW_ANON_KEY` = Your new anon key from Settings → API

### 6.2 Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

---

## Step 7: Verify Everything Works

### 7.1 Test Database
1. Go to: Supabase Dashboard → Table Editor → `users`
2. Try creating a test user (via Auth → Users → Add user)
3. Verify user is created with `plan: 'free'` and `credits: 2`

### 7.2 Test Edge Functions
1. Go to: Supabase Dashboard → Edge Functions → `create-checkout` → Logs
2. Should see logs when function is called
3. Check `dodo-webhook` logs too

### 7.3 Test Checkout Flow
1. Go to your app: `http://localhost:3000`
2. Sign up a new user
3. Go to Plans page
4. Click "Choose Plan"
5. Should redirect to DodoPayments checkout (not show 500 error)

---

## 📝 Quick Checklist

- [ ] ✅ New Supabase project created
- [ ] ✅ Database schema SQL executed
- [ ] ✅ All 8 secrets added in Edge Functions → Settings → Secrets
- [ ] ✅ `create-checkout` function deployed
- [ ] ✅ `dodo-webhook` function deployed
- [ ] ✅ DodoPayments webhook URL configured (pointing to `dodo-webhook`)
- [ ] ✅ Frontend `.env.local` updated with new Supabase credentials
- [ ] ✅ Dev server restarted
- [ ] ✅ Tested checkout flow

---

## 🔍 Troubleshooting

### Issue: "Function not found" error
- ✅ Verify functions are deployed: Dashboard → Edge Functions
- ✅ Check function URLs are correct

### Issue: "500 Error" when clicking "Choose Plan"
- ✅ Check all 8 secrets are set
- ✅ Verify secrets match DodoPayments dashboard
- ✅ Check function logs for specific errors

### Issue: "User not found" error
- ✅ Verify database schema was executed
- ✅ Check `handle_new_user()` trigger exists
- ✅ Verify RLS policies are set

### Issue: Webhook not receiving events
- ✅ Verify webhook URL is `.../dodo-webhook` (not `.../create-checkout`)
- ✅ Check events are subscribed in DodoPayments
- ✅ Check `dodo-webhook` function logs

---

## 🎉 You're Done!

After completing all steps, your new Supabase project should be fully configured and ready to use!

**Next Steps:**
1. Test the complete user flow (signup → choose plan → checkout → webhook)
2. Monitor function logs for any issues
3. Set up production environment variables when ready to deploy
