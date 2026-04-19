const https = require('https');
const http = require('http');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context, action, quick } = req.body;

  // Get API keys from server-side environment (not exposed to client)
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const ZAI_API_KEY = process.env.ZAI_API_KEY;

  // Determine provider: ZAI preferred for legal
  const useZai = ZAI_API_KEY && ZAI_API_KEY.length > 0;
  const useGroq = GROQ_API_KEY && GROQ_API_KEY.length > 0;

  // Build system prompt
  const systemPrompt = `You are Reya, an intelligent AI legal assistant for WakiliWorld.

Your personality:
- Friendly, warm, and professional
- Concise but thorough
- Proactive in offering help
- Never robotic or repetitive

Your capabilities:
- Case management (create, track, organize)
- Document drafting (contracts, letters, pleadings)
- Deadline tracking and reminders
- Client management
- Billing and invoicing
- Task management
- Calendar scheduling
- Legal research assistance

Current user context:
- Active cases: ${context.cases_count || 0}
- Clients: ${context.clients_count || 0}
- Pending tasks: ${context.pending_tasks || 0}
- Upcoming deadlines (7 days): ${context.upcoming_deadlines || 0}
- User role: ${context.user_role || 'lawyer'}

Guidelines:
1. Keep responses conversational and natural - like a helpful colleague
2. Avoid filler phrases like "That's a great question" or "I understand..."
3. Get straight to the point while being warm
4. If you don't know something, say so honestly
5. Offer specific, actionable next steps
6. Keep responses under 200 words unless detailed explanation needed`;

  const userMessage = quick ? `Quick action: ${action || message}` : message;

  try {
    let responseContent;
    let providerUsed;

    // Try ZAI first (legal specialized)
    if (useZai) {
      try {
        const zaiResult = await callExternalAPI(
          'https://api.zai.com/v1/chat/completions',
          ZAI_API_KEY,
          {
            model: 'zai-legal-v1',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }
        );
        responseContent = zaiResult.content;
        providerUsed = 'ZAI';
      } catch (zaiError) {
        console.warn('ZAI failed, trying GROQ:', zaiError.message);
        if (!useGroq) throw zaiError;
      }
    }

    // Fallback to GROQ
    if (!responseContent && useGroq) {
      const groqResult = await callExternalAPI(
        'https://api.groq.com/openai/v1/chat/completions',
        GROQ_API_KEY,
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }
      );
      responseContent = groqResult.content;
      providerUsed = 'GROQ';
    }

    // If both failed, use fallback
    if (!responseContent) {
      return res.status(503).json({
        error: 'AI services unavailable',
        fallback: true,
        content: getFallbackResponse(message, context),
        actions: [],
        suggestions: getSuggestions(message),
      });
    }

    // Extract actions and suggestions
    const actions = extractActions(responseContent);
    const suggestions = extractSuggestions(responseContent);

    return res.status(200).json({
      success: true,
      provider: providerUsed,
      content: responseContent,
      actions,
      suggestions,
    });
  } catch (error) {
    console.error('Reya AI error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      content:
        "I'm having trouble connecting to my AI brain right now. But I can still help! Try asking about your cases, documents, or deadlines.",
      actions: [],
      suggestions: [{ label: 'Show my cases', action: 'cases' }],
    });
  }
};

// Generic external API caller with retry
async function callExternalAPI(url, apiKey, body, retries = 2) {
  const payload = JSON.stringify(body);
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const protocol = url.startsWith('https') ? https : http;
      const result = await new Promise((resolve, reject) => {
        const req = protocol.request(url, options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            resolve({ status: res.statusCode, body: data });
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      const { status, body } = result;
      const parsed = JSON.parse(body);

      if (![200, 201].includes(status)) {
        throw new Error(`API returned ${status}: ${JSON.stringify(parsed)}`);
      }

      const content = parsed.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid response format from AI provider');
      }

      return { content };
    } catch (err) {
      if (attempt === retries) throw err;
      // Exponential backoff
      await new Promise((res) => setTimeout(res, 500 * Math.pow(2, attempt)));
    }
  }
}

// Simple extraction: [ACTION:label:action]
function extractActions(content) {
  const actions = [];
  const regex = /\[ACTION:([^:]+):([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    actions.push({ label: match[1], action: match[2], icon: 'settings' });
  }
  return actions;
}

// [SUG:label:action]
function extractSuggestions(content) {
  const suggestions = [];
  const regex = /\[SUG:([^:]+):([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    suggestions.push({ label: match[1], action: match[2] });
  }
  return suggestions;
}

function getFallbackResponse(message, context) {
  const lower = message.toLowerCase();
  if (lower.includes('case') || lower.includes('show')) {
    return 'I can help you view and manage your cases. Navigate to the Cases section from the sidebar to see all your active matters, deadlines, and status updates.';
  }
  if (lower.includes('client') || lower.includes('customer')) {
    return 'Your client management dashboard shows all contacts. You can filter by status, view case history, and add new clients from there.';
  }
  if (lower.includes('deadline') || lower.includes('due')) {
    return "Upcoming deadlines are highlighted in the Calendar and Tasks sections. I'll send you reminders before important dates.";
  }
  if (lower.includes('document') || lower.includes('file')) {
    return 'All your documents are stored securely in the Documents section. Use tags and folders to organize them by case or matter.';
  }
  return "I'm here to help with your legal practice. You can ask about cases, clients, deadlines, documents, billing, or tasks. What would you like to do?";
}

function getSuggestions(message) {
  const lower = message.toLowerCase();
  if (lower.includes('case')) return [{ label: 'Show my cases', action: 'cases' }];
  if (lower.includes('client')) return [{ label: 'View clients', action: 'clients' }];
  return [
    { label: 'Show my cases', action: 'cases' },
    { label: 'View deadlines', action: 'deadlines' },
    { label: 'Create new case', action: 'new-case' },
  ];
}
