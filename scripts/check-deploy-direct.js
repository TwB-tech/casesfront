import https from 'https';

https.get('https://casesfront-2n5rvssxc-twb-techs-projects.vercel.app', (res) => {
  console.log(`Status: ${res.statusCode}`);
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Length:', html.length);
    const match = html.match(/assets\/index-([a-zA-Z0-9-]+)\.js/);
    if (match) {
      console.log('Bundle:', match[0]);
    } else {
      console.log('HTML preview:', html.substring(0, 300));
    }
  });
}).on('error', e => console.error('Error:', e.message));
