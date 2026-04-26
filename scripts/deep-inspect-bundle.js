import https from 'https';

const bundleUrl = 'https://www.kwakorti.live/assets/index-thsjYhL0.js';

https.get(bundleUrl, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
  let content = '';
  res.on('data', c => content += c);
  res.on('end', () => {
    // Find all occurrences of 'endpoint'
    const indices = [];
    let idx = content.indexOf('endpoint');
    while (idx !== -1) {
      indices.push(idx);
      idx = content.indexOf('endpoint', idx + 1);
    }
    console.log(`Found 'endpoint' at ${indices.length} positions`);
    
    // Show context around each
    for (let i = 0; i < Math.min(indices.length, 5); i++) {
      const pos = indices[i];
      const snippet = content.substring(pos, pos + 200);
      console.log(`\n[${i}] @ ${pos}: ${snippet.replace(/\n/g, ' ')}`);
    }
    
    // Search for window.location specifically
    const winIdx = content.indexOf('window.location');
    if (winIdx !== -1) {
      console.log(`\n✅ window.location found at ${winIdx}:`);
      console.log(content.substring(winIdx, winIdx + 100));
    } else {
      console.log('\n❌ window.location NOT found in bundle');
    }
  });
}).on('error', e => console.error(e.message));
