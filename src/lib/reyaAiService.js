/**
 * Reya AI Service - Integrates with Groq Cloud and Zai Legal LLM
 * Provides intelligent, contextual responses for legal practice management
 */

import { USE_SUPABASE } from '../config';

// Supported AI providers
const PROVIDERS = {
  GROQ: 'groq',
  ZAI: 'zai',
  FALLBACK: 'fallback',
};

// Get API keys from environment
const GROQ_API_KEY = import.meta.env.GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY;
const ZAI_API_KEY = import.meta.env.ZAI_API_KEY || import.meta.env.VITE_ZAI_API_KEY;

// Determine active provider (ZAI has priority for legal expertise)
const ACTIVE_PROVIDER = ZAI_API_KEY
  ? PROVIDERS.ZAI
  : GROQ_API_KEY
    ? PROVIDERS.GROQ
    : PROVIDERS.FALLBACK;

/**
 * Main query function - sends user message to AI with context
 */
export async function queryReaya(message, context = {}) {
  const {
    cases_count,
    clients_count,
    invoices_count,
    pending_tasks,
    upcoming_deadlines,
    user_role,
  } = context;

  // Build system prompt with legal practice context
  const systemPrompt = `You are Reya, an intelligent AI legal assistant for WakiliWorld, a legal practice management platform.

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
- Law firm marketplace connections
- Task management
- Calendar scheduling
- Legal research assistance

Current user context:
- Active cases: ${cases_count || 0}
- Clients: ${clients_count || 0}
- Invoices: ${invoices_count || 0}
- Pending tasks: ${pending_tasks || 0}
- Upcoming deadlines (7 days): ${upcoming_deadlines || 0}
- User role: ${user_role || 'lawyer'}

Guidelines:
1. Keep responses conversational and natural - like a helpful colleague
2. Avoid filler phrases like "That's a great question" or "I understand you're asking..."
3. Get straight to the point while being warm
4. If you don't know something, say so honestly
5. Offer specific, actionable next steps
6. Remember conversation context when appropriate
7. For guests (not logged in), gently encourage sign-up to try features
8. Keep responses under 200 words unless detailed explanation is needed`;

  try {
    if (ACTIVE_PROVIDER === PROVIDERS.ZAI && ZAI_API_KEY) {
      return await callZai(message, systemPrompt, context);
    } else if (ACTIVE_PROVIDER === PROVIDERS.GROQ && GROQ_API_KEY) {
      return await callGroq(message, systemPrompt, context);
    } else {
      return fallbackResponse(message, context);
    }
  } catch (error) {
    console.error('AI query failed:', error);
    return fallbackResponse(message, context);
  }
}

/**
 * Quick action handler - simpler context for quick commands
 */
export async function quickAction(action, context = {}) {
  const systemPrompt = `You are Reya, responding to a quick action: "${action}"

Provide a concise, helpful response. If the action requires follow-up, suggest next steps. Keep it under 100 words. Be friendly and direct.`;

  try {
    if (ACTIVE_PROVIDER === PROVIDERS.ZAI && ZAI_API_KEY) {
      return await callZai(action, systemPrompt, context);
    } else if (ACTIVE_PROVIDER === PROVIDERS.GROQ && GROQ_API_KEY) {
      return await callGroq(action, systemPrompt, context);
    } else {
      return fallbackQuickAction(action, context);
    }
  } catch (error) {
    console.error('Quick action failed:', error);
    return fallbackQuickAction(action, context);
  }
}

/**
 * Call Zai Legal LLM API - specialized for legal domain
 */
async function callZai(message, systemPrompt, context) {
  const response = await fetch('https://api.zai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ZAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'zai-legal-v1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`ZAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  return {
    content,
    actions: extractActions(content),
    suggestions: extractSuggestions(content),
  };
}

/**
 * Call Groq Cloud API - ultra-fast inference
 */
async function callGroq(message, systemPrompt, context) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  return {
    content,
    actions: extractActions(content),
    suggestions: extractSuggestions(content),
  };
}

/**
 * Fallback response when AI services are unavailable
 * Uses the client-side contextual responses as backup
 */
function fallbackResponse(message, context) {
  // Defer to client-side getContextualResponse for now
  // This will be handled in ReyaAssistant.jsx
  return {
    content: `I'm having trouble connecting to my AI brain right now. But I can still help! Try asking about your cases, documents, or deadlines.`,
    actions: [],
    suggestions: [{ label: 'Show my cases', action: 'cases' }],
  };
}

function fallbackQuickAction(action, context) {
  return {
    content: `Quick action: "${action}". Let me help you with that.`,
    actions: [],
    suggestions: [],
  };
}

/**
 * Simple action extraction from AI response text
 * Format: [ACTION:label:icon:path] or [ACTION:label:action]
 */
function extractActions(content) {
  const actions = [];
  const actionRegex = /\[ACTION:([^:]+):([^:]+):(.+?)\]/g;
  let match;

  while ((match = actionRegex.exec(content)) !== null) {
    const [, label, icon, target] = match;
    actions.push({
      label,
      icon: icon !== 'null' ? icon : undefined,
      ...(target.startsWith('/') ? { path: target } : { action: target }),
    });
  }

  return actions;
}

/**
 * Simple suggestion extraction from AI response text
 * Format: [SUG:label:action]
 */
function extractSuggestions(content) {
  const suggestions = [];
  const sugRegex = /\[SUG:([^:]+):([^\]]+)\]/g;
  let match;

  while ((match = sugRegex.exec(content)) !== null) {
    const [, label, action] = match;
    suggestions.push({ label, action });
  }

  return suggestions;
}

export { ACTIVE_PROVIDER, PROVIDERS };
