# Delete Account Function Fix

## Issue
The delete-account function was returning 401 Unauthorized errors and not showing any logs, indicating the request wasn't reaching the function.

## Changes Made

### 1. Fixed Frontend Call (App.tsx)
Changed from direct `fetch` call to `supabase.functions.invoke()`:

**Before:**
```typescript
const response = await fetch(functionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  body: JSON.stringify({ userId: user.id, confirmationText: deleteConfirmText }),
});
```

**After:**
```typescript
const { data, error } = await supabase.functions.invoke('delete-account', {
  body: { 
    userId: user.id,
    confirmationText: deleteConfirmText
  }
});
```

### 2. Updated Function Authentication (supabase/functions/delete-account/index.ts)
- Added `SUPABASE_ANON_KEY` environment variable check
- Created separate Supabase clients: one with anon key for JWT verification, one with service role key for admin operations
- This ensures proper JWT validation

## Required Manual Steps

### Step 1: Ensure Environment Variables are Set in Supabase

You need to verify these environment variables are set in your Supabase project:

1. Go to Supabase Dashboard → Your Project → Settings → Edge Functions
2. Ensure these secrets are set:
   - `SUPABASE_URL` (should be auto-set)
   - `SUPABASE_ANON_KEY` (should be auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY` (should be auto-set)
   - `DODO_API_KEY` (if using DodoPayments)
   - `DODO_API_MODE` (if using DodoPayments - "test" or "live")

### Step 2: Deploy the Function

Run this command in your terminal:

```bash
cd "/Users/mnvkhatri/Documents/NoCode Manav 2026/ThumbPro Files/New 29 Jan/final youbnail"
supabase functions deploy delete-account
```

### Step 3: Verify Function Deployment

After deployment, test by:
1. Going to Supabase Dashboard → Edge Functions → delete-account
2. You should see the function listed with a deployment timestamp
3. Check the "Logs" tab after attempting to delete an account

### Step 4: Test the Fix

1. Build and deploy your frontend changes:
```bash
npm run build
```

2. Try to delete an account from your application
3. You should now see logs appearing in the Supabase function logs panel
4. The 401 error should be resolved

## Why This Fix Works

The previous implementation was using a direct `fetch` call with manual header configuration, which can cause authentication issues with Supabase Edge Functions. The Supabase client's `functions.invoke()` method:

1. Automatically includes the correct authentication headers
2. Properly formats the request according to Supabase's requirements
3. Handles JWT token refresh if needed
4. Correctly passes the authorization context

The function now properly validates the JWT using the anon key client (as intended by Supabase's architecture) while still using the service role key for admin operations like deleting users.

## Troubleshooting

If you still see 401 errors after deployment:

1. **Check Environment Variables:**
   ```bash
   supabase functions env list
   ```

2. **Redeploy with explicit secrets:**
   ```bash
   supabase secrets list
   supabase functions deploy delete-account --no-verify-jwt
   ```

3. **Check Supabase Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → delete-account → Logs
   - Look for the "DELETE ACCOUNT FUNCTION CALLED" message

4. **Verify JWT in Browser Console:**
   - Open browser DevTools
   - Try to delete account
   - Check console logs for authentication session info

## Important Notes

- The function will now properly log all requests
- You should see logs even for failed authentication attempts
- The service role key is used ONLY for admin operations (deleting user)
- The anon key is used for JWT verification (standard Supabase pattern)
