// Test script to check Reya API functionality
import https from 'https';

// Test the Reya API endpoint
async function testReyaAPI() {
  console.log('🧠 Testing Reya AI API...\n');

  // Test payload
  const testPayload = {
    message: 'Hello Reya, can you help me with case management?',
    context: {
      cases_count: 5,
      clients_count: 10,
      pending_tasks: 3,
      upcoming_deadlines: 2,
      user_role: 'lawyer',
    },
    quick: false,
  };

  const payload = JSON.stringify(testPayload);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/reya',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📡 API Response Status:', res.statusCode);
          console.log('📡 Response:', JSON.stringify(response, null, 2));
          resolve(response);
        } catch (e) {
          console.log('📡 Raw Response:', data);
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

// Check environment variables
function checkEnvVars() {
  console.log('🔍 Checking Environment Variables...\n');

  const envVars = ['GROQ_API_KEY', 'ZAI_API_KEY', 'DATABASE_MODE', 'SUPABASE_URL'];

  envVars.forEach((varName) => {
    const value = process.env[varName];
    const present = !!value;
    const length = value ? value.length : 0;
    console.log(`${varName}: ${present ? '✅ Present' : '❌ Missing'} (${length} chars)`);
  });

  console.log('');
}

// Main test
async function main() {
  try {
    checkEnvVars();
    await testReyaAPI();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();
