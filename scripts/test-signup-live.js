import https from 'https';

const payload = JSON.stringify({
  email: 'test-'+Date.now()+'@example.com',
  password: 'TestPass123!',
  username: 'TestUser'+Date.now()
});

const options = {
  hostname: 'www.kwakorti.live',
  port: 443,
  path: '/api/appwrite-proxy/account',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(payload);
req.end();
