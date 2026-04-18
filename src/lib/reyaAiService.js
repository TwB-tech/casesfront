/**
 * Reya AI Service - Serverless proxy to ZAI/GROQ
 * Client-side code calls this local endpoint to avoid CORS and expose keys
 */

const API_ENDPOINT = '/api/reya';

/**
 * Main query function - sends user message to AI with context
 */
export async function queryReaya(message, context = {}) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, quick: false }),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.fallback) {
        return {
          content: errorData.content,
          actions: errorData.actions || [],
          suggestions: errorData.suggestions || [],
        };
      }
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content,
      actions: data.actions || [],
      suggestions: data.suggestions || [],
    };
  } catch (error) {
    console.error('AI query failed:', error);
    return {
      content:
        "I'm having trouble connecting to my AI brain right now. But I can still help! Try asking about your cases, documents, or deadlines.",
      actions: [],
      suggestions: [{ label: 'Show my cases', action: 'cases' }],
    };
  }
}

/**
 * Quick action handler
 */
export async function quickAction(action, context = {}) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: action, context, quick: true, action }),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.fallback) {
        return {
          content: errorData.content,
          actions: errorData.actions || [],
          suggestions: errorData.suggestions || [],
        };
      }
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content,
      actions: data.actions || [],
      suggestions: data.suggestions || [],
    };
  } catch (error) {
    console.error('Quick action failed:', error);
    return {
      content: `Got it. Let me help with "${action}". What specifics should I include?`,
      actions: [],
      suggestions: [],
    };
  }
}

// Provider constants for client-side info only
export const PROVIDERS = {
  GROQ: 'groq',
  ZAI: 'zai',
  FALLBACK: 'fallback',
};

// Active provider determined server-side; client reports via response
export const ACTIVE_PROVIDER = 'server';
