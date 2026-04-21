const https = require('https');

module.exports = async function handler(req, res) {
  console.log('🤖 Reya API called -', new Date().toISOString());

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    // Parse request
    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch (e) {
      console.log('⚠️ Parse error:', e.message);
    }

    const { message = 'Hello', context = {} } = body;
    console.log('📝 Message:', message.substring(0, 80));

    // Check GROQ key
    const GROQ_KEY = process.env.GROQ_API_KEY;
    const hasGroq = !!GROQ_KEY && GROQ_KEY.length >= 10;

    console.log('🔑 GROQ key:', hasGroq ? '✅' : '❌', '| Length:', GROQ_KEY?.length || 0);

    if (!hasGroq) {
      return res.status(503).json({
        error: 'AI not configured',
        content: 'Set GROQ_API_KEY in Vercel environment variables.',
        actions: [],
        suggestions: [],
      });
    }

    // Call GROQ
    console.log('🔄 Calling GROQ (llama3-8b-8192)...');

    const payload = JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are Reya, an intelligent AI legal assistant for WakiliWorld.
Be conversational and helpful. Keep responses brief (2-3 sentences).
User context: ${context.cases_count || 0} cases, ${context.clients_count || 0} clients, ${context.pending_tasks || 0} pending tasks.`,
        },
        { role: 'user', content: message },
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 15000,
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(
        'https://api.groq.com/openai/v1/chat/completions',
        options,
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }
      );
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Timeout')));
      req.write(payload);
      req.end();
    });

    console.log('📡 GROQ status:', result.status);

    if (result.status !== 200) {
      console.log('❌ GROQ error:', result.body.substring(0, 200));
      throw new Error(`GROQ ${result.status}`);
    }

    const parsed = JSON.parse(result.body);
    const aiContent = parsed.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.log('❌ No content in response:', JSON.stringify(parsed).substring(0, 200));
      throw new Error('Invalid GROQ response');
    }

    console.log('✅ GROQ success -', aiContent.length, 'chars');

    return res.status(200).json({
      success: true,
      provider: 'GROQ',
      content: aiContent,
      actions: [],
      suggestions: [],
    });
  } catch (error) {
    console.error('🚨 API Error:', error.message);
    return res.status(500).json({
      error: error.message,
      content: "I'm having trouble connecting to my AI brain. Please try again.",
      actions: [],
      suggestions: [],
    });
  }
};
