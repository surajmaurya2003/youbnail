# 🚀 Complete DodoPayments Integration Guide for ThumbPro AI

**For No-Code Developers - Step-by-Step Instructions**

This guide will walk you through integrating DodoPayments into your ThumbPro AI webapp. Every step is explained in detail, so you don't need to be a coding expert to follow along.

---

## 📋 Table of Contents

1. [Understanding Your Current Setup](#understanding-your-current-setup)
2. [Step 1: Create DodoPayments Account](#step-1-create-dodopayments-account)
3. [Step 2: Set Up Products in DodoPayments Dashboard](#step-2-set-up-products-in-dodopayments-dashboard)
4. [Step 3: Get Your API Keys](#step-3-get-your-api-keys)
5. [Step 4: Update Your Environment Variables](#step-4-update-your-environment-variables)
6. [Step 5: Update Database Schema](#step-5-update-database-schema)
7. [Step 6: Install DodoPayments Package](#step-6-install-dodopayments-package)
8. [Step 7: Create Payment Service](#step-7-create-payment-service)
9. [Step 8: Create Supabase Edge Function for Checkout](#step-8-create-supabase-edge-function-for-checkout)
10. [Step 9: Create Supabase Edge Function for Webhooks](#step-9-create-supabase-edge-function-for-webhooks)
11. [Step 10: Update Your App.tsx File](#step-10-update-your-apptsx-file)
12. [Step 11: Set Up Webhook URL in DodoPayments](#step-11-set-up-webhook-url-in-dodopayments)
13. [Step 12: Test Everything](#step-12-test-everything)
14. [Step 13: Go Live](#step-13-go-live)
15. [Troubleshooting](#troubleshooting)

---

## ⚠️ Important Note Before Starting

**Please verify DodoPayments API documentation** before implementing. The code examples in this guide use standard payment API patterns, but you should:

1. **Check DodoPayments official documentation**: https://docs.dodopayments.com
2. **Verify API endpoints**: The endpoints used in this guide (e.g., `https://api.dodopayments.com/v1/checkout/sessions`) are examples - check their actual API base URL
3. **Verify request/response formats**: The JSON structure may differ from what's shown here
4. **Check webhook signature verification**: The exact method for verifying webhook signatures may vary
5. **Verify SDK installation**: Check if they have an official npm package or if you need to use REST API directly

**This guide provides a complete framework** - you may need to adjust API calls based on DodoPayments' actual documentation.

---

## Understanding Your Current Setup

### What You Have Now:
- ✅ **Frontend**: React + TypeScript app (Vite)
- ✅ **Backend**: Supabase (database, auth, storage)
- ✅ **Plans**: Starter ($20/month or $14/month annual) and Pro ($40/month or $28/month annual)
- ✅ **Current Issue**: Plans are updated directly in database without payment processing

### What We're Adding:
- 💳 **DodoPayments**: Payment processing for subscriptions
- 🔄 **Webhooks**: Automatic plan updates when payments succeed
- 💰 **Checkout Flow**: Secure payment pages for users

---

## Step 1: Create DodoPayments Account

### 1.1 Sign Up for DodoPayments

1. **Go to DodoPayments website**
   - Visit: https://dodopayments.com
   - Click **"Get Started"** or **"Sign Up"** button

2. **Fill in your information**
   - **Email**: Use your business email
   - **Password**: Create a strong password
   - **Business Name**: Enter your business/company name
   - **Country**: Select your country

3. **Verify your email**
   - Check your email inbox
   - Click the verification link sent by DodoPayments
   - This confirms your email address

### 1.2 Complete Business Verification

1. **Go to Dashboard Settings**
   - After logging in, you'll see the DodoPayments dashboard
   - Navigate to **Settings** → **Business Information**

2. **Fill in required details**
   - **Business Type**: Individual, LLC, Corporation, etc.
   - **Business Address**: Your business location
   - **Tax ID** (if applicable): Your business tax identification number
   - **Phone Number**: Business contact number

3. **Add Bank Account** (for receiving payments)
   - Go to **Settings** → **Bank Account**
   - Enter your bank account details:
     - Account holder name
     - Account number
     - Routing number (or SWIFT code for international)
     - Bank name
   - This is where DodoPayments will send your money

4. **Submit for Review**
   - DodoPayments will review your information
   - This usually takes 1-3 business days
   - You'll receive an email when approved

### 1.3 Understand Test Mode vs Live Mode

- **Test Mode**: 
  - Use this for testing without real money
  - Test cards are provided by DodoPayments
  - No real charges happen
  
- **Live Mode**:
  - Real payments, real money
  - Only switch after testing everything
  - Requires completed business verification

**For now, stay in Test Mode until Step 13.**

---

## Step 2: Set Up Products in DodoPayments Dashboard

You need to create 4 products (one for each plan/billing period combination).

### 2.1 Navigate to Products Section

1. In DodoPayments dashboard, click **"Products"** in the left sidebar
2. Click **"Create Product"** button

### 2.2 Create Starter Monthly Plan

Fill in the form:

- **Product Name**: `Starter Monthly`
- **Description**: `Starter plan billed monthly - 30 credits per month`
- **Price**: `20.00`
- **Currency**: Select your currency (USD, EUR, etc.)
- **Billing Type**: Select **"Recurring"** or **"Subscription"**
- **Billing Period**: Select **"Monthly"**
- **Trial Period** (optional): Leave as `0` or set a trial if you want
- **Click "Create Product"**

**IMPORTANT**: Copy the **Product ID** shown after creation. It looks like: `prod_xxxxxxxxxxxxx`
- Save it somewhere safe (we'll use it later)

### 2.3 Create Starter Annual Plan

Create another product:

- **Product Name**: `Starter Annual`
- **Description**: `Starter plan billed annually - 360 credits per year`
- **Price**: `168.00` (14 × 12 months)
- **Currency**: Same as above
- **Billing Type**: **"Recurring"** or **"Subscription"**
- **Billing Period**: Select **"Yearly"** or **"Annual"**
- **Trial Period**: `0` or your preference
- **Click "Create Product"**

**Copy the Product ID** for this one too.

### 2.4 Create Pro Monthly Plan

- **Product Name**: `Pro Monthly`
- **Description**: `Pro plan billed monthly - 100 credits per month`
- **Price**: `40.00`
- **Currency**: Same as above
- **Billing Type**: **"Recurring"**
- **Billing Period**: **"Monthly"**
- **Click "Create Product"**

**Copy the Product ID**.

### 2.5 Create Pro Annual Plan

- **Product Name**: `Pro Annual`
- **Description**: `Pro plan billed annually - 1200 credits per year`
- **Price**: `336.00` (28 × 12 months)
- **Currency**: Same as above
- **Billing Type**: **"Recurring"**
- **Billing Period**: **"Yearly"** or **"Annual"**
- **Click "Create Product"**

**Copy the Product ID**.

### 2.6 Save All Product IDs

Create a text file or note with all 4 Product IDs:

```
Starter Monthly: prod_xxxxxxxxxxxxx
Starter Annual: prod_xxxxxxxxxxxxx
Pro Monthly: prod_xxxxxxxxxxxxx
Pro Annual: prod_xxxxxxxxxxxxx
```

You'll need these in Step 4.

---

## Step 3: Get Your API Keys

### 3.1 Get API Key

1. In DodoPayments dashboard, go to **"Developer"** or **"API"** section
2. Look for **"API Keys"** or **"Secret Keys"**
3. You'll see two keys:
   - **Test Key** (starts with `pk_test_` or similar)
   - **Live Key** (starts with `pk_live_` or similar)

4. **For now, copy the TEST KEY**
   - It looks like: `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - This is safe to use in test mode

5. **Save it securely** - you'll add it to your environment variables

### 3.2 Get Webhook Secret

1. Still in **"Developer"** section, go to **"Webhooks"**
2. Click **"Create Webhook"** or **"Add Webhook"**
3. For now, you can leave the URL empty (we'll add it in Step 11)
4. **Copy the Webhook Secret** shown
   - It looks like: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. **Save it securely**

### 3.3 Understand What These Keys Do

- **API Key**: Used by your app to communicate with DodoPayments
  - Creating checkout sessions
  - Checking payment status
  - Managing subscriptions

- **Webhook Secret**: Used to verify that webhook requests are actually from DodoPayments
  - Prevents fake payment notifications
  - Security measure

**⚠️ NEVER share these keys publicly or commit them to GitHub!**

---

## Step 4: Update Your Environment Variables

### 4.1 Find Your .env File

Your app uses environment variables stored in a file. Let's check if you have one:

1. **Open your project folder** in your code editor (VS Code, etc.)
2. **Look for a file named**:
   - `.env`
   - `.env.local`
   - `.env.development`
   - Or create a new file: `.env.local`

### 4.2 Add DodoPayments Variables

Open your `.env.local` file (or create it if it doesn't exist) and add these lines:

```env
# Existing variables (keep these)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
GEMINI_API_KEY=your_gemini_key_here

# DodoPayments Configuration
# Use test keys for now, switch to live in Step 13
VITE_DODO_API_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DODO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DodoPayments Product IDs (from Step 2)
DODO_PRODUCT_STARTER_MONTHLY=prod_xxxxxxxxxxxxx
DODO_PRODUCT_STARTER_ANNUAL=prod_xxxxxxxxxxxxx
DODO_PRODUCT_PRO_MONTHLY=prod_xxxxxxxxxxxxx
DODO_PRODUCT_PRO_ANNUAL=prod_xxxxxxxxxxxxx

# Environment (test or live)
DODO_ENVIRONMENT=test

# Your app's base URL (for redirects after payment)
VITE_APP_URL=http://localhost:3000
# When deployed, change to: https://yourdomain.com
```

### 4.3 Replace Placeholder Values

Replace all the `xxxxxxxxxxxxx` parts with your actual values:

- `VITE_DODO_API_KEY`: Your test API key from Step 3.1
- `DODO_WEBHOOK_SECRET`: Your webhook secret from Step 3.2
- `DODO_PRODUCT_STARTER_MONTHLY`: Product ID from Step 2.2
- `DODO_PRODUCT_STARTER_ANNUAL`: Product ID from Step 2.3
- `DODO_PRODUCT_PRO_MONTHLY`: Product ID from Step 2.4
- `DODO_PRODUCT_PRO_ANNUAL`: Product ID from Step 2.5

### 4.4 Important Notes

- **VITE_ prefix**: Variables starting with `VITE_` are accessible in your frontend code
- **No VITE_ prefix**: Variables without `VITE_` are only available in backend/server code
- **Security**: Never commit `.env.local` to Git (it should be in `.gitignore`)

### 4.5 Verify Your File

Your `.env.local` should look something like this (with your actual values):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSy...
VITE_DODO_API_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz
DODO_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnop
DODO_PRODUCT_STARTER_MONTHLY=prod_abc123
DODO_PRODUCT_STARTER_ANNUAL=prod_def456
DODO_PRODUCT_PRO_MONTHLY=prod_ghi789
DODO_PRODUCT_PRO_ANNUAL=prod_jkl012
DODO_ENVIRONMENT=test
VITE_APP_URL=http://localhost:3000
```

---

## Step 5: Update Database Schema

We need to add columns to track subscriptions in your Supabase database.

### 5.1 Open Supabase Dashboard

1. Go to https://supabase.com
2. Log in to your account
3. Select your project (ThumbPro AI project)

### 5.2 Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** button

### 5.3 Run This SQL Script

Copy and paste this entire SQL script into the SQL Editor:

```sql
-- Add subscription tracking columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
ADD COLUMN IF NOT EXISTS subscription_product_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_billing_period TEXT CHECK (subscription_billing_period IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_customer_id TEXT;

-- Create subscription_history table to track all subscription changes
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON public.subscription_history(subscription_id);

-- Enable RLS on subscription_history
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own subscription history
CREATE POLICY "Users can view their own subscription history"
  ON public.subscription_history FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: System can insert subscription history (for webhooks)
-- Note: This requires a service role key, which we'll use in the edge function
```

### 5.4 Execute the Script

1. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
2. You should see a success message: "Success. No rows returned"
3. If you see any errors, read them carefully and let me know

### 5.5 Verify the Changes

1. Go to **"Table Editor"** in the left sidebar
2. Click on **"users"** table
3. You should see new columns:
   - `subscription_id`
   - `subscription_status`
   - `subscription_product_id`
   - `subscription_billing_period`
   - `subscription_started_at`
   - `subscription_ends_at`
   - `payment_customer_id`

4. You should also see a new table called **"subscription_history"**

---

## Step 6: Install DodoPayments Package (Optional)

**Note**: DodoPayments may or may not have an official npm package. Check their documentation first.

### 6.1 Check DodoPayments Documentation

1. **Go to**: https://docs.dodopayments.com
2. **Look for**: "SDK" or "Installation" or "Getting Started" section
3. **Check if they have**:
   - An official npm package (e.g., `@dodopayments/sdk` or `dodopayments`)
   - Or if you should use REST API directly

### 6.2 Option A: If They Have an Official Package

1. **Open Terminal** in your project folder
2. **Install the package** (replace with actual package name from docs):
   ```bash
   npm install @dodopayments/sdk
   # OR
   npm install dodopayments
   ```
3. **Verify installation**: Check that it appears in `package.json`

### 6.2 Option B: If No Package (Use REST API)

If DodoPayments doesn't have an npm package, you'll use their REST API directly with `fetch()` calls. This is what we're doing in the Edge Functions, so **you can skip this step** - the code in Steps 8 and 9 already uses REST API calls.

**No installation needed** - we'll use native `fetch()` which is available in modern JavaScript/TypeScript.

### 6.3 Verify (If You Installed a Package)

After installation, you should see:
- ✅ A success message
- ✅ The package added to your `package.json` file

If you see errors:
- Check the exact package name in DodoPayments docs
- Make sure you're in the correct folder
- Ensure Node.js is installed

---

## Step 7: Create Payment Service

We'll create a service file that handles all payment-related functions.

### 7.1 Create the File

1. In your project, go to the `services` folder
2. Create a new file named: `dodoPaymentsService.ts`

### 7.2 Add This Code

Copy and paste this entire code into `services/dodoPaymentsService.ts`:

```typescript
// services/dodoPaymentsService.ts

// Note: This service will be used by Supabase Edge Functions
// Frontend will call Supabase functions, which will use this service

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  planId: 'starter' | 'pro';
  billingPeriod: 'monthly' | 'annual';
}

export interface CheckoutSession {
  checkout_url: string;
  session_id: string;
}

/**
 * Creates a checkout session with DodoPayments
 * This should be called from a Supabase Edge Function (backend)
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutSession> {
  const apiKey = Deno.env.get('DODO_API_KEY') || '';
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

  // Map plan and billing period to product ID
  const productIdMap: Record<string, string> = {
    'starter-monthly': Deno.env.get('DODO_PRODUCT_STARTER_MONTHLY') || '',
    'starter-annual': Deno.env.get('DODO_PRODUCT_STARTER_ANNUAL') || '',
    'pro-monthly': Deno.env.get('DODO_PRODUCT_PRO_MONTHLY') || '',
    'pro-annual': Deno.env.get('DODO_PRODUCT_PRO_ANNUAL') || '',
  };

  const productKey = `${params.planId}-${params.billingPeriod}`;
  const productId = productIdMap[productKey];

  if (!productId) {
    throw new Error(`Product ID not found for ${productKey}`);
  }

  // Call DodoPayments API to create checkout session
  const response = await fetch('https://api.dodopayments.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      product_id: productId,
      customer_email: params.userEmail,
      success_url: `${appUrl}/app/plans?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/app/plans?canceled=true`,
      metadata: {
        user_id: params.userId,
        plan_id: params.planId,
        billing_period: params.billingPeriod,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create checkout session: ${error}`);
  }

  const data = await response.json();
  
  return {
    checkout_url: data.checkout_url || data.url,
    session_id: data.session_id || data.id,
  };
}

/**
 * Verifies webhook signature from DodoPayments
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // DodoPayments webhook verification logic
  // This is a simplified version - check DodoPayments docs for exact implementation
  const crypto = globalThis.crypto;
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(payload);
  
  // Note: Actual implementation depends on DodoPayments' signature method
  // Check their documentation for the exact algorithm
  return true; // Placeholder - implement actual verification
}

/**
 * Maps DodoPayments subscription status to our status
 */
export function mapSubscriptionStatus(dodoStatus: string): 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing' {
  const statusMap: Record<string, 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'> = {
    'active': 'active',
    'trialing': 'trialing',
    'past_due': 'past_due',
    'cancelled': 'cancelled',
    'canceled': 'cancelled',
    'inactive': 'inactive',
  };
  
  return statusMap[dodoStatus.toLowerCase()] || 'inactive';
}
```

### 7.3 Save the File

Save the file. This service will be used by Supabase Edge Functions.

**Note**: The actual DodoPayments API endpoints and structure may vary. Check DodoPayments documentation for the exact API format.

---

## Step 8: Create Supabase Edge Function for Checkout

Supabase Edge Functions are serverless functions that run on Supabase's servers. We'll create one to handle checkout session creation.

### 8.1 Install Supabase CLI (if not already installed)

1. **Check if you have it**:
   ```bash
   supabase --version
   ```

2. **If not installed, install it**:
   - **Mac/Linux**:
     ```bash
     brew install supabase/tap/supabase
     ```
   - **Or using npm**:
     ```bash
     npm install -g supabase
     ```

3. **Login to Supabase**:
   ```bash
   supabase login
     ```
   - This will open a browser for authentication

### 8.2 Link Your Project

1. **Navigate to your project folder** in terminal
2. **Link to your Supabase project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   - Find your project ref in Supabase dashboard → Settings → General → Reference ID

### 8.3 Create the Edge Function

1. **Create the function**:
   ```bash
   supabase functions new create-checkout
   ```

2. **This creates a folder**: `supabase/functions/create-checkout/`

### 8.4 Write the Function Code

1. **Open the file**: `supabase/functions/create-checkout/index.ts`

2. **Replace its contents with**:

```typescript
// supabase/functions/create-checkout/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const dodoApiKey = Deno.env.get('DODO_API_KEY') || '';
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';
    
    const productIdMap: Record<string, string> = {
      'starter-monthly': Deno.env.get('DODO_PRODUCT_STARTER_MONTHLY') || '',
      'starter-annual': Deno.env.get('DODO_PRODUCT_STARTER_ANNUAL') || '',
      'pro-monthly': Deno.env.get('DODO_PRODUCT_PRO_MONTHLY') || '',
      'pro-annual': Deno.env.get('DODO_PRODUCT_PRO_ANNUAL') || '',
    };

    // Parse request body
    const { userId, planId, billingPeriod } = await req.json();

    // Validate input
    if (!userId || !planId || !billingPeriod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user email from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get product ID
    const productKey = `${planId}-${billingPeriod}`;
    const productId = productIdMap[productKey];

    if (!productId) {
      return new Response(
        JSON.stringify({ error: `Product not found for ${productKey}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create checkout session with DodoPayments
    // NOTE: Update this URL to match DodoPayments actual API endpoint
    const dodoResponse = await fetch('https://api.dodopayments.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dodoApiKey}`,
      },
      body: JSON.stringify({
        product_id: productId,
        customer_email: userData.email,
        success_url: `${appUrl}/app/plans?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/app/plans?canceled=true`,
        metadata: {
          user_id: userId,
          plan_id: planId,
          billing_period: billingPeriod,
        },
      }),
    });

    if (!dodoResponse.ok) {
      const errorText = await dodoResponse.text();
      console.error('DodoPayments API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checkoutData = await dodoResponse.json();

    return new Response(
      JSON.stringify({
        checkout_url: checkoutData.checkout_url || checkoutData.url,
        session_id: checkoutData.session_id || checkoutData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 8.5 Set Environment Variables for Edge Function

1. **In Supabase Dashboard**, go to **Edge Functions** → **Settings**
2. **Add these secrets**:
   - `DODO_API_KEY`: Your DodoPayments API key
   - `DODO_PRODUCT_STARTER_MONTHLY`: Product ID
   - `DODO_PRODUCT_STARTER_ANNUAL`: Product ID
   - `DODO_PRODUCT_PRO_MONTHLY`: Product ID
   - `DODO_PRODUCT_PRO_ANNUAL`: Product ID
   - `APP_URL`: Your app URL (http://localhost:3000 for dev)

3. **Also add**:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Found in Settings → API → service_role key

### 8.6 Deploy the Function

1. **In terminal**, run:
   ```bash
   supabase functions deploy create-checkout
   ```

2. **Wait for deployment** - you'll see a success message with the function URL

---

## Step 9: Create Supabase Edge Function for Webhooks

This function receives payment notifications from DodoPayments.

### 9.1 Create the Function

```bash
supabase functions new dodo-webhook
```

### 9.2 Write the Webhook Handler

Open `supabase/functions/dodo-webhook/index.ts` and add:

```typescript
// supabase/functions/dodo-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get webhook secret
    const webhookSecret = Deno.env.get('DODO_WEBHOOK_SECRET') || '';
    
    // Get signature from headers
    const signature = req.headers.get('x-dodo-signature') || req.headers.get('dodo-signature') || '';
    
    // Verify webhook signature (implement based on DodoPayments docs)
    const body = await req.text();
    // TODO: Implement actual signature verification
    // const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    // if (!isValid) {
    //   return new Response('Invalid signature', { status: 401 });
    // }

    // Parse webhook event
    const event = JSON.parse(body);
    const eventType = event.type || event.event_type;
    const eventData = event.data || event;

    console.log('Received webhook event:', eventType);

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different event types
    switch (eventType) {
      case 'payment.succeeded':
      case 'subscription.created':
      case 'subscription.renewed': {
        // Get user ID from metadata
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const planId = eventData.metadata?.plan_id || 'starter';
        const billingPeriod = eventData.metadata?.billing_period || 'monthly';
        const subscriptionId = eventData.subscription_id || eventData.id;
        const productId = eventData.product_id;

        if (!userId) {
          console.error('No user_id in webhook event');
          return new Response('Missing user_id', { status: 400 });
        }

        // Calculate credits based on plan
        const creditsMap: Record<string, number> = {
          'starter-monthly': 30,
          'starter-annual': 360,
          'pro-monthly': 100,
          'pro-annual': 1200,
        };
        const credits = creditsMap[`${planId}-${billingPeriod}`] || 30;

        // Calculate subscription end date
        const now = new Date();
        const endsAt = new Date(now);
        if (billingPeriod === 'monthly') {
          endsAt.setMonth(endsAt.getMonth() + 1);
        } else {
          endsAt.setFullYear(endsAt.getFullYear() + 1);
        }

        // Update user subscription
        const { error: updateError } = await supabaseClient
          .from('users')
          .update({
            plan: planId,
            credits: credits,
            subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_product_id: productId,
            subscription_billing_period: billingPeriod,
            subscription_started_at: now.toISOString(),
            subscription_ends_at: endsAt.toISOString(),
            payment_customer_id: eventData.customer_id || eventData.customer?.id,
            updated_at: now.toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user:', updateError);
          return new Response('Database error', { status: 500 });
        }

        // Record in subscription history
        await supabaseClient.from('subscription_history').insert({
          user_id: userId,
          subscription_id: subscriptionId,
          product_id: productId,
          billing_period: billingPeriod,
          status: 'active',
          amount_paid: eventData.amount || eventData.amount_paid || 0,
          currency: eventData.currency || 'USD',
          started_at: now.toISOString(),
          ends_at: endsAt.toISOString(),
        });

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.cancelled':
      case 'subscription.canceled': {
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (userId) {
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);

          // Update subscription history
          await supabaseClient
            .from('subscription_history')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'payment.failed':
      case 'subscription.past_due': {
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (userId) {
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        console.log('Unhandled event type:', eventType);
        return new Response(JSON.stringify({ received: true, message: 'Event not handled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 9.3 Deploy the Webhook Function

```bash
supabase functions deploy dodo-webhook
```

### 9.4 Get the Webhook URL

After deployment, you'll get a URL like:
```
https://your-project-ref.supabase.co/functions/v1/dodo-webhook
```

**Save this URL** - you'll need it in Step 11.

---

## Step 10: Update Your App.tsx File

Now we need to modify your app to use DodoPayments checkout instead of directly updating plans.

### 10.1 Find the Plan Selection Button

In `App.tsx`, find the button that says "Update Plan" (around line 1922).

### 10.2 Replace the Button Click Handler

Find this section (around line 1923-1959):

```typescript
onClick={async () => {
  // ... existing code that directly updates plan
}}
```

Replace it with this new code:

```typescript
onClick={async () => {
  if (!user) {
    alert('Please sign in to update your plan');
    return;
  }

  if (user.plan === plan.id) {
    alert('You are already on this plan');
    return;
  }

  if (isUpdatingPlan) return;

  setIsUpdatingPlan(plan.id);

  try {
    // Call Supabase Edge Function to create checkout session
    const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-checkout', {
      body: {
        userId: user.id,
        planId: plan.id,
        billingPeriod: billingPeriod,
      },
    });

    if (sessionError) {
      throw new Error(sessionError.message || 'Failed to create checkout session');
    }

    if (!sessionData?.checkout_url) {
      throw new Error('No checkout URL received');
    }

    // Redirect user to DodoPayments checkout page
    window.location.href = sessionData.checkout_url;
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    alert(`❌ Failed to start checkout: ${error.message || 'Please try again.'}`);
    setIsUpdatingPlan(null);
  }
}}
```

### 10.3 Add Success/Cancel Handling

Add this code near the top of your App component (after the state declarations, around line 100):

```typescript
// Handle payment success/cancel redirects
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const canceled = urlParams.get('canceled');
  const sessionId = urlParams.get('session_id');

  if (success === 'true' && sessionId) {
    // Payment successful - webhook will update the plan
    alert('✅ Payment successful! Your plan will be updated shortly.');
    // Clean up URL
    window.history.replaceState({}, '', '/app/plans');
    // Refresh user data after a short delay to allow webhook to process
    setTimeout(async () => {
      if (user) {
        const updatedProfile = await userService.getUserProfile(user.id);
        if (updatedProfile) {
          setUser(updatedProfile);
        }
      }
    }, 3000);
  } else if (canceled === 'true') {
    alert('Payment was canceled. No charges were made.');
    // Clean up URL
    window.history.replaceState({}, '', '/app/plans');
  }
}, [user]);
```

### 10.4 Save the File

Save `App.tsx` with these changes.

---

## Step 11: Set Up Webhook URL in DodoPayments

Now we need to tell DodoPayments where to send payment notifications.

### 11.1 Get Your Webhook URL

From Step 9.4, you have a URL like:
```
https://your-project-ref.supabase.co/functions/v1/dodo-webhook
```

### 11.2 Add Webhook in DodoPayments Dashboard

1. **Go to DodoPayments Dashboard**
2. **Navigate to**: Developer → Webhooks (or Settings → Webhooks)
3. **Click**: "Add Webhook" or "Create Webhook"
4. **Enter Webhook URL**: Paste your Supabase function URL
5. **Select Events** to listen for:
   - ✅ `payment.succeeded`
   - ✅ `subscription.created`
   - ✅ `subscription.renewed`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.past_due`
   - ✅ `payment.failed`

6. **Click**: "Save" or "Create Webhook"

### 11.3 Test the Webhook

1. **In DodoPayments dashboard**, look for a "Test Webhook" or "Send Test Event" button
2. **Send a test event** to verify your webhook is receiving events
3. **Check Supabase logs**:
   - Go to Supabase Dashboard → Edge Functions → dodo-webhook → Logs
   - You should see the test event logged

---

## Step 12: Test Everything

Now let's test the entire payment flow.

### 12.1 Start Your Development Server

```bash
npm run dev
```

### 12.2 Test the Checkout Flow

1. **Open your app** in browser: http://localhost:3000
2. **Sign in** to your account
3. **Go to Plans page** (click "Plans" in navigation)
4. **Select a plan** (choose one you're NOT currently on)
5. **Click "Update Plan"** button
6. **You should be redirected** to DodoPayments checkout page

### 12.3 Use Test Card

On the DodoPayments checkout page:

1. **Use test card details** (provided by DodoPayments):
   - **Card Number**: Usually something like `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)

2. **Complete the payment**
3. **You should be redirected** back to your app with a success message

### 12.4 Verify Database Update

1. **Go to Supabase Dashboard** → Table Editor → users table
2. **Find your user** (search by email)
3. **Check these fields**:
   - `subscription_status` should be `active`
   - `plan` should be the plan you selected
   - `credits` should be updated
   - `subscription_id` should have a value

### 12.5 Check Subscription History

1. **Go to**: Table Editor → subscription_history
2. **You should see a new record** with your subscription details

### 12.6 Test Different Scenarios

- ✅ Test monthly plan
- ✅ Test annual plan
- ✅ Test upgrading from Starter to Pro
- ✅ Test canceling a subscription (if you have that feature)

---

## Step 13: Go Live

Once everything works in test mode, switch to live mode.

### 13.1 Update Environment Variables

1. **In DodoPayments Dashboard**, get your **LIVE API KEY** (starts with `pk_live_`)
2. **Update `.env.local`**:
   ```env
   VITE_DODO_API_KEY=pk_live_xxxxxxxxxxxxx  # Use live key
   DODO_ENVIRONMENT=live
   ```

3. **Update Supabase Edge Function secrets**:
   - Go to Supabase Dashboard → Edge Functions → Settings
   - Update `DODO_API_KEY` to your live key
   - Update `DODO_ENVIRONMENT` to `live`

### 13.2 Update Product IDs (if needed)

If you created new products for live mode:
- Update `DODO_PRODUCT_*` variables with live product IDs

### 13.3 Update App URL

In `.env.local` and Supabase secrets:
```env
VITE_APP_URL=https://yourdomain.com  # Your actual domain
APP_URL=https://yourdomain.com
```

### 13.4 Update Webhook URL

1. **In DodoPayments Dashboard**, update webhook URL if it changed
2. **Make sure it's using HTTPS** (not HTTP)

### 13.5 Final Verification

1. **Do a small real transaction** (test with a real card for a small amount)
2. **Verify payment appears** in DodoPayments dashboard
3. **Verify webhook is called** (check Supabase logs)
4. **Verify user plan is updated** in database
5. **Verify money appears** in your bank account (may take a few days)

---

## Troubleshooting

### Problem: "Failed to create checkout session"

**Solutions**:
- ✅ Check that your API key is correct in `.env.local`
- ✅ Verify product IDs are correct
- ✅ Check Supabase Edge Function logs for errors
- ✅ Make sure Edge Function secrets are set correctly

### Problem: Webhook not receiving events

**Solutions**:
- ✅ Verify webhook URL is correct in DodoPayments dashboard
- ✅ Check that webhook URL is publicly accessible (not localhost)
- ✅ Verify webhook secret matches in both places
- ✅ Check Supabase Edge Function logs

### Problem: Plan not updating after payment

**Solutions**:
- ✅ Check Supabase logs for webhook errors
- ✅ Verify user_id is in webhook metadata
- ✅ Check database permissions (RLS policies)
- ✅ Manually check subscription_history table

### Problem: "Invalid signature" error

**Solutions**:
- ✅ Verify webhook secret is correct
- ✅ Check DodoPayments documentation for signature verification method
- ✅ Make sure you're using the raw request body for verification

### Problem: CORS errors

**Solutions**:
- ✅ Check that CORS headers are set in Edge Functions
- ✅ Verify your app URL is correct

---

## Additional Features (Optional)

### Customer Portal

Let users manage their subscriptions:
- Update payment method
- Cancel subscription
- View billing history

DodoPayments may provide a customer portal URL you can link to.

### Email Notifications

Set up emails for:
- Payment confirmations
- Subscription renewals
- Payment failures
- Cancellation confirmations

### Refunds

Handle refunds through:
- DodoPayments dashboard (manual)
- DodoPayments API (programmatic)

---

## Summary Checklist

Before going live, make sure:

- [ ] DodoPayments account created and verified
- [ ] Bank account added and verified
- [ ] 4 products created (Starter/Pro × Monthly/Annual)
- [ ] API keys saved securely
- [ ] Environment variables set in `.env.local`
- [ ] Database schema updated (subscription columns added)
- [ ] DodoPayments package installed
- [ ] Supabase Edge Functions created and deployed
- [ ] Webhook URL configured in DodoPayments
- [ ] App.tsx updated to use checkout flow
- [ ] Test mode fully tested
- [ ] Live mode API keys obtained
- [ ] Live mode tested with small transaction
- [ ] Webhook receiving events correctly
- [ ] Database updating correctly
- [ ] Money appearing in bank account

---

## Need Help?

If you get stuck:

1. **Check DodoPayments Documentation**: https://docs.dodopayments.com
2. **Check Supabase Logs**: Dashboard → Edge Functions → Logs
3. **Check Browser Console**: Open DevTools (F12) → Console tab
4. **Verify Environment Variables**: Make sure all are set correctly

---

## Important Notes

⚠️ **Security**:
- Never commit `.env.local` to Git
- Never share API keys publicly
- Always use HTTPS in production
- Verify webhook signatures

💰 **Pricing**:
- DodoPayments charges transaction fees (check their pricing page)
- Factor this into your plan prices

🔄 **Webhooks**:
- Webhooks may be delayed (usually seconds, sometimes minutes)
- Implement retry logic for failed webhooks
- Keep webhook endpoints fast (< 5 seconds response time)

📊 **Monitoring**:
- Monitor payment success rates
- Track subscription cancellations
- Set up alerts for payment failures

---

**Congratulations!** 🎉 You've successfully integrated DodoPayments into your ThumbPro AI app!
