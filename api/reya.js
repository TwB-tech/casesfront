import https from 'https';
import http from 'http';

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

    const { message = '', context = {} } = payload;
    console.log('📝 Message:', message?.substring(0, 100) || 'empty');

    // Get API keys from server-side environment
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const ZAI_API_KEY = process.env.ZAI_API_KEY;

    const hasGroq = !!GROQ_API_KEY && GROQ_API_KEY.length > 10;
    const hasZai = !!ZAI_API_KEY && ZAI_API_KEY.length > 10;

    console.log('🔑 API keys - GROQ:', hasGroq ? 'YES' : 'NO', '| ZAI:', hasZai ? 'YES' : 'NO');

    // Build comprehensive system prompt
    const systemPrompt = `You are Reya, an intelligent AI legal assistant for WakiliWorld - a comprehensive legal practice management platform.

Your personality:
- Friendly, warm, and professional
- Conversational and natural - engage like a real assistant
- Proactive in offering help
- Never robotic or repetitive
- Adapt your tone to the user's mood and question

Your core capabilities:
1. Case Management (create, track, organize legal matters)
2. Document Drafting (contracts, NDAs, agreements, letters, pleadings, memos)
3. Client Management (contacts, client details, communications)
4. Task Management (create, assign, track tasks and deadlines)
5. Billing & Invoicing (create invoices, track payments)
6. Calendar & Deadlines (track court dates, filing deadlines)
7. Team Collaboration (chat, team messaging)
8. Legal Research (general guidance on legal concepts)

Current user context:
- Active cases: ${context.cases_count || 0}
- Clients: ${context.clients_count || 0}
- Pending tasks: ${context.pending_tasks || 0}
- Upcoming deadlines: ${context.upcoming_deadlines || 0}
- User role: ${context.user_role || 'lawyer'}

Guidelines:
1. Be conversational - respond naturally to greetings and small talk
2. If user says "hi" or "hello", greet them warmly and briefly mention your capabilities
3. If user asks "how are you", respond briefly and ask how you can help them
4. Keep responses concise (2-3 sentences) unless detailed help needed
5. NEVER say "That's a great question" or "I understand..."
6. Get straight to the point while being warm
7. When user asks to navigate somewhere, include action buttons in this exact format: [ACTION:Button Label:action_name]
8. Available actions: cases, clients, tasks, documents, invoices, calendar, new-case, new-client, generate_contract
9. Example: [ACTION:View Cases:cases] [ACTION:Create New Case:new-case]
10. Include 1-3 action buttons per response when relevant
11. For greetings, include actions like: [ACTION:View Cases:cases] [ACTION:View Tasks:tasks]
12. For document requests, include: [ACTION:Generate Contract:generate_contract]
13. Keep under 150 words typically`;

    // Helper function to make API calls
    const callAI = async (url, apiKey, body) => {
      const payload = JSON.stringify(body);
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 30000,
      };

      const protocol = url.startsWith('https') ? https : http;
      return new Promise((resolve, reject) => {
        const req = protocol.request(url, options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            resolve({ status: res.statusCode, body: data });
          });
        });
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.write(payload);
        req.end();
      });
    };

    // Extract actions from response text
    const extractActions = (content) => {
      const actions = [];
      const regex = /\[ACTION:([^:]+):([^\]]+)\]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        actions.push({ label: match[1], action: match[2], icon: 'settings' });
      }
      return actions;
    };

    // Try GROQ first
    if (hasGroq) {
      try {
        console.log('🔄 Calling GROQ API...');
        const result = await callAI(
          'https://api.groq.com/openai/v1/chat/completions',
          GROQ_API_KEY,
          {
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            temperature: 0.8,
            max_tokens: 400,
          }
        );

        const { status, body } = result;
        console.log('📡 GROQ response status:', status);

        if (status === 200) {
          const parsed = JSON.parse(body);
          const aiContent = parsed.choices?.[0]?.message?.content;
          if (aiContent) {
            console.log('✅ GROQ success -', aiContent.length, 'chars');
            const actions = extractActions(aiContent);
            return res.status(200).json({
              success: true,
              provider: 'GROQ',
              content: aiContent,
              actions:
                actions.length > 0
                  ? actions
                  : [
                      { label: 'View Cases', action: 'cases', icon: 'file' },
                      { label: 'View Dashboard', action: 'home', icon: 'home' },
                    ],
              suggestions: [],
            });
          }
        }
        console.warn('⚠️ GROQ response issues:', body?.substring(0, 200));
      } catch (groqError) {
        console.error('❌ GROQ failed:', groqError.message);
      }
    }

    // Try ZAI as fallback
    if (hasZai) {
      try {
        console.log('🔄 Calling ZAI API...');
        const result = await callAI('https://api.zai.com/v1/chat/completions', ZAI_API_KEY, {
          model: 'zai-legal-v1',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.8,
          max_tokens: 400,
        });

        const { status, body } = result;
        console.log('📡 ZAI response status:', status);

        if (status === 200) {
          const parsed = JSON.parse(body);
          const aiContent = parsed.choices?.[0]?.message?.content;
          if (aiContent) {
            console.log('✅ ZAI success -', aiContent.length, 'chars');
            const actions = extractActions(aiContent);
            return res.status(200).json({
              success: true,
              provider: 'ZAI',
              content: aiContent,
              actions:
                actions.length > 0
                  ? actions
                  : [
                      { label: 'View Cases', action: 'cases', icon: 'file' },
                      { label: 'View Dashboard', action: 'home', icon: 'home' },
                    ],
              suggestions: [],
            });
          }
        }
        console.warn('⚠️ ZAI response issues:', body?.substring(0, 200));
      } catch (zaiError) {
        console.error('❌ ZAI failed:', zaiError.message);
      }
    }

    // Both AI providers failed or not available - use intelligent fallback
    console.log('📝 Using intelligent fallback response');

    const lowerMessage = message.toLowerCase();
    let fallbackContent = '';
    let fallbackActions = [];

    if (
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hey')
    ) {
      fallbackContent = `Hello! I'm Reya, your AI legal assistant. I can help you manage cases, draft documents, track deadlines, and handle client communications. What would you like to work on today?`;
      fallbackActions = [
        { label: 'View Cases', action: 'cases', icon: 'file' },
        { label: 'Check Tasks', action: 'tasks', icon: 'check' },
        { label: 'Send Email', action: 'mail', icon: 'mail' },
      ];
    } else if (lowerMessage.includes('how are you')) {
      fallbackContent = `I'm here and ready to help! As your AI legal assistant, I can streamline your practice management. How can I assist you today?`;
      fallbackActions = [
        { label: 'View Dashboard', action: 'home', icon: 'home' },
        { label: 'View Cases', action: 'cases', icon: 'file' },
      ];
    } else if (lowerMessage.includes('case')) {
      fallbackContent = `I can help you view and manage your legal cases. You have ${context.cases_count || 0} active cases. Would you like to see them?`;
      fallbackActions = [
        { label: 'View Cases', action: 'cases', icon: 'file' },
        { label: 'Create New Case', action: 'new-case', icon: 'plus' },
      ];
    } else if (lowerMessage.includes('document') || lowerMessage.includes('draft')) {
      fallbackContent = `I specialize in document drafting - contracts, NDAs, agreements, and more. I can generate legal documents tailored to your needs.`;
      fallbackActions = [
        { label: 'Generate Contract', action: 'generate_contract', icon: 'file' },
        { label: 'View Documents', action: 'documents', icon: 'file' },
      ];
    } else if (lowerMessage.includes('task') || lowerMessage.includes('deadline')) {
      fallbackContent = `You have ${context.pending_tasks || 0} pending tasks and ${context.upcoming_deadlines || 0} upcoming deadlines. Let me help you stay on track.`;
      fallbackActions = [
        { label: 'View Tasks', action: 'tasks', icon: 'check' },
        { label: 'View Calendar', action: 'calendar', icon: 'calendar' },
      ];
    } else if (lowerMessage.includes('client')) {
      fallbackContent = `You manage ${context.clients_count || 0} clients. I can help you add new clients, update records, or find specific client information.`;
      fallbackActions = [
        { label: 'View Clients', action: 'clients', icon: 'users' },
        { label: 'Add New Client', action: 'new-client', icon: 'user-plus' },
      ];
    } else {
      fallbackContent = `I'm here to help with your legal practice. I can assist with cases, documents, tasks, clients, and more. What would you like to do?`;
      fallbackActions = [
        { label: 'View Cases', action: 'cases', icon: 'file' },
        { label: 'View Tasks', action: 'tasks', icon: 'check' },
        { label: 'View Clients', action: 'clients', icon: 'users' },
      ];
    }

    return res.status(200).json({
      success: true,
      provider: 'fallback',
      content: fallbackContent,
      actions: fallbackActions,
      suggestions: [],
    });
  } catch (error) {
    console.error('🚨 Global Reya API error:', error);
    return res.status(500).json({
      error: 'Server error',
      content: 'I encountered a technical issue. Please refresh and try again.',
      actions: [],
      suggestions: [],
    });
  }
}
