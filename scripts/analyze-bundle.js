import https from 'https';

// Check the deployed bundle for our endpoint logic
https.get('https://www.kwakorti.live/assets/index-thsjYhL0.js', (res) => {
  let content = '';
  res.on('data', c => content += c);
  res.on('end', () => {
    // Search for the production proxy logic
    const patterns = [
      'window.location.origin',
      'api/appwrite-proxy',
      'isProduction',
      'APPWRITE_ENDPOINT'
    ];
    
    console.log('Bundle analysis:');
    for (const pattern of patterns) {
      const found = content.includes(pattern);
      console.log(`${found ? '✅' : '❌'} ${pattern}`);
    }
    
    // Check for the specific line that was broken before
    const brokenPattern = "endpoint = '/api/appwrite-proxy'";
    const hasBroken = content.includes(brokenPattern);
    console.log(`${hasBroken ? '❌ STILL BROKEN' : '✅ Fixed'} ${brokenPattern}`);
    
    // Check for the fixed pattern
    const fixedPattern = 'window.location.origin';
    console.log(`${content.includes(fixedPattern) ? '✅' : '❌'} Fixed pattern present: window.location.origin`);
  });
}).on('error', e => console.error(e.message));
