import https from 'https';

// Check the new deployment directly
https.get('https://casesfront-2n5rvssxc-twb-techs-projects.vercel.app', (res) => {
  console.log(`Status: ${res.statusCode}`);
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const match = html.match(/assets\/index-([a-zA-Z0-9-]+)\.js/);
    console.log('New deployment bundle:', match ? match[0] : 'not found');
    console.log('HTML length:', html.length);
  });
}).on('error', e => console.error(e.message));
