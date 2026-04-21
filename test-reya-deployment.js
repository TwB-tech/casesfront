// Test the Reya API deployment
async function testReyaAPI() {
  const testMessage = 'Hello Reya, can you help me with case management?';

  try {
    console.log('🧪 Testing Reya API...');

    const response = await fetch('/api/reya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: testMessage,
        context: {
          cases_count: 5,
          clients_count: 10,
          pending_tasks: 3,
          user_role: 'lawyer',
        },
      }),
    });

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Success!');
    console.log('Provider:', data.provider);
    console.log('Content:', data.content?.substring(0, 100) + '...');
    console.log('Actions:', data.actions?.length || 0);
    console.log('Suggestions:', data.suggestions?.length || 0);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run in browser console
if (typeof window !== 'undefined') {
  window.testReyaAPI = testReyaAPI;
  console.log('💡 Run testReyaAPI() to test Reya API');
}
