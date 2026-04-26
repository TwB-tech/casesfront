import https from 'https';

const url = 'https://casesfront-2n5rvssxc-twb-techs-projects.vercel.app/api/appwrite-proxy';
https.get(url, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Response:', d);
  });
}).on('error', e => console.error('Error:', e.message));
