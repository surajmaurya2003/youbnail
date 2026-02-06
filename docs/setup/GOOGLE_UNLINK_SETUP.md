# Google Account Unlinking Setup

## Overview
This guide explains how to set up Google account unlinking functionality using Supabase Edge Functions.

## Problem
The original implementation was throwing a hardcoded error message because Supabase client doesn't support unlinking OAuth providers directly. This requires admin-level access.

## Solution
Created a Supabase Edge Function that uses the admin client to properly unlink Google accounts.

## Files Created/Modified

### 1. Edge Function
- **File**: `supabase/functions/unlink-google/index.ts`
- **Purpose**: Handles Google account unlinking using Supabase admin API

### 2. Service Update
- **File**: `services/supabaseService.ts`
- **Changes**: Updated `unlinkGoogle()` method to call the edge function

## Deployment Instructions

### Step 1: Deploy the Edge Function
```bash
# Navigate to your project root
cd /path/to/youbnail

# Deploy the unlink-google function
supabase functions deploy unlink-google

# Or deploy all functions
supabase functions deploy
```

### Step 2: Set Environment Variables
Make sure your Supabase project has the required environment variables:

1. Go to your Supabase dashboard
2. Navigate to Project Settings > Edge Functions
3. Ensure these variables are set:
   - `SUPABASE_URL` (automatically set)
   - `SUPABASE_SERVICE_ROLE_KEY` (automatically set)

### Step 3: Test the Function
```bash
# Test locally (optional)
supabase functions serve unlink-google

# Test with curl (replace with your actual values)
curl -X POST "https://your-project.supabase.co/functions/v1/unlink-google" \
  -H "Authorization: Bearer your-user-jwt-token" \
  -H "Content-Type: application/json"
```

## How It Works

1. **Frontend**: User clicks "Unlink" button in account settings
2. **Service Layer**: `authService.unlinkGoogle()` is called
3. **Edge Function**: Function receives authenticated request
4. **Admin API**: Function uses admin client to unlink the Google identity
5. **Response**: Success or error message returned to frontend

## Security Features

- ✅ User authentication required (JWT token)
- ✅ Validates user has alternative authentication method
- ✅ Uses admin API for secure unlinking
- ✅ Proper error handling and logging
- ✅ CORS headers for frontend integration

## Error Handling

The function handles various error scenarios:
- No authentication token
- Google account not linked
- No alternative authentication method
- Admin API failures

## Future Improvements

1. **Email Notification**: Send confirmation email when account is unlinked
2. **Audit Logging**: Log unlinking events for security tracking
3. **Rate Limiting**: Implement rate limiting for the function
4. **Backup Method**: Alternative unlinking process for edge cases

## Testing

After deployment, test the functionality:
1. Sign in with Google
2. Go to account settings
3. Click "Unlink" next to Google account
4. Verify the account is unlinked successfully
5. Test signing back in with magic link/email

## Troubleshooting

### Function Not Found Error
- Ensure function is deployed: `supabase functions list`
- Check function name matches exactly: `unlink-google`

### Permission Denied
- Verify service role key is set correctly
- Check user has valid JWT token

### "No Alternative Auth Method" Error
- User needs to set up email/password or magic link authentication
- Guide users to add alternative authentication before unlinking