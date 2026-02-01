# Secure Contact Form Webhook Setup Guide

## 📋 Setup Instructions

### 1. Deploy the Supabase Function

```bash
# Deploy the webhook function
supabase functions deploy send-contact-webhook

# Verify deployment
supabase functions list
```

### 2. Configure Environment Variables

In your Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions**
2. Add these environment variables:

```
CONTACT_WEBHOOK_URL=https://your-webhook-endpoint.com/contact
CONTACT_WEBHOOK_SECRET=your-super-secret-key-12345
```

**Important:** 
- Replace `your-webhook-endpoint.com/contact` with your actual webhook URL
- Generate a strong secret key (use a password generator)

### 3. Webhook Receiver Example

If you need to set up a webhook receiver, here's a Node.js example:

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Webhook verification function
function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === `sha256=${expectedSignature}`;
}

// Contact form webhook handler
app.post('/contact', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;
  
  // Verify the webhook signature
  if (!verifyWebhook(payload, signature, secret)) {
    console.log('❌ Invalid webhook signature');
    return res.status(401).send('Unauthorized');
  }
  
  // Process the verified contact form data
  const { name, email, message, timestamp, source, ip } = req.body;
  
  console.log('✅ New contact form submission:', {
    name,
    email,
    message,
    timestamp,
    source,
    ip
  });
  
  // Here you can:
  // - Save to database
  // - Send email notification
  // - Send to Slack/Discord
  // - Integrate with CRM
  // - etc.
  
  res.status(200).json({ success: true });
});

app.listen(3000, () => {
  console.log('Webhook receiver running on port 3000');
});
```

### 4. Test the Implementation

After deployment, test your contact form:

1. Fill out the contact form on your website
2. Check if the form shows "✅ Message sent!" 
3. Verify your webhook receiver gets the data
4. Check Supabase logs if there are issues: **Dashboard → Edge Functions → Logs**

## 🔒 Security Features Implemented

✅ **HMAC Signature Verification** - Prevents fake requests  
✅ **Input Sanitization** - Blocks injection attacks  
✅ **Environment Variables** - Secrets stored securely  
✅ **Email Validation** - Validates email format  
✅ **Length Limits** - Prevents buffer overflow  
✅ **CORS Headers** - Proper cross-origin handling  
✅ **Error Handling** - Graceful failure modes  
✅ **Request Logging** - Track webhook calls  

## 🚨 Important Security Notes

1. **Never expose your webhook secret** - Keep it in environment variables only
2. **Always verify signatures** - In your webhook receiver
3. **Use HTTPS** - For your webhook endpoint
4. **Rate limiting** - Consider adding rate limits to your webhook receiver
5. **Monitor logs** - Watch for suspicious activity

## 🔧 Troubleshooting

**Form shows error message:**
- Check Supabase function logs
- Verify environment variables are set
- Test webhook endpoint manually

**Webhook not receiving data:**
- Verify webhook URL is correct and accessible
- Check webhook signature verification
- Ensure your webhook returns 200 status

**Function deployment fails:**
- Check Supabase CLI is authenticated: `supabase auth login`
- Verify project is linked: `supabase link --project-ref your-project-ref`

Your contact form is now secure and ready to use! 🚀