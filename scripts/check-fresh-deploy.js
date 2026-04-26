import https from 'https';

// Bypass cache by adding random query
const url = 'https://casesfront-2n5rvssxc-twb-techs-projects.vercel.app?nocache=' + Date.now();

https.get(url, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const match = html.match(/assets\/index-([a-zA-Z0-9-]+)\.js/);
    if (match) {
      console.log('New deployment bundle:', match[0]);
      console.log('Hash:', match[1]);
    } else {
      console.log('No bundle found');
    }
    // Check content
    if (html.includes('Appwrite connection verified')) {
      console.log('✅ Contains Appwrite ping');
    }
  });
}).on('error', e => console.error(e.message));
