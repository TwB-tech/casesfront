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
  const [isGenerating, setIsGenerating] = useState(false);

  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [initialPrompt, setInitialPrompt] = useState('');

  // Expose openWithPrompt method to window for external triggers
  useEffect(() => {
    window.reyaAssistant = {
      openWithPrompt: (prompt) => {
        setInitialPrompt(prompt);
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
      isOpen: () => isOpen,
    };
    return () => {
      delete window.reyaAssistant;
    };
  }, [isOpen]);

  // Context data
  const [cases, setCases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

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
      } catch {
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

    const isDocGen =
      /generate|create|draft|write/i.test(userMessage) &&
      /document|contract|nda|agreement|letter/i.test(userMessage);

    setInput('');
    setMessages((prev) => [...prev, { id: Date.now(), type: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      if (isDocGen) {
        setIsGenerating(true);

        // Improved document type detection
        const docTypePatterns = {
          'employment contract': 'employment_contract',
          'service agreement': 'service_agreement',
          'lease agreement': 'lease_agreement',
          'rental agreement': 'lease_agreement',
          nda: 'nda',
          'non-disclosure': 'nda',
          confidentiality: 'nda',
          contract: 'contract',
          agreement: 'agreement',
          letter: 'letter',
          notice: 'notice',
          memo: 'memo',
          deed: 'deed',
          will: 'will',
          'power of attorney': 'power_of_attorney',
        };

        let detectedType = 'document';
        for (const [pattern, type] of Object.entries(docTypePatterns)) {
          if (userMessage.toLowerCase().includes(pattern)) {
            detectedType = type;
            break;
          }
        }

        const response = await axiosInstance.post('/documents/generate/', {
          type: detectedType,
          prompt: userMessage,
          context: {
            cases_count: cases.length,
            clients_count: clients.length,
            user_role: user?.role,
          },
          country: 'kenya',
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'assistant',
            content: response.data.content || 'Document generated successfully!',
            actions: [
              { label: 'View Documents', icon: 'file', path: '/documents' },
              { label: 'Create Another', icon: 'plus', action: 'generate_more' },
            ],
            suggestions: [
              { label: 'Generate Contract', action: 'generate_contract' },
              { label: 'Generate NDA', action: 'generate_nda' },
            ],
          },
        ]);
        setIsGenerating(false);
      } else {
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
      }
    } catch {
      const fallbackResponse = getSimpleFallback(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: fallbackResponse,
          actions: [
            { label: 'View Cases', icon: 'file', path: '/case-list' },
            { label: 'View Tasks', icon: 'check', path: '/tasks' },
          ],
          suggestions: [
            { label: 'Show my cases', action: 'cases' },
            { label: 'Draft document', action: 'drafting' },
          ],
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
  const handleActionClick = async (action) => {
    if (action.path) {
      const targetPath = action.path.startsWith('/') ? action.path : '/' + action.path;
      console.log('Reya navigating to:', targetPath);
      setIsOpen(false); // Close Reya first
      setTimeout(() => navigate(targetPath), 100); // Small delay to ensure Reya closes
    } else if (action.action) {
      // Handle different action types
      if (
        action.action.startsWith('generate_') ||
        action.action.includes('contract') ||
        action.action.includes('nda') ||
        action.action.includes('letter')
      ) {
        setInput(`generate ${action.action}`);
        setIsTyping(true);
        try {
          const response = await axiosInstance.post('/documents/generate/', {
            type: action.action.replace('generate_', ''),
            prompt: `Generate ${action.action.replace('generate_', '')}`,
            context: { user_role: user?.role },
            country: 'kenya',
          });

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'assistant',
              content: response.data.content || 'Generated successfully!',
              actions: [{ label: 'View Documents', icon: 'file', path: '/documents' }],
            },
          ]);
        } catch (genError) {
          console.error('Document generation error:', genError);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'assistant',
              content:
                'Document generation failed. Please try using the Documents section directly.',
              actions: [{ label: 'Go to Documents', icon: 'file', path: '/documents' }],
            },
          ]);
        } finally {
          setIsTyping(false);
        }
      } else {
        // Handle other actions like 'cases', 'clients', etc. by navigating
        const actionToPath = {
          // Map action names to correct existing routes
          cases: '/case-list',
          'show my cases': '/case-list',
          'view cases': '/case-list',
          clients: '/clients',
          'view clients': '/clients',
          tasks: '/tasks/',
          'check tasks': '/tasks/',
          'view tasks': '/tasks/',
          documents: '/documents',
          'view documents': '/documents',
          invoices: '/invoices',
          billing: '/invoices',
          calendar: '/calendar-tasks',
          deadlines: '/calendar-tasks',
          'new-case': '/case-form',
          'create case': '/case-form',
          'new-client': '/client-form',
          'add client': '/client-form',
          home: '/home',
          dashboard: '/home',
          profile: '/profile',
          settings: '/settings',
          firms: '/firms',
          'find firms': '/firms',
        };

        const path = actionToPath[action.action.toLowerCase()] || '/home';
        console.log('Reya action navigation to:', path, 'for action:', action.action);
        setIsOpen(false);
        setTimeout(() => navigate(path), 100);
      }
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

  // Handle initial prompt from external trigger
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInput(initialPrompt);
      setInitialPrompt('');
    }
  }, [initialPrompt, isOpen]);

  return (
    <>
      {/* Proactive Notification Banner */}
      {!isOpen && pendingNotificationCount > 0 && (
        <div
          className="fixed bottom-28 right-6 z-[999] px-4 py-2 rounded-full animate-pulse cursor-pointer hidden md:flex"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
            color: 'white',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          }}
          onClick={() => setIsOpen(true)}
        >
          ⚠️ {pendingNotificationCount} items need attention
        </div>
      )}

      {/* Main Assistant Interface */}
      <div
        className={`fixed bottom-6 right-6 z-[1000] md:right-8 ${isOpen ? 'md:w-96 w-[90vw] max-w-[384px]' : ''}`}
      >
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)',
              minWidth: '140px',
            }}
          >
            <Bot className="w-6 h-6 text-white flex-shrink-0" />
            <span className="text-white font-bold text-sm whitespace-nowrap">REYA</span>
            {pendingNotificationCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1">
                {pendingNotificationCount}
              </span>
            )}
          </button>
        ) : (
          // Open state - show chat interface
          <div
            className={`w-full h-[70vh] md:h-[600px] max-h-[600px] rounded-2xl shadow-2xl border flex flex-col ${
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
