import https from 'https';

const data = JSON.stringify({
  email: 'test-123@example.com',
  password: 'TestPass123!',
  username: 'TestUser'
});

const options = {
  hostname: 'www.kwakorti.live',
  port: 443,
  path: '/api/appwrite-proxy/account',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      console.log(JSON.parse(d));
    } catch {
      console.log(d);
    }
  });
});

req.on('error', e => console.error(e.message));
req.write(data);
req.end();
