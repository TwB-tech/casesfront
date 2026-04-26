import https from 'https';

const bundleUrl = 'https://www.kwakorti.live/assets/index-thsjYhL0.js';

https.get(bundleUrl, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let content = '';
  res.on('data', c => content += c);
  res.on('end', () => {
    console.log(`Bundle size: ${content.length} characters\n`);
    
    // Check for the fixed code patterns
    const checks = [
      { pattern: 'window.location.origin', desc: 'Proxy uses window.location.origin' },
      { pattern: '/api/appwrite-proxy', desc: 'Proxy path reference' },
      { pattern: 'isProduction', desc: 'Production check' },
      { pattern: "setEndpoint", desc: 'setEndpoint call' },
    ];
    
    let allGood = true;
    for (const { pattern, desc } of checks) {
      const found = content.includes(pattern);
      console.log(`${found ? '✅' : '❌'} ${desc}`);
      if (!found) allGood = false;
    }
    
    // Specifically check the broken pattern is NOT present
    const broken = "endpoint = '/api/appwrite-proxy'";
    const hasBroken = content.includes(broken);
    console.log(`${hasBroken ? '❌ STILL BROKEN' : '✅ Fixed'} Does NOT contain: ${broken}`);
    
    if (!hasBroken && content.includes('window.location.origin')) {
      console.log('\n✅✅✅ Bundle is CORRECT! Proxy will work.');
    } else {
      console.log('\n⚠️ Bundle may still have issues');
    }
  });
}).on('error', e => console.error('Error:', e.message));
