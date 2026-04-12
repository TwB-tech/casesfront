import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageCircle, X, Send, Minimize2, Maximize2, Bot, 
  FileText, Calendar, Users, DollarSign, Settings, 
  BarChart3, FilePlus, Clock, AlertCircle, CheckCircle2,
  Sparkles, ChevronRight, Loader2, ExternalLink, Download,
  Plus, Search, SendHorizontal, UserPlus, Bell, Mail
} from 'lucide-react';
import { notification, Spin } from 'antd';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

const APP_ACTIONS = {
  NAVIGATE: 'navigate',
  DOWNLOAD: 'download',
  CREATE: 'create',
  VIEW: 'view',
  NOTIFY: 'notify',
};

const NAVIGATION_PATHS = {
  dashboard: '/home',
  cases: '/case-list',
  newCase: '/case-form',
  clients: '/clients',
  newClient: '/clients',
  documents: '/documents',
  newDocument: '/new-document',
  invoices: '/invoices',
  newInvoice: '/new-invoice',
  tasks: '/tasks',
  newTask: '/tasks/create',
  calendar: '/calendar-tasks',
  reports: '/reports',
  settings: '/settings',
  mailing: '/mailing',
  newMail: '/new-mail',
  chats: '/chat-users',
  paralegals: '/paralegals',
  pricing: '/pricing',
};

