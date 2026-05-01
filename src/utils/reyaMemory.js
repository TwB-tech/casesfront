/**
 * Reya Conversation Memory Manager
 * Handles persistent conversation history, session management, and context summarization
 */

const MEMORY_KEY = 'reya_memory';
const SESSION_KEY = 'reya_session_id';
const MAX_HISTORY = 20; // Keep last N message pairs (user+assistant)
const SUMMARY_TRIGGER = 12; // When history exceeds this many messages, summarize

/**
 * Generate or retrieve persistent session ID
 */
export function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getCurrentThreadId() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('reya_current_thread');
}

export function setCurrentThreadId(threadId) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('reya_current_thread', threadId);
}

/**
 * Get full conversation memory from storage
 */
export function getMemory() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save conversation memory to storage
 */
export function saveMemory(memory) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch (e) {
    console.warn('Failed to save Reya memory:', e);
  }
}

/**
 * Initialize a new conversation thread
 */
export function initThread(userContext = {}) {
  const threadId = `thread_${Date.now()}`;
  const memory = getMemory() || {
    sessions: [],
    summaries: {},
    userProfile: userContext,
  };

  // Create new session entry
  const session = {
    threadId,
    sessionId: getSessionId(),
    startedAt: new Date().toISOString(),
    messages: [],
    lastActivity: Date.now(),
    metadata: userContext,
  };

  memory.sessions.push(session);
  // Keep only last 50 sessions
  memory.sessions = memory.sessions.slice(-50);
  
  // Update user profile
  if (userContext) {
    memory.userProfile = { ...memory.userProfile, ...userContext };
  }

  saveMemory(memory);
  return { threadId, memory };
}

/**
 * Append a message pair (user + assistant) to current thread
 */
export function appendMessage(threadId, userMessage, assistantResponse, metadata = {}) {
  const memory = getMemory();
  if (!memory) return null;

  const session = memory.sessions.find((s) => s.threadId === threadId);
  if (!session) return null;

  // Append user message
  session.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  });

  // Append assistant response
  session.messages.push({
    role: 'assistant',
    content: assistantResponse.content,
    timestamp: new Date().toISOString(),
    actions: assistantResponse.actions || [],
    suggestions: assistantResponse.suggestions || [],
    metadata,
  });

  session.lastActivity = Date.now();

  // Check if summarization needed
  if (session.messages.length >= SUMMARY_TRIGGER * 2) {
    const summary = summarizeMessages(session.messages.slice(0, -MAX_HISTORY * 2));
    const summaryKey = `${threadId}_summary`;
    memory.summaries[summaryKey] = summary;
    // Trim to MAX_HISTORY message pairs
    session.messages = session.messages.slice(-MAX_HISTORY * 2);
  }

  saveMemory(memory);
  return memory;
}

/**
 * Get conversation context for current thread
 * Returns: { history, summary, userProfile }
 */
export function getConversationContext(threadId) {
  const memory = getMemory();
  if (!memory) return { history: [], summary: null, userProfile: {} };

  const session = memory.sessions.find((s) => s.threadId === threadId);
  if (!session) return { history: [], summary: null, userProfile: memory.userProfile || {} };

  const summaryKey = `${threadId}_summary`;
  return {
    history: session.messages,
    summary: memory.summaries[summaryKey],
    userProfile: memory.userProfile,
  };
}

/**
 * Summarize a list of messages into a concise paragraph
 */
function summarizeMessages(messages) {
  if (!messages.length) return '';

  const userMsgs = messages.filter((m) => m.role === 'user').map((m) => m.content);
  const assistantMsgs = messages.filter((m) => m.role === 'assistant').map((m) => m.content);

  const summary = `Earlier conversation covered: ${userMsgs.join('; ')}. Assistant helped with: ${assistantMsgs.join('; ')}.`;
  return summary;
}

/**
 * Clear all conversation memory (for testing or user request)
 */
export function clearMemory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MEMORY_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Get recent topics mentioned in conversation
 */
export function getRecentTopics(threadId, limit = 5) {
  const { history } = getConversationContext(threadId);
  const userMessages = history.filter((m) => m.role === 'user').slice(-limit);
  return userMessages.map((m) => m.content);
}

/**
 * Check if a topic was previously discussed
 */
export function hasDiscussedd(threadId, keyword) {
  const { history } = getConversationContext(threadId);
  const keywordLower = keyword.toLowerCase();
  return history.some(
    (m) => m.role === 'user' && m.content.toLowerCase().includes(keywordLower)
  );
}
