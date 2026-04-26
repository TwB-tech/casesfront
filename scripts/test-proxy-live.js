import https from 'https';

https.get('https://www.kwakorti.live/api/appwrite-proxy', (res) => {
  console.log(`Status: ${res.statusCode}`);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Response:', d));
}).on('error', e => console.error('Error:', e.message));