const QuickAction = ({ icon: Icon, label, description, onClick, variant = 'default' }) => {
  const { isFuturistic } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
        isFuturistic
          ? 'bg-cyber-surface hover:bg-cyber-hover border border-cyber-border hover:border-aurora-primary/50'
          : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-primary-300'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        isFuturistic 
          ? 'bg-gradient-to-br from-aurora-primary/20 to-aurora-secondary/20' 
          : 'bg-primary-50'
      }`}>
        <Icon className={`w-5 h-5 ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
          {label}
        </p>
        {description && (
          <p className={`text-xs truncate ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
            {description}
          </p>
        )}
      </div>
      <ChevronRight className={`w-4 h-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}`} />
    </button>
  );
};

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
  const { isFuturistic, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);
  const messagesEndRef = useRef(null);

  const initialMessage = {
    id: 1,
    type: 'assistant',
    content: `Greetings. I am Reya, your intelligent legal assistant.\n\nI can help you manage cases, draft documents, schedule tasks, connect with paralegals, and automate your practice workflow.\n\nWhat would you like assistance with today?`,
    actions: [],
    suggestions: [
      { label: 'I am overwhelmed with work', action: 'overwhelmed' },
      { label: 'Need paralegal support', action: 'paralegals' },
      { label: 'Create a new case', action: 'new_case' },
      { label: 'Check my calendar', action: 'calendar' },
    ],
  };

  useEffect(() => {
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const handleQuickAction = async (actionType) => {
    const userQuery = typeof actionType === 'string' ? actionType : actionType.label;
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: typeof actionType === 'string' ? actionType : actionType.label,
    }]);

    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const response = getContextualResponse(userQuery);
    
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: 'assistant',
      content: response.content,
      actions: response.actions,
      suggestions: response.suggestions,
    }]);
    
    setIsTyping(false);
  };

  const getContextualResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('overwhelm') || lowerQuery.includes('swamped') || lowerQuery.includes('burnout') || lowerQuery.includes('stress')) {
      return {
        content: `I understand the pressure you are facing. Let me help you regain control.\n\nHere is your immediate action plan:\n\n1. **Paralegal Support** - Get instant help from vetted remote paralegals\n2. **Deadline Audit** - I will scan and prioritize your urgent matters\n3. **Task Automation** - Delegate repetitive work to me\n\nWhich would you like to address first?`,
        actions: [
          { label: 'Find Paralegals', icon: 'users', action: 'paralegals', path: '/paralegals' },
          { label: 'View Calendar', icon: 'calendar', action: 'calendar', path: '/calendar-tasks' },
          { label: 'Create Task', icon: 'plus', action: 'new_task', path: '/tasks/create' },
        ],
        suggestions: [
          { label: 'Automate document drafting', action: 'drafting' },
          { label: 'Show my priorities', action: 'priorities' },
        ],
      };
    }

    if (lowerQuery.includes('paralegal') || lowerQuery.includes('staff') || lowerQuery.includes('support')) {
      return {
        content: `Our paralegal marketplace connects you with pre-vetted legal professionals ready to assist.\n\n**Available Services:**\n- Document review and summarization\n- Legal research and citation\n- Case preparation and organization\n- Client communication support\n\nAll paralegals are background-checked with minimum 3 years experience. Available on-demand with responses within 2 hours.`,
        actions: [
          { label: 'Browse Paralegals', icon: 'users', action: 'paralegals', path: '/paralegals' },
          { label: 'Post Urgent Request', icon: 'alert', action: 'urgent', path: '/paralegals' },
          { label: 'View Pricing', icon: 'dollar', action: 'pricing', path: '/pricing' },
        ],
        suggestions: [
          { label: 'How does matching work?', action: 'matching' },
          { label: 'Emergency support options', action: 'emergency' },
        ],
      };
    }

    if (lowerQuery.includes('case') || lowerQuery.includes('matter')) {
      return {
        content: `I can help you manage cases efficiently. Here is what I can do:\n\n**Case Management:**\n- Create and organize case files\n- Track deadlines and milestones\n- Assign tasks to team members\n- Generate case reports\n\nWould you like to create a new case or view existing ones?`,
        actions: [
          { label: 'Create New Case', icon: 'plus', action: 'new_case', path: '/case-form' },
          { label: 'View All Cases', icon: 'file', action: 'cases', path: '/case-list' },
        ],
        suggestions: [
          { label: 'Show urgent deadlines', action: 'deadlines' },
          { label: 'Case analytics', action: 'analytics' },
        ],
      };
    }

    if (lowerQuery.includes('calendar') || lowerQuery.includes('schedule') || lowerQuery.includes('deadline') || lowerQuery.includes('appointment')) {
      return {
        content: `Let me show you your calendar and upcoming commitments.\n\nI can help you:\n- View and manage appointments\n- Set deadline reminders\n- Create new events\n- Send calendar invites to clients\n\nWhat would you like to do?`,
        actions: [
          { label: 'Open Calendar', icon: 'calendar', action: 'calendar', path: '/calendar-tasks' },
          { label: 'Create Event', icon: 'plus', action: 'new_event', path: '/calendar-tasks' },
          { label: 'View Tasks', icon: 'file', action: 'tasks', path: '/tasks' },
        ],
        suggestions: [
          { label: 'Show today\'s schedule', action: 'today' },
          { label: 'Upcoming deadlines', action: 'deadlines' },
        ],
      };
    }

    if (lowerQuery.includes('document') || lowerQuery.includes('draft') || lowerQuery.includes('letter') || lowerQuery.includes('contract')) {
      return {
        content: `I can help you create professional legal documents.\n\n**Available Templates:**\n- Contracts and agreements\n- Demand letters\n- Court pleadings\n- NDAs and confidentiality agreements\n- Lease agreements\n- Employment contracts\n\nSelect a document type to get started.`,
        actions: [
          { label: 'Create Document', icon: 'file', action: 'new_document', path: '/new-document' },
          { label: 'View Documents', icon: 'file', action: 'documents', path: '/documents' },
        ],
        suggestions: [
          { label: 'Draft a demand letter', action: 'demand_letter' },
          { label: 'Create NDA template', action: 'nda' },
        ],
      };
    }

    if (lowerQuery.includes('client') || lowerQuery.includes('intake') || lowerQuery.includes('customer')) {
      return {
        content: `I can help you manage your client relationships.\n\n**Client Management:**\n- Add new clients\n- View client profiles\n- Track client communications\n- Access client case history\n\nHow would you like to proceed?`,
        actions: [
          { label: 'Add New Client', icon: 'user', action: 'new_client', path: '/clients' },
          { label: 'View Clients', icon: 'users', action: 'clients', path: '/clients' },
        ],
        suggestions: [
          { label: 'Show recent clients', action: 'recent_clients' },
          { label: 'Pending client tasks', action: 'client_tasks' },
        ],
      };
    }

    if (lowerQuery.includes('invoice') || lowerQuery.includes('bill') || lowerQuery.includes('payment') || lowerQuery.includes('billing')) {
      return {
        content: `I can help you manage billing and payments.\n\n**Billing Features:**\n- Generate professional invoices\n- Track payment status\n- Send payment reminders\n- View revenue reports\n\nWhat would you like to do?`,
        actions: [
          { label: 'Create Invoice', icon: 'dollar', action: 'new_invoice', path: '/new-invoice' },
          { label: 'View Invoices', icon: 'dollar', action: 'invoices', path: '/invoices' },
        ],
        suggestions: [
          { label: 'Pending payments', action: 'pending' },
          { label: 'Generate report', action: 'billing_report' },
        ],
      };
    }

    if (lowerQuery.includes('task') || lowerQuery.includes('todo') || lowerQuery.includes('reminder')) {
      return {
        content: `I can help you manage tasks and stay on top of your work.\n\n**Task Management:**\n- Create and assign tasks\n- Set priority levels\n- Track completion status\n- Receive deadline reminders\n\nHow can I assist you?`,
        actions: [
          { label: 'Create Task', icon: 'plus', action: 'new_task', path: '/tasks/create' },
          { label: 'View Tasks', icon: 'file', action: 'tasks', path: '/tasks' },
        ],
        suggestions: [
          { label: 'Show my tasks', action: 'my_tasks' },
          { label: 'Overdue items', action: 'overdue' },
        ],
      };
    }

    if (lowerQuery.includes('report') || lowerQuery.includes('analytics') || lowerQuery.includes('dashboard')) {
      return {
        content: `I can generate comprehensive reports and analytics for your practice.\n\n**Available Reports:**\n- Case performance metrics\n- Revenue and billing analysis\n- Productivity statistics\n- Client retention rates\n\nWhich report would you like to view?`,
        actions: [
          { label: 'View Reports', icon: 'chart', action: 'reports', path: '/reports' },
          { label: 'Dashboard', icon: 'chart', action: 'dashboard', path: '/home' },
        ],
        suggestions: [
          { label: 'Monthly summary', action: 'monthly' },
          { label: 'Case analytics', action: 'case_analytics' },
        ],
      };
    }

    if (lowerQuery.includes('mail') || lowerQuery.includes('email') || lowerQuery.includes('message') || lowerQuery.includes('communicat')) {
      return {
        content: `I can help you manage client communications.\n\n**Communication Features:**\n- Send professional emails\n- Track message history\n- Attach documents\n- Schedule emails\n\nWhat would you like to do?`,
        actions: [
          { label: 'Compose Email', icon: 'mail', action: 'new_mail', path: '/new-mail' },
          { label: 'View Messages', icon: 'mail', action: 'mailing', path: '/mailing' },
        ],
        suggestions: [
          { label: 'Unread messages', action: 'unread' },
          { label: 'Sent items', action: 'sent' },
        ],
      };
    }

    if (lowerQuery.includes('setting') || lowerQuery.includes('profile') || lowerQuery.includes('account')) {
      return {
        content: `I can help you manage your account settings.\n\n**Settings Available:**\n- Profile management\n- Notification preferences\n- Team management\n- Integration settings\n- Billing preferences\n\nWhere would you like to go?`,
        actions: [
          { label: 'Open Settings', icon: 'settings', action: 'settings', path: '/settings' },
          { label: 'Profile', icon: 'user', action: 'profile', path: '/profile' },
        ],
        suggestions: [
          { label: 'Notification settings', action: 'notifications' },
          { label: 'Team management', action: 'team' },
        ],
      };
    }

    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do') || lowerQuery.includes('capabilit')) {
      return {
        content: `I am Reya, your intelligent legal assistant. Here is what I can help you with:\n\n**Case Management**\nCreate, organize, and track legal cases\n\n**Document Handling**\nDraft contracts, letters, and legal documents\n\n**Client Relations**\nManage client intake and communications\n\n**Paralegal Support**\nConnect with vetted remote paralegals on-demand\n\n**Task Management**\nCreate tasks, set deadlines, and track progress\n\n**Billing & Invoicing**\nGenerate invoices and track payments\n\n**Calendar & Scheduling**\nManage appointments and deadline reminders\n\n**Research**\nFind case precedents and legal research\n\nHow may I assist you today?`,
        actions: [
          { label: 'Browse Paralegals', icon: 'users', path: '/paralegals' },
          { label: 'Create Case', icon: 'plus', path: '/case-form' },
          { label: 'View Calendar', icon: 'calendar', path: '/calendar-tasks' },
        ],
        suggestions: [
          { label: 'I need help now', action: 'overwhelmed' },
          { label: 'Show all features', action: 'all_features' },
        ],
      };
    }

    if (lowerQuery.includes('download') || lowerQuery.includes('export') || lowerQuery.includes('save')) {
      return {
        content: `I can help you download or export your data.\n\n**Export Options:**\n- Case documents as PDF/DOCX\n- Client lists as spreadsheet\n- Invoice records\n- Task reports\n- Calendar events\n\nWhat would you like to export?`,
        actions: [
          { label: 'View Documents', icon: 'file', path: '/documents' },
          { label: 'View Invoices', icon: 'dollar', path: '/invoices' },
          { label: 'Generate Report', icon: 'chart', path: '/reports' },
        ],
        suggestions: [
          { label: 'Export all cases', action: 'export_cases' },
          { label: 'Download invoice template', action: 'invoice_template' },
        ],
      };
    }

    return {
      content: `I understand you need assistance with "${query}".\n\nI am here to help you manage your legal practice efficiently. Here are the main areas I can assist with:\n\n- Case and client management\n- Document drafting and organization\n- Task and deadline tracking\n- Paralegal support connections\n- Billing and invoicing\n- Communication management\n\nCould you provide more details about what you need?`,
      actions: [
        { label: 'Case Management', icon: 'file', path: '/case-list' },
        { label: 'Paralegal Support', icon: 'users', path: '/paralegals' },
        { label: 'Calendar', icon: 'calendar', path: '/calendar-tasks' },
      ],
      suggestions: [
        { label: 'I am feeling overwhelmed', action: 'overwhelmed' },
        { label: 'Show me my dashboard', action: 'dashboard' },
      ],
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: userMessage,
    }]);

    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const response = getContextualResponse(userMessage);
    
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: 'assistant',
      content: response.content,
      actions: response.actions,
      suggestions: response.suggestions,
    }]);
    
    setIsTyping(false);
  };

  const handleActionClick = (action) => {
    if (action.path) {
      navigateTo(action.path);
    } else if (action.action) {
      handleQuickAction(action);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleQuickAction(suggestion);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-2 px-5 py-4 rounded-full shadow-2xl transition-all transform hover:scale-105 ${
            isFuturistic
              ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white'
              : 'bg-gradient-to-r from-primary-800 to-primary-600 text-white'
          }`}
          style={{
            boxShadow: isFuturistic 
              ? '0 8px 32px rgba(99, 102, 241, 0.4)' 
              : '0 8px 32px rgba(16, 42, 67, 0.3)',
          }}
        >
          <Bot size={24} />
          <span className="font-bold pr-1">Reya</span>
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-[1000] flex flex-col transition-all duration-300 ${
            isMinimized 
              ? 'bottom-6 right-6 w-80 h-16' 
              : 'bottom-6 right-6 w-[420px] h-[600px]'
          }`}
          style={{
            boxShadow: isFuturistic 
              ? '0 25px 50px -12px rgba(99, 102, 241, 0.25)' 
              : '0 25px 50px -12px rgba(16, 42, 67, 0.25)',
          }}
        >
          {/* Header */}
          <div 
            className={`flex items-center justify-between px-5 py-4 rounded-t-xl ${
              isFuturistic 
                ? 'bg-gradient-to-r from-cyber-surface to-cyber-bg border-b border-cyber-border' 
                : 'bg-gradient-to-r from-primary-900 to-primary-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`p-2.5 rounded-full ${
                  isFuturistic ? 'bg-aurora-primary/20' : 'bg-white/20'
                }`}>
                  <Bot size={22} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Reya</h3>
                <p className={`text-xs ${isFuturistic ? 'text-aurora-muted' : 'text-white/70'}`}>
                  Legal Assistant 
                  {isTyping && <span className="ml-1">is typing...</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/70 hover:text-white p-2 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-2 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${
                isFuturistic ? 'bg-cyber-bg' : 'bg-neutral-50'
              }`}>
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                        msg.type === 'user' 
                          ? isFuturistic
                            ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white rounded-br-md'
                            : 'bg-primary-800 text-white rounded-br-md'
                          : isFuturistic
                            ? 'bg-cyber-card text-aurora-text rounded-bl-md border border-cyber-border'
                            : 'bg-white text-neutral-800 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                      
                      {/* Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
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
                      {msg.suggestions && (
                        <div className="mt-4 space-y-2">
                          <p className={`text-xs font-medium ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                            Quick actions:
                          </p>
                          {msg.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(suggestion.action || suggestion)}
                              className={`block w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all ${
                                isFuturistic
                                  ? 'bg-cyber-surface hover:bg-cyber-hover text-aurora-text border border-cyber-border hover:border-aurora-primary/50'
                                  : 'bg-white hover:bg-primary-50 text-neutral-700 border border-neutral-200 hover:border-primary-300'
                              }`}
                            >
                              {typeof suggestion === 'string' ? suggestion : suggestion.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${
                      isFuturistic ? 'bg-cyber-card border border-cyber-border' : 'bg-white shadow-sm'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={`p-4 border-t ${
                isFuturistic 
                  ? 'bg-cyber-surface border-cyber-border' 
                  : 'bg-white border-neutral-200'
              }`}>
                <div className={`flex items-center gap-2 rounded-full px-4 py-2.5 ${
                  isFuturistic 
                    ? 'bg-cyber-bg border border-cyber-border focus-within:border-aurora-primary' 
                    : 'bg-neutral-100 border border-neutral-200 focus-within:border-primary-400'
                }`}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Reya anything..."
                    className={`flex-1 bg-transparent outline-none text-sm ${
                      isFuturistic ? 'text-aurora-text placeholder:text-aurora-muted' : 'text-neutral-800 placeholder:text-neutral-500'
                    }`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={`p-2 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      isFuturistic
                        ? 'bg-aurora-primary text-white hover:bg-aurora-secondary'
                        : 'bg-primary-800 text-white hover:bg-primary-700'
                    }`}
                  >
                    <SendHorizontal size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ReyaAssistant;
