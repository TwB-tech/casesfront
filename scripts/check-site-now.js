import https from 'https';

https.get('https://www.kwakorti.live', { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Content-Type:', res.headers['content-type']);
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('HTML length:', html.length);
    const match = html.match(/assets\/index-([a-zA-Z0-9-]+)\.js/);
    if (match) {
      console.log('Bundle:', match[0]);
      console.log('Hash:', match[1]);
    }
    if (html.includes('Appwrite connection verified')) {
      console.log('✅ Appwrite ping message present in HTML');
    } else {
      console.log('⚠️ Appwrite ping message not in HTML (maybe in JS)');
    }
  });
}).on('error', e => console.error('Error:', e.message));
