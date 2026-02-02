# Testing Delete Account Function

## Steps to Debug the Issue

### 1. Check Browser Console
When you try to delete an account, open your browser's Developer Tools (F12) and check the Console tab. You should see:
- "Session verified, calling delete-account function..."
- "User ID: [your user id]"
- "Confirmation text: DELETE"
- "Function response: { data: ..., error: ... }"

### 2. Check Supabase Function Logs
Go to: https://supabase.com/dashboard/project/wawfgjzpwykvjgmuaueb/functions/delete-account/logs

Look for these log messages:
- "DELETE ACCOUNT FUNCTION CALLED"
- "DELETE ACCOUNT: Request received"
- "DELETE ACCOUNT: Environment variables check"
- "DELETE ACCOUNT: Auth header present"

### 3. Common Issues and Solutions

#### Issue: "Edge Function returned a non-2xx status code"
This means the function is running but returning an error. Check the browser console for the detailed error object.

**Possible causes:**
1. **Missing SUPABASE_ANON_KEY**: The function needs this but it's auto-provided by Supabase
2. **JWT verification failing**: The token format might be incorrect
3. **Environment variables missing**: Check Supabase dashboard

#### Issue: No logs appearing in Supabase
This means the function isn't being reached at all.

**Solutions:**
- Verify the function is deployed: `supabase functions list`
- Check if you're logged in to the correct project
- Ensure your session is valid

### 4. Manual Test Using cURL

You can test the function directly:

```bash
# Get your access token from the browser console
# Run this in the browser console when logged in:
# supabase.auth.getSession().then(({data}) => console.log(data.session.access_token))

# Then test the function:
curl -i --location --request POST 'https://wawfgjzpwykvjgmuaueb.supabase.co/functions/v1/delete-account' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN_HERE' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"YOUR_USER_ID","confirmationText":"DELETE"}'
```

### 5. Check Current Deployment

Run this to verify deployment:
```bash
cd "/Users/mnvkhatri/Documents/NoCode Manav 2026/ThumbPro Files/New 29 Jan/final youbnail"
supabase functions list
```

### 6. Force Redeploy with Verbose Logging

If nothing works, try redeploying with debug output:
```bash
cd "/Users/mnvkhatri/Documents/NoCode Manav 2026/ThumbPro Files/New 29 Jan/final youbnail"
supabase functions deploy delete-account --debug
```

## Expected Behavior

When working correctly:
1. User clicks "Delete Account"
2. Types "DELETE" in the confirmation modal
3. Frontend sends request to Supabase function
4. Function logs appear in Supabase dashboard
5. Function verifies JWT token
6. Function deletes user data, storage, and account
7. User is logged out and redirected to landing page

## Current Status

✅ Function deployed successfully
✅ Frontend code updated to use supabase.functions.invoke()
✅ Environment variables are set in Supabase
⚠️ Function returning non-2xx status code
❓ No logs showing (need to check after deployment)

## Next Steps

1. Deploy the frontend to your hosting (Railway, etc.)
2. Try deleting an account and check the browser console
3. Report back what you see in the console and Supabase logs
4. We can then pinpoint the exact issue
