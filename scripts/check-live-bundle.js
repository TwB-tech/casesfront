import https from 'https';

https.get('https://www.kwakorti.live', (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const match = html.match(/assets\/index-([a-zA-Z0-9-]+)\.js/);
    if (match) {
      console.log('Live bundle:', match[0]);
      console.log('Hash:', match[1]);
    } else {
      console.log('No bundle found in live HTML');
      console.log('HTML snippet:', html.substring(0, 500));
    }
  });
}).on('error', e => console.error(e));
