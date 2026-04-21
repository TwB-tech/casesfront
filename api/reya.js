import https from 'https';
import http from 'http';

export default async function handler(req, res) {
  console.log('🤖 Reya API called with method:', req.method);

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
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body - handle string or object from Vercel
  let payload;
  try {
    if (req.body) {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else {
      payload = {};
    }
  } catch (e) {
    payload = {};
  }

  const { message, context, action, quick } = payload;

  // Get API keys from server-side environment (not exposed to client)
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const ZAI_API_KEY = process.env.ZAI_API_KEY;

  // Debug log for troubleshooting (remove in production)
  console.log('🔑 GROQ_API_KEY present:', !!GROQ_API_KEY, GROQ_API_KEY ? `${GROQ_API_KEY.slice(0, 5)}...` : 'null');
  console.log('🔑 ZAI_API_KEY present:', !!ZAI_API_KEY, ZAI_API_KEY ? `${ZAI_API_KEY.slice(0, 5)}...` : 'null');

  // Determine provider: GROQ primary, ZAI secondary (if available)
  const useZai = false; // Temporarily disable ZAI until confirmed working
  const useGroq = GROQ_API_KEY && GROQ_API_KEY.length > 5;

  console.log('🎯 AI Providers available - ZAI:', useZai, 'GROQ:', useGroq);

  // If no providers available, return fallback immediately
  if (!useGroq && !useZai) {
    console.log('❌ No AI providers available, returning fallback');
    return res.status(503).json({
      error: 'AI services unavailable',
      fallback: true,
      content: "I'm having trouble connecting to my AI brain right now. But I can still help! Try asking about your cases, documents, or deadlines.",
      actions: [],
      suggestions: [{ label: 'Show my cases', action: 'cases' }],
    });
  }

  // Build system prompt - comprehensive legal assistant
  const systemPrompt = `You are Reya, an intelligent AI legal assistant for WakiliWorld - a comprehensive legal practice management platform.

Your personality:
- Friendly, warm, and professional
- Concise but thorough
- Proactive in offering help
- Never robotic or repetitive
- Always provide accurate, current information

Your core capabilities:
1. Case Management (create, track, organize legal matters)
2. Document Drafting (contracts, NDAs, agreements, letters, pleadings, memos)
3. Client Management (contacts, client details, communications)
4. Task Management (create, assign, track tasks and deadlines)
5. Billing & Invoicing (create invoices, track payments)
6. Calendar & Deadlines (track court dates, filing deadlines)
7. Team Collaboration (chat, team messaging)
8. Legal Research (general guidance on legal concepts)

The WakiliWorld platform modules:
- /home - Dashboard overview
- /case-list - All legal cases/matters
- /case-form - Create new case
- /clients - Client management
- /documents - Document storage and generation
- /tasks/ - Task management
- /invoices - Billing and invoicing
- /calendar-tasks - Calendar and deadlines
- /chats - Team chat
- /chat/reya - Direct AI chat with Reya
- /profile - User profile settings

Current user context:
- Active cases: ${context.cases_count || 0}
- Clients: ${context.clients_count || 0}
- Pending tasks: ${context.pending_tasks || 0}
- Upcoming deadlines: ${context.upcoming_deadlines || 0}
- User role: ${context.user_role || 'lawyer'}

Guidelines:
1. Keep responses conversational and natural
2. AVOID filler phrases like "That's a great question" or "I understand..."
3. Get straight to the point while being warm
4. If asked about things outside your knowledge, say so honestly
5. Offer specific, actionable next steps
6. When user greets you, provide a brief introduction and offer help with key features
7. When user asks to navigate somewhere, use action buttons instead of mentioning paths
8. When user asks to create/generate documents, offer to generate them directly
9. Keep responses under 200 words unless detailed explanation needed
10. For greetings, offer 2-3 key actions they might want to take

Action Buttons Format:
- Include clickable action buttons using this exact format: [ACTION:Button Label:action_name]
- Map to these available actions: cases, clients, tasks, documents, invoices, calendar, new-case, new-client, generate_contract
- Examples: [ACTION:View Cases:cases] [ACTION:Add New Case:new-case] [ACTION:Generate Contract:generate_contract]
- Use appropriate icons: file, plus, calendar, users, settings, etc.
- Only include 1-3 most relevant actions per response

Quick Suggestions Format:
- Include quick suggestion buttons using: [SUG:Suggestion Label:action]
- Examples: [SUG:Create Case:new-case] [SUG:View Tasks:tasks] [SUG:Generate NDA:generate_contract]`;

  const userMessage = quick ? `Quick action: ${action || message}` : message;

  try {
    let responseContent;
    let providerUsed;

    // Try ZAI first (legal specialized)
    if (useZai) {
      try {
        console.log('🔄 Calling ZAI API...');
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
        console.log('✅ ZAI API call successful');
      } catch (zaiError) {
        console.warn('❌ ZAI API failed:', zaiError.message);
        console.warn('🔄 Falling back to GROQ...');
        if (!useGroq) throw zaiError;
      }
    }

    // Fallback to GROQ
    if (!responseContent && useGroq) {
      console.log('🔄 Calling GROQ API...');
      const groqResult = await callExternalAPI(
        'https://api.groq.com/openai/v1/chat/completions',
        GROQ_API_KEY,
        {
          model: 'llama3-8b-8192', // Updated to correct model name
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
      console.log('✅ GROQ API call successful');
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

    // Add fallback actions if none were extracted
    const fallbackActions = [];
    if (actions.length === 0) {
      const lowerMessage = userMessage.toLowerCase();

      // Context-aware fallback actions
      if (lowerMessage.includes('case') || lowerMessage.includes('matter') || lowerMessage.includes('file')) {
        fallbackActions.push({ label: 'View Cases', action: 'cases', icon: 'file' });
        fallbackActions.push({ label: 'Create Case', action: 'new-case', icon: 'plus' });
      } else if (lowerMessage.includes('client') || lowerMessage.includes('customer')) {
        fallbackActions.push({ label: 'View Clients', action: 'clients', icon: 'users' });
        fallbackActions.push({ label: 'Add Client', action: 'new-client', icon: 'user' });
      } else if (lowerMessage.includes('document') || lowerMessage.includes('contract') || lowerMessage.includes('draft')) {
        fallbackActions.push({ label: 'View Documents', action: 'documents', icon: 'file' });
        fallbackActions.push({ label: 'Generate Document', action: 'generate_contract', icon: 'plus' });
      } else if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('deadline')) {
        fallbackActions.push({ label: 'View Tasks', action: 'tasks', icon: 'check' });
        fallbackActions.push({ label: 'Calendar', action: 'calendar', icon: 'calendar' });
      } else if (lowerMessage.includes('invoice') || lowerMessage.includes('billing') || lowerMessage.includes('payment')) {
        fallbackActions.push({ label: 'View Invoices', action: 'invoices', icon: 'dollar' });
      } else if (lowerMessage.includes('chat') || lowerMessage.includes('message') || lowerMessage.includes('team')) {
        fallbackActions.push({ label: 'Team Chat', action: 'chats', icon: 'users' });
      } else {
        // General fallback actions
        fallbackActions.push({ label: 'View Cases', action: 'cases', icon: 'file' });
        fallbackActions.push({ label: 'View Clients', action: 'clients', icon: 'users' });
        fallbackActions.push({ label: 'View Tasks', action: 'tasks', icon: 'check' });
      }
    }
    }

    return res.status(200).json({
      success: true,
      provider: providerUsed,
      content: responseContent,
      actions: actions.length > 0 ? actions : fallbackActions,
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
}

// Generic external API caller with retry
async function callExternalAPI(url, apiKey, body, retries = 2) {
  const payload = JSON.stringify(body);
  console.log(`📤 Sending request to ${url} with model: ${body.model}`);

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
    timeout: 30000, // 30 second timeout
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
      console.log(`📡 API Response Status: ${status}`);

      if (![200, 201].includes(status)) {
        console.error(`❌ API Error Response:`, body);
        throw new Error(`API returned ${status}: ${body}`);
      }

      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch (parseError) {
        console.error(`❌ JSON Parse Error:`, parseError.message, `Body:`, body);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      const content = parsed.choices?.[0]?.message?.content;
      if (!content) {
        console.error(`❌ Invalid response format:`, JSON.stringify(parsed, null, 2));
        throw new Error('Invalid response format from AI provider - no content found');
      }

      console.log(`✅ AI Response received (${content.length} chars)`);
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
