// Test script to check subscription in DodoPayments
// Usage: node test_dodo_subscription.js <subscription_id>

const subscriptionId = process.argv[2] || 'sub_0NXh4JIq74RNM5HovTF8s';
const apiKey = process.env.DODO_API_KEY;
const mode = 'test'; // or 'live'

if (!apiKey) {
  console.error('❌ DODO_API_KEY environment variable not set');
  console.log('\nSet it with:');
  console.log('export DODO_API_KEY="your_api_key_here"');
  process.exit(1);
}

const baseUrl = mode === 'test' 
  ? 'https://test.dodopayments.com' 
  : 'https://api.dodopayments.com';

console.log('🔍 Testing DodoPayments API...');
console.log('Mode:', mode);
console.log('Subscription ID:', subscriptionId);
console.log('Base URL:', baseUrl);
console.log('API Key length:', apiKey.length);
console.log('\n' + '='.repeat(60) + '\n');

// Test 1: Get subscription details
async function getSubscription() {
  const url = `${baseUrl}/v1/subscriptions/${subscriptionId}`;
  console.log('📡 GET', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Subscription found!');
      console.log(JSON.stringify(data, null, 2));
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Subscription NOT found');
      console.log('Response:', errorText);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test 2: List all subscriptions
async function listSubscriptions() {
  const url = `${baseUrl}/v1/subscriptions?limit=10`;
  console.log('\n' + '='.repeat(60));
  console.log('📡 GET', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Subscriptions list:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        console.log('\n📋 Summary:');
        data.data.forEach(sub => {
          console.log(`  - ${sub.subscription_id}: ${sub.status} (${sub.product_id})`);
        });
      } else {
        console.log('\n⚠️ No subscriptions found in DodoPayments');
      }
      
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to list subscriptions');
      console.log('Response:', errorText);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test 3: Try to cancel the subscription
async function cancelSubscription() {
  const url = `${baseUrl}/v1/subscriptions/${subscriptionId}/cancel`;
  console.log('\n' + '='.repeat(60));
  console.log('📡 POST', url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Subscription cancelled!');
      console.log(JSON.stringify(data, null, 2));
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to cancel');
      console.log('Response:', errorText);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Run all tests
(async () => {
  console.log('Test 1: Get specific subscription\n');
  const subscription = await getSubscription();
  
  console.log('\n\nTest 2: List all subscriptions\n');
  await listSubscriptions();
  
  if (subscription) {
    console.log('\n\nTest 3: Cancel subscription\n');
    await cancelSubscription();
  } else {
    console.log('\n\n⚠️ Skipping cancel test - subscription not found');
    console.log('\n💡 This means:');
    console.log('  1. Subscription was never created in DodoPayments');
    console.log('  2. Checkout completed but subscription creation failed');
    console.log('  3. Check create-checkout function logs for errors');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests complete!');
})();
