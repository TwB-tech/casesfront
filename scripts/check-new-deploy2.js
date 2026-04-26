import https from 'https';

const options = {
  hostname: 'casesfront-2n5rvssxc-twb-techs-projects.vercel.app',
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
};

https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Length:', html.length);
    if (html.includes('root') || html.includes('Root')) {
      console.log('✅ Contains root element');
    }
    const match = html.match(/assets\/index-([a-zA-Z0-9-]+)\.js/);
    if (match) {
      console.log('Bundle:', match[0]);
    } else {
      console.log('No bundle found');
    }
  });
}).on('error', e => console.error(e.message));
