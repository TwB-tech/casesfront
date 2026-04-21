export default async function handler(req, res) {
  try {
    console.log('🤖 Reya API called at', new Date().toISOString());

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse body
    let payload = {};
    try {
      if (req.body) {
        payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      }
    } catch (parseError) {
      console.log('⚠️ Body parse error:', parseError.message);
    }

    const { message = 'Hello' } = payload;
    console.log('📝 Message:', message.substring(0, 50));

    // Check API keys
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const hasGroq = !!GROQ_API_KEY && GROQ_API_KEY.length > 10;
    console.log('🔑 GROQ key available:', hasGroq);

    // For now, return a simple working response to test the API
    return res.status(200).json({
      success: true,
      provider: hasGroq ? 'GROQ' : 'fallback',
      content: `Hello! I'm Reya. You said: "${message}". I can help you with legal cases, documents, and client management.`,
      actions: [
        { label: 'View Cases', action: 'cases', icon: 'file' },
        { label: 'View Clients', action: 'clients', icon: 'users' },
      ],
      suggestions: [{ label: 'Create new case', action: 'new-case' }],
    });
  } catch (error) {
    console.error('🚨 API Error:', error);
    return res.status(500).json({
      error: 'Server error',
      content: 'Something went wrong. Please try again.',
      actions: [],
      suggestions: [],
    });
  }
}
