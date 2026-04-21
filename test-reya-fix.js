// Test the Reya API fix
const testReyaAPI = async () => {
  try {
    console.log('🧪 Testing Reya API...');

    const response = await fetch('/api/reya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello Reya' }),
    });

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Success:', data);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Add to window for manual testing
if (typeof window !== 'undefined') {
  window.testReyaAPI = testReyaAPI;
}
