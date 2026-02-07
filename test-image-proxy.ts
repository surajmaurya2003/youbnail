// Test script for image-proxy function
// Run with: deno run --allow-net test-image-proxy.ts

const SUPABASE_URL = 'https://ohbrdgolasejewtcbojt.supabase.co';
const SUPABASE_ANON_KEY = 'your_anon_key_here'; // Replace with actual key

async function testImageProxy() {
  const testUrl = 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';
  
  console.log('Testing image-proxy function...');
  console.log('Test URL:', testUrl);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/image-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ imageUrl: testUrl })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Base64 length:', data.base64?.length || 0);
      console.log('Data URL prefix:', data.base64?.substring(0, 50) + '...');
    } else {
      const error = await response.text();
      console.error('Error response:', error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Only run if this is the main module
if (import.meta.main) {
  testImageProxy();
}