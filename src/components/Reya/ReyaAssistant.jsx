import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Minimize2,
  Maximize2,
  Bot,
  SendHorizontal,
  Calendar,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  FilePlus,
  FileText,
  Clock,
  AlertCircle,
  Download,
  Plus,
  Search,
  UserPlus,
  Mail,
} from 'lucide-react';

import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { formatCurrency } from '../../utils/currency';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import eventBus from '../../utils/eventBus';
import {
  queryReaya as aiQuery,
  quickAction as aiQuickAction,
  ACTIVE_PROVIDER,
} from '../../lib/reyaAiService';

const ActionButton = ({ action, onClick, isFuturistic }) => {
  const getIcon = (iconName) => {
    const icons = {
      plus: Plus,
      file: FilePlus,
      calendar: Calendar,
      users: Users,
      dollar: DollarSign,
      download: Download,
      search: Search,
      mail: Mail,
      user: UserPlus,
      settings: Settings,
      chart: BarChart3,
      clock: Clock,
      alert: AlertCircle,
    };
    const IconComponent = icons[iconName] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        isFuturistic
          ? 'bg-aurora-primary/20 text-aurora-primary hover:bg-aurora-primary/30 border border-aurora-primary/30'
          : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
      }`}
    >
      {action.icon && getIcon(action.icon)}
      {action.label}
    </button>
  );
};

const ReyaAssistant = ({ context = 'dashboard' }) => {
  const { user } = useAuth();
  const { isFuturistic } = useTheme();
  const { currency } = useCurrency();
  const navigate = useNavigate();

  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  // Context data
  const [cases, setCases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);

  const messagesEndRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'assistant',
          content: `Hi! I'm Reya, your AI legal assistant. I can help you manage cases, draft documents, track deadlines, and handle client communications. What would you like to work on today?`,
          actions: [
            { label: 'View Cases', icon: 'file', path: '/case-list' },
            { label: 'Check Tasks', icon: 'check', path: '/tasks' },
            { label: 'Send Email', icon: 'mail', path: '/new-mail' },
          ],
          suggestions: [
            { label: 'Show me priorities', action: 'priorities' },
            { label: 'Draft a document', action: 'drafting' },
            { label: 'Find law firm help', action: 'firm_help' },
          ],
        },
      ]);
    }
  }, [messages.length]);

  // Fetch system context
  useEffect(() => {
    const fetchSystemContext = async () => {
      try {
        const [casesRes, tasksRes, invoicesRes, clientsRes, docsRes] = await Promise.all([
          axiosInstance.get('/case/', { params: { metadata_only: true } }),
          axiosInstance.get('/tasks/', { params: { metadata_only: true } }),
          axiosInstance.get('/invoices/', { params: { summary: true } }),
          axiosInstance.get('/client/', { params: { summary: true } }),
          axiosInstance.get('/documents/', { params: { metadata_only: true } }),
        ]);

        setCases(casesRes.data.results || []);
        setTasks(tasksRes.data.results || []);
        setInvoices(invoicesRes.data.results || []);
        setClients(clientsRes.data.results || []);
        setDocuments(docsRes.data.results || []);

        // Calculate deadlines
        const upcoming = (casesRes.data.results || [])
          .filter((c) => {
            const endDate = new Date(c.end_date);
            const now = new Date();
            const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays >= 0;
          })
          .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
          .map((c) => ({
            id: c.id,
            title: c.title,
            end_date: c.end_date,
            status: c.status,
          }));

        setDeadlines(upcoming);
      } catch (error) {
        // Silently handle errors
      }
    };

    if (user) {
      fetchSystemContext();

      // Listen for data changes
      const handleDataChange = () => fetchSystemContext();
      eventBus.on('taskCreated', handleDataChange);
      eventBus.on('taskUpdated', handleDataChange);
      eventBus.on('caseCreated', handleDataChange);
      eventBus.on('caseUpdated', handleDataChange);

      return () => {
        eventBus.off('taskCreated', handleDataChange);
        eventBus.off('taskUpdated', handleDataChange);
        eventBus.off('caseCreated', handleDataChange);
        eventBus.off('caseUpdated', handleDataChange);
      };
    }
  }, [user]);

  // Simple fallback responses
  const getSimpleFallback = useCallback((query) => {
    const q = query.toLowerCase();
    if (q.includes('case') || q.includes('matter')) {
      return 'You can view all cases in the Cases section, or create a new one. Need me to open it?';
    }
    if (q.includes('document') || q.includes('draft')) {
      return 'I can draft letters, contracts, and more. What type do you need?';
    }
    if (q.includes('deadline') || q.includes('calendar')) {
      return 'Check your calendar for upcoming deadlines. Want me to list urgent ones?';
    }
    if (q.includes('client')) {
      return 'All your clients are in the Clients section. Need to add a new one?';
    }
    if (q.includes('invoice') || q.includes('billing')) {
      return 'Invoices are in the Billing section. I can help create one.';
    }
    if (q.includes('task') || q.includes('todo')) {
      return 'You have pending tasks in the Tasks list. Want me to show them?';
    }
    return "I'm here to help. Try asking about cases, documents, deadlines, clients, or billing.";
  }, []);

  // Send message function
  const sendMessage = useCallback(async () => {
    const userMessage = input.trim();
    if (!userMessage) {
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { id: Date.now(), type: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const aiResponse = await aiQuery(userMessage, {
        cases_count: cases.length,
        clients_count: clients.length,
        invoices_count: invoices.length,
        pending_tasks: tasks.filter((t) => !t.status).length,
        upcoming_deadlines: deadlines.length,
        user_role: user?.role,
        user_id: user?.id,
        is_authenticated: !!user,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          ...aiResponse,
        },
      ]);
    } catch (error) {
      const fallbackResponse = getSimpleFallback(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: fallbackResponse,
          actions: [],
          suggestions: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [
    input,
    user,
    cases.length,
    clients.length,
    invoices.length,
    tasks,
    deadlines.length,
    getSimpleFallback,
  ]);

  // Handle keyboard input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle action clicks
  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path);
      setIsOpen(false);
    }
  };

  // Calculate pending notifications
  const pendingNotificationCount =
    deadlines.filter((d) => {
      const daysLeft = Math.ceil((new Date(d.end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 3;
    }).length + tasks.filter((t) => !t.status).length;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Proactive Notification Banner */}
      {!isOpen && pendingNotificationCount > 0 && (
        <div
          className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[999] px-3 md:px-4 py-2 rounded-full animate-pulse cursor-pointer text-xs md:text-sm"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
            color: 'white',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            maxWidth: 'calc(100vw - 32px)',
          }}
          onClick={() => setIsOpen(true)}
        >
          ⚠️ {pendingNotificationCount} items need attention
        </div>
      )}

      {/* Main Assistant Interface */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[1000] w-[calc(100vw-32px)] md:w-96 max-w-[384px]">
        {!isOpen ? (
          // Closed state - show floating button
          <button
            onClick={() => setIsOpen(true)}
            className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${
              isFuturistic
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            <Bot className="w-6 h-6 text-white" />
            {pendingNotificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {pendingNotificationCount}
              </span>
            )}
          </button>
        ) : (
          // Open state - show chat interface
          <div
            className={`w-full h-[calc(100vh-120px)] md:h-[600px] max-h-[600px] rounded-2xl shadow-2xl border flex flex-col ${
              isFuturistic ? 'bg-cyber-card border-cyber-border' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 border-b ${
                isFuturistic ? 'border-cyber-border' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isFuturistic ? 'bg-aurora-primary' : 'bg-blue-500'
                  }`}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${isFuturistic ? 'text-aurora-text' : 'text-gray-900'}`}
                  >
                    Reya Assistant
                  </h3>
                  <p className="text-xs text-gray-500">{isTyping ? 'Typing...' : 'Online'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div
                  className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                    isFuturistic ? 'bg-cyber-bg' : 'bg-gray-50'
                  }`}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md'
                            : isFuturistic
                              ? 'bg-cyber-card text-aurora-text rounded-bl-md border border-cyber-border'
                              : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>

                        {/* Actions */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.actions.map((action, idx) => (
                              <ActionButton
                                key={idx}
                                action={action}
                                onClick={() => handleActionClick(action)}
                                isFuturistic={isFuturistic}
                              />
                            ))}
                          </div>
                        )}

                        {/* Suggestions */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs opacity-70">Quick actions:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleActionClick(suggestion)}
                                  className={`block w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${
                                    isFuturistic
                                      ? 'bg-cyber-surface hover:bg-cyber-hover text-aurora-text border border-cyber-border hover:border-aurora-primary/50'
                                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {typeof suggestion === 'string' ? suggestion : suggestion.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div
                        className={`rounded-2xl rounded-bl-md px-4 py-3 ${
                          isFuturistic
                            ? 'bg-cyber-card border border-cyber-border'
                            : 'bg-white shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                  className={`p-4 border-t ${isFuturistic ? 'border-cyber-border' : 'border-gray-200'}`}
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                        isFuturistic
                          ? 'bg-cyber-surface border-cyber-border focus:ring-aurora-primary text-aurora-text placeholder-gray-400'
                          : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-900 placeholder-gray-500'
                      }`}
                      disabled={isTyping}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || isTyping}
                      className={`p-2 rounded-lg transition-all ${
                        input.trim() && !isTyping
                          ? isFuturistic
                            ? 'bg-aurora-primary hover:bg-aurora-primary/80 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <SendHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ReyaAssistant;
