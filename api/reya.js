export default async function handler(req, res) {
  console.log('🚀 REYA API START - Method:', req.method, 'Time:', new Date().toISOString());

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body
    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch (e) {
      console.log('⚠️ Body parse error:', e.message);
    }

    const { message = 'Hello', context = {} } = body;
    console.log('📝 Message:', message.substring(0, 80));
    console.log('📊 Context:', JSON.stringify(context));

    // Check GROQ API key
    const GROQ_KEY = process.env.GROQ_API_KEY;
    const hasGroq = !!GROQ_KEY && GROQ_KEY.length >= 10;

    console.log('🔑 GROQ key - exists:', !!GROQ_KEY, 'length:', GROQ_KEY?.length || 0);
    if (GROQ_KEY) {
      console.log('🔑 GROQ key preview:', GROQ_KEY.substring(0, 8) + '...');
    }

    if (!hasGroq) {
      console.log('❌ GROQ API key not configured or too short');
      return res.status(503).json({
        error: 'AI not configured',
        content:
          "Reya's AI brain is not configured. Set GROQ_API_KEY in Vercel environment variables.",
        actions: [],
        suggestions: [],
      });
    }

    // Call GROQ API
    console.log('🔄 Calling GROQ API (llama3-8b-8192)...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
        max_tokens: 300,
      }),
    });

    console.log('📡 GROQ response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ GROQ error:', errorText.substring(0, 300));
      throw new Error(`GROQ API error ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.log('❌ Unexpected GROQ response structure:', JSON.stringify(data).substring(0, 200));
      throw new Error('Invalid response format from GROQ');
    }

    console.log('✅ GROQ success - received', aiContent.length, 'characters');
    console.log('📤 AI says:', aiContent.substring(0, 150));

    return res.status(200).json({
      success: true,
      provider: 'GROQ',
      content: aiContent,
      actions: [],
      suggestions: [],
    });
  } catch (error) {
    console.error('🚨 API ERROR:', error.message);
    console.error('🚨 Stack trace:', error.stack);

    return res.status(500).json({
      error: error.message,
      content: `I'm having trouble connecting to my AI brain right now: ${error.message}. Please try again in a moment.`,
      actions: [],
      suggestions: [],
    });
  }
}
