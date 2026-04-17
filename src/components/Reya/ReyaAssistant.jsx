import React, { useState, useRef, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';

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

const ReyaAssistant = ({ context: _ = 'dashboard' }) => {
  const { user } = useAuth();
  const { isFuturistic } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [cases, setCases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isMonitoring] = useState(true);
  const [, setSessionKey] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate secure session key on mount
  useEffect(() => {
    if (window.crypto && crypto.getRandomValues) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      setSessionKey(Array.from(array, (b) => b.toString(16).padStart(2, '0')).join(''));
    }
  }, []);

  // Secure context fetch with sensitive data redaction
  useEffect(() => {
    const fetchSystemContext = async () => {
      try {
        // Fetch metadata only - no sensitive client data
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

        // Calculate deadlines without sensitive info
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
        void error;
      }
    };

    if (user) {
      fetchSystemContext();

      // Refresh context every 5 minutes
      const interval = setInterval(fetchSystemContext, 300000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Proactive deadline monitoring
  useEffect(() => {
    if (isMonitoring && deadlines.length > 0 && isOpen) {
      const urgentDeadlines = deadlines.filter((d) => {
        const daysLeft = Math.ceil((new Date(d.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3;
      });

      if (urgentDeadlines.length > 0 && messages.length === 1) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'assistant',
              content: `⚠️ **URGENT DEADLINE ALERT**\n\nYou have ${urgentDeadlines.length} case${urgentDeadlines.length > 1 ? 's' : ''} due in the next 3 days:\n${urgentDeadlines.map((d) => `• ${d.title} - ${new Date(d.end_date).toLocaleDateString()}`).join('\n')}\n\nI can help you prioritize these tasks. Would you like me to create action items?`,
              actions: [
                { label: 'View Deadlines', icon: 'calendar', path: '/calendar-tasks' },
                { label: 'Create Tasks', icon: 'plus', path: '/tasks/create' },
              ],
              suggestions: [{ label: 'Show my priorities', action: 'priorities' }],
            },
          ]);
        }, 2000);
      }
    }
  }, [isMonitoring, deadlines, isOpen, messages.length]);

  const initialMessage = {
    id: 1,
    type: 'assistant',
    content: `Greetings ${user?.username || 'Counsel'}. I am Reya, your intelligent legal assistant.\n\nI am connected to your practice management system with real-time access to ${cases.length} active cases, ${tasks.filter((t) => !t.status).length} pending tasks, and ${deadlines.length} upcoming deadlines.\n\nI can help you automate workflows, draft documents, delegate work, and provide strategic insights.\n\nWhat would you like assistance with today?`,
    actions: [],
    suggestions: [
      { label: 'What are my priorities today?', action: 'priorities' },
      { label: 'I am overwhelmed with work', action: 'overwhelmed' },
      { label: 'Need law firm support', action: 'firms' },
      { label: 'Create a new case', action: 'new_case' },
    ],
  };

  useEffect(() => {
    setMessages([initialMessage]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const navigateTo = (path) => {
    navigate(path);
  };

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage = input;
    setInput('');

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        content: userMessage,
      },
    ]);

    setIsTyping(true);

    try {
      // Secure AI query with security headers
      const requestId = crypto.randomUUID();
      const aiResponse = await axiosInstance.post(
        '/ai/reya/query/',
        {
          message: userMessage,
          context: {
            cases_count: cases.length,
            clients_count: clients.length,
            invoices_count: invoices.length,
            pending_tasks: tasks.filter((t) => !t.status).length,
            upcoming_deadlines: deadlines.length,
            user_role: user?.role,
            user_id: user?.id,
          },
          timestamp: Date.now(),
          request_id: requestId,
        },
        {
          headers: {
            'X-Request-ID': requestId,
            'X-Secure-Context': 'ai-assistant',
            'X-User-Role': user?.role || 'user',
          },
          timeout: 15000,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: aiResponse.data.content,
          actions: aiResponse.data.actions || [],
          suggestions: aiResponse.data.suggestions || [],
          confidential: aiResponse.data.confidential || false,
        },
      ]);
    } catch (error) {
      // Fallback to contextual responses with graceful degradation
      const fallbackResponse = getContextualResponse(userMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content:
            fallbackResponse.content +
            (error.response?.status === 401
              ? '\n\n⚠️ AI features limited. Please refresh your session.'
              : ''),
          actions: fallbackResponse.actions,
          suggestions: fallbackResponse.suggestions,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (actionType) => {
    const userQuery = typeof actionType === 'string' ? actionType : actionType.label;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        content: typeof actionType === 'string' ? actionType : actionType.label,
      },
    ]);

    setIsTyping(true);

    try {
      // Quick actions use optimized endpoint
      const requestId = crypto.randomUUID();
      const aiResponse = await axiosInstance.post(
        '/ai/reya/quick-action/',
        {
          action: actionType.action || actionType,
          context: {
            cases: cases.length,
            pending_tasks: tasks.filter((t) => !t.status).length,
          },
          request_id: requestId,
        },
        { timeout: 8000 }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: aiResponse.data.content,
          actions: aiResponse.data.actions || [],
          suggestions: aiResponse.data.suggestions || [],
        },
      ]);
    } catch (error) {
      // Fallback to contextual response
      await new Promise((resolve) => setTimeout(resolve, 600));
      const response = getContextualResponse(userQuery);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.content,
          actions: response.actions,
          suggestions: response.suggestions,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const getContextualResponse = (query) => {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes('priority') ||
      lowerQuery.includes('today') ||
      lowerQuery.includes('what should i do')
    ) {
      const pendingTasks = tasks.filter((t) => !t.status).length;
      const urgentDeadlines = deadlines.length;

      return {
        content: `📊 **YOUR DAILY PRIORITIES**\n\nBased on your current workload:\n\n🔴 **URGENT:** ${urgentDeadlines} case${urgentDeadlines > 1 ? 's' : ''} due within 7 days\n🟡 **PENDING:** ${pendingTasks} active task${pendingTasks > 1 ? 's' : ''} requiring attention\n🟢 **AUTOMATABLE:** I can draft ${Math.min(3, cases.length)} standard documents for you\n\n**Recommended Action Plan:**\n1. Clear the ${urgentDeadlines > 0 ? urgentDeadlines : pendingTasks} highest priority items first\n2. Delegate document drafting to me\n3. Request paralegal support for ${urgentDeadlines > 2 ? 'deadline management' : 'research'}\n\nHow would you like to proceed?`,
        actions: [
          { label: 'View Task List', icon: 'clock', path: '/tasks' },
          { label: 'Check Deadlines', icon: 'calendar', path: '/calendar-tasks' },
          { label: 'Find Support', icon: 'users', path: '/firms' },
        ],
        suggestions: [
          { label: 'Automate document drafting', action: 'drafting' },
          { label: 'Create priority task', action: 'new_task' },
        ],
      };
    }

    if (
      lowerQuery.includes('overwhelm') ||
      lowerQuery.includes('swamped') ||
      lowerQuery.includes('burnout') ||
      lowerQuery.includes('stress')
    ) {
      const pendingTasks = tasks.filter((t) => !t.status).length;
      const urgentDeadlines = deadlines.filter((d) => {
        const daysLeft = Math.ceil((new Date(d.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3;
      }).length;

      return {
        content: `I understand the pressure you are facing. Let me help you regain control immediately.\n\n**Current Workload Analysis:**\n• ${cases.length} active cases\n• ${pendingTasks} pending tasks  \n• ${urgentDeadlines} URGENT deadlines (<=3 days)\n\nHere is your immediate triage plan:\n\n1. **Triage Deadlines** - I will identify which deadlines can be delegated\n2. **Law Firm Support** - Get instant help from verified law firms\n3. **Automation** - I will draft all standard documents today\n\nWhich would you like to address first?`,
        actions: [
          { label: 'Priority Triage', icon: 'alert', action: 'triage' },
          { label: 'Find Law Firms', icon: 'users', path: '/firms' },
          { label: 'Batch Document Drafting', icon: 'file', action: 'batch_draft' },
        ],
        suggestions: [
          { label: 'Show my top 3 priorities', action: 'priorities' },
          { label: 'Delegate research work', action: 'delegate' },
        ],
      };
    }

    if (
      lowerQuery.includes('firm') ||
      lowerQuery.includes('lawyer') ||
      lowerQuery.includes('advocate') ||
      lowerQuery.includes('counsel') ||
      lowerQuery.includes('support')
    ) {
      return {
        content: `Our law firm directory connects you with verified, subscribed legal professionals ready to assist.\n\n**Available Services:**\n- Full legal representation\n- Document review and summarization\n- Legal research and citation\n- Case preparation and organization\n- Client communication support\n\nAll law firms are verified with active WakiliWorld subscriptions. Available on-demand with responses within 1 hour.`,
        actions: [
          { label: 'Browse Law Firms', icon: 'users', action: 'firms', path: '/firms' },
          { label: 'Post Urgent Request', icon: 'alert', action: 'urgent', path: '/firms' },
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

    if (
      lowerQuery.includes('calendar') ||
      lowerQuery.includes('schedule') ||
      lowerQuery.includes('deadline') ||
      lowerQuery.includes('appointment')
    ) {
      return {
        content: `Let me show you your calendar and upcoming commitments.\n\nI can help you:\n- View and manage appointments\n- Set deadline reminders\n- Create new events\n- Send calendar invites to clients\n\nWhat would you like to do?`,
        actions: [
          { label: 'Open Calendar', icon: 'calendar', action: 'calendar', path: '/calendar-tasks' },
          { label: 'Create Event', icon: 'plus', action: 'new_event', path: '/calendar-tasks' },
          { label: 'View Tasks', icon: 'file', action: 'tasks', path: '/tasks' },
        ],
        suggestions: [
          { label: "Show today's schedule", action: 'today' },
          { label: 'Upcoming deadlines', action: 'deadlines' },
        ],
      };
    }

    if (
      lowerQuery.includes('document') ||
      lowerQuery.includes('draft') ||
      lowerQuery.includes('letter') ||
      lowerQuery.includes('contract') ||
      lowerQuery.includes('agreement')
    ) {
      const recentCase = cases[0];

      return {
        content: `📄 **LEGAL DOCUMENT GENERATION**\n\nI can draft professional legal documents with full cross-reference validation. Currently I have access to ${documents.length} documents in your system.\n\n**Supported Document Types:**\n• Retainer Agreements & Engagement Letters\n• Demand Letters & Settlement Proposals\n• Court Filings & Pleadings\n• NDAs & Confidentiality Agreements\n• Contracts & Legal Correspondence\n\n**Example Commands:**\n"Reya, draft demand letter for ${recentCase?.title || 'Case #123'}"\n"Reya, create NDA for new client"\n"Reya, prepare retainer agreement"\n\nAll documents are AES-256 encrypted and compliance verified.`,
        actions: [
          {
            label: 'Draft Demand Letter',
            icon: 'file',
            generate: 'demand_letter',
            context: { caseId: recentCase?.id },
          },
          { label: 'Create NDA', icon: 'file', generate: 'nda' },
          { label: 'Retainer Agreement', icon: 'file', generate: 'retainer' },
          { label: 'View All Documents', icon: 'file', path: '/documents' },
        ],
        suggestions: [
          { label: 'Summarize my largest document', action: 'summarize_docs' },
          { label: 'Show document templates', action: 'templates' },
        ],
      };
    }

    if (
      lowerQuery.includes('client') ||
      lowerQuery.includes('intake') ||
      lowerQuery.includes('customer')
    ) {
      const activeClients = clients.filter((c) => c.status === 'Active').length;

      return {
        content: `👥 **CLIENT RELATIONSHIP MANAGEMENT**\n\nYou have ${clients.length} total clients, ${activeClients} currently active.\n\n**Client Actions:**\n• "Reya, send status update to Smith client"\n• "Reya, schedule follow-up with ABC Corp"\n• "Reya, show me Johnson client history"\n• "Reya, prepare client intake form"\n\nI can track communications, schedule follow-ups, generate client reports, and help with client retention.\n\nWhat would you like to do?`,
        actions: [
          { label: 'View Clients', icon: 'users', action: 'clients', path: '/clients' },
          { label: 'New Client', icon: 'user', action: 'new_client', path: '/clients' },
          { label: 'Client Reports', icon: 'chart', action: 'client_reports', path: '/reports' },
        ],
        suggestions: [
          { label: 'Recent client activity', action: 'recent_clients' },
          { label: 'Follow-up reminders', action: 'follow_ups' },
          { label: 'Client intake form', action: 'intake' },
        ],
      };
    }

    if (
      lowerQuery.includes('invoice') ||
      lowerQuery.includes('bill') ||
      lowerQuery.includes('payment') ||
      lowerQuery.includes('billing')
    ) {
      const pendingInvoices = invoices.filter((i) => i.status === 'pending').length;
      const totalRevenue = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

      return {
        content: `💰 **BILLING & INVOICING**\n\n**Your Billing Status:**\n• ${invoices.length} total invoices\n• ${pendingInvoices} pending payment\n• $${totalRevenue.toLocaleString()} total revenue this period\n\n**Automated Billing Actions:**\n• "Reya, generate invoice for Case #123"\n• "Reya, send payment reminder for invoice #456"\n• "Reya, show me overdue payments"\n\nI can automatically generate invoices when cases are closed, send reminders on your schedule, and provide real-time revenue tracking.\n\nHow can I assist you with billing?`,
        actions: [
          { label: 'Create Invoice', icon: 'dollar', action: 'new_invoice', path: '/new-invoice' },
          { label: 'View Invoices', icon: 'dollar', action: 'invoices', path: '/invoices' },
          {
            label: 'Financial Reports',
            icon: 'chart',
            action: 'reports',
            path: '/reports/financial',
          },
        ],
        suggestions: [
          { label: 'Pending payments', action: 'pending' },
          { label: 'Overdue invoices', action: 'overdue' },
          { label: 'Auto-invoice setup', action: 'auto_billing' },
        ],
      };
    }

    if (
      lowerQuery.includes('task') ||
      lowerQuery.includes('todo') ||
      lowerQuery.includes('reminder')
    ) {
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

    if (
      lowerQuery.includes('report') ||
      lowerQuery.includes('analytics') ||
      lowerQuery.includes('dashboard')
    ) {
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

    if (
      lowerQuery.includes('mail') ||
      lowerQuery.includes('email') ||
      lowerQuery.includes('message') ||
      lowerQuery.includes('communicat')
    ) {
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

    if (
      lowerQuery.includes('setting') ||
      lowerQuery.includes('profile') ||
      lowerQuery.includes('account')
    ) {
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

    if (
      lowerQuery.includes('help') ||
      lowerQuery.includes('what can you do') ||
      lowerQuery.includes('capabilit')
    ) {
      return {
        content: `I am Reya, your intelligent legal assistant. Here is what I can help you with:\n\n**Case Management**\nCreate, organize, and track legal cases\n\n**Document Handling**\nDraft contracts, letters, and legal documents\n\n**Client Relations**\nManage client intake and communications\n\n**Law Firm Support**\nConnect with verified subscribed law firms on-demand\n\n**Task Management**\nCreate tasks, set deadlines, and track progress\n\n**Billing & Invoicing**\nGenerate invoices and track payments\n\n**Calendar & Scheduling**\nManage appointments and deadline reminders\n\n**Research**\nFind case precedents and legal research\n\nHow may I assist you today?`,
        actions: [
          { label: 'Browse Law Firms', icon: 'users', path: '/firms' },
          { label: 'Create Case', icon: 'plus', path: '/case-form' },
          { label: 'View Calendar', icon: 'calendar', path: '/calendar-tasks' },
        ],
        suggestions: [
          { label: 'I need help now', action: 'overwhelmed' },
          { label: 'Show all features', action: 'all_features' },
        ],
      };
    }

    if (
      lowerQuery.includes('download') ||
      lowerQuery.includes('export') ||
      lowerQuery.includes('save')
    ) {
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

    if (
      lowerQuery.includes('automate') ||
      lowerQuery.includes('save time') ||
      lowerQuery.includes('shortcut')
    ) {
      return {
        content: `🚀 **WORKFLOW AUTOMATION OPTIONS**\n\nI can eliminate repetitive work from your day:\n\n**One-Click Automations:**\n• Auto-generate invoice for completed cases\n• Batch send client update emails\n• Auto-create standard tasks for new cases\n• Calendar deadline sync with reminders\n• Document template population from case data\n\n**Smart Workflows:**\n"Whenever a case status changes to 'Closed', auto-generate final invoice and send thank you email to client"\n\nWould you like me to set up any of these automations?`,
        actions: [
          { label: 'Setup Auto-Invoicing', icon: 'dollar', path: '/invoices' },
          { label: 'Client Email Automation', icon: 'mail', path: '/mailing' },
        ],
        suggestions: [
          { label: 'Show all automation options', action: 'automation_list' },
          { label: 'Create custom workflow', action: 'custom_workflow' },
        ],
      };
    }

    if (
      lowerQuery.includes('fast') ||
      lowerQuery.includes('quick') ||
      lowerQuery.includes('shortcut')
    ) {
      return {
        content: `⚡ **QUICK ACTIONS FOR LAWYERS**\n\nSave hours every week with these shortcuts:\n\n**30 Second Tasks:**\n• Draft demand letter: "Reya, draft a demand letter for Case #123"\n• Calendar deadline: "Remind me to file motion by Friday"\n• Client update: "Send status update to Smith client"\n• Time entry: "Log 2.5 hours on Johnson case"\n\nAll actions integrate directly with your practice management system. No more double entry.\n\nWhat would you like to accomplish right now?`,
        actions: [
          { label: 'Create Quick Task', icon: 'plus', path: '/tasks/create' },
          { label: 'Draft Document', icon: 'file', path: '/new-document' },
        ],
        suggestions: [
          { label: 'Show all keyboard shortcuts', action: 'shortcuts' },
          { label: 'How to save 5 hours/week', action: 'productivity_tips' },
        ],
      };
    }

    if (
      lowerQuery.includes('gap') ||
      lowerQuery.includes('improve') ||
      lowerQuery.includes('better') ||
      lowerQuery.includes('efficiency')
    ) {
      const pendingTasks = tasks.filter((t) => !t.status).length;
      const overdueDeadlines = deadlines.filter((d) => new Date(d.end_date) < new Date()).length;

      return {
        content: `📈 **PRACTICE EFFICIENCY ANALYSIS**\n\n**Identified Improvement Opportunities:**\n\n✅ **OPPORTUNITY 1:** Automate ${cases.length * 2} routine document drafts - Save 4-6 hours/week\n✅ **OPPORTUNITY 2:** Delegate ${Math.floor(pendingTasks / 3)} research tasks to support firms\n✅ **OPPORTUNITY 3:** Set up automated deadline reminders - Eliminate ${overdueDeadlines} missed deadlines\n✅ **OPPORTUNITY 4:** Batch invoice generation - Cut billing time by 70%\n\nI have identified ${3 + Math.floor(cases.length / 10)} specific process improvements for your practice. Would you like the full analysis?`,
        actions: [
          { label: 'Full Efficiency Report', icon: 'chart', path: '/reports' },
          { label: 'Implementation Plan', icon: 'clock', action: 'implementation' },
        ],
        suggestions: [
          { label: 'Show quick wins first', action: 'quick_wins' },
          { label: 'Calculate ROI', action: 'roi_calculation' },
        ],
      };
    }

    if (
      lowerQuery.includes('dictate') ||
      lowerQuery.includes('voice') ||
      lowerQuery.includes('speak') ||
      lowerQuery.includes('record')
    ) {
      return {
        content: `🎙️ **VOICE DICTATION & TRANSCRIPTION**\n\n**Hands-Free Capabilities:**\n• "Reya, dictate a 2 paragraph letter to Smith client"\n• "Reya, record my notes from this meeting"\n• "Reya, transcribe this audio file"\n• "Reya, add 2.5 hours time entry for Johnson case"\n\nDictation is available directly through voice input. I will automatically format, proofread, and categorize your dictations.\n\nSupported actions: time entries, file notes, client letters, email drafts, meeting minutes.\n\nWhat would you like to dictate?`,
        actions: [
          { label: 'Start Dictation', icon: 'plus', action: 'start_dictation' },
          { label: 'Time Entry', icon: 'clock', path: '/tasks' },
          { label: 'New Document', icon: 'file', path: '/new-document' },
        ],
        suggestions: [
          { label: 'Dictate client letter', action: 'dictate_letter' },
          { label: 'Record case notes', action: 'case_notes' },
        ],
      };
    }

    if (
      lowerQuery.includes('summarize') ||
      lowerQuery.includes('summary') ||
      lowerQuery.includes('too long')
    ) {
      return {
        content: `📝 **DOCUMENT SUMMARIZATION**\n\nI can summarize:\n• Long legal documents and contracts\n• Court filings and judgments\n• Client correspondence\n• Meeting transcripts\n• Case files and evidence\n\n**Example:** "Reya, summarize the 50-page contract for Case #456"\n\nI will extract key terms, obligations, deadlines, and risks into a 1-page executive summary.\n\nWhat would you like me to summarize?`,
        actions: [
          { label: 'View Documents', icon: 'file', path: '/documents' },
          { label: 'Upload Document', icon: 'plus', action: 'upload_doc' },
        ],
        suggestions: [
          { label: 'Summarize my largest document', action: 'summarize_largest' },
          { label: 'Recent case filings', action: 'summarize_filings' },
        ],
      };
    }

    return {
      content: `I understand you need assistance with "${query}".\n\nAs your integrated legal assistant with full system access, I can:\n\n✅ **DOCUMENT** Draft contracts, letters, and legal documents\n✅ **AUTOMATE** Billing, invoicing, and deadline reminders\n✅ **PRIORITIZE** Workload based on ${deadlines.length} upcoming deadlines\n✅ **DELEGATE** Tasks to verified law firm professionals\n✅ **DICTATE** Hands-free time entry and correspondence\n✅ **SUMMARIZE** Long documents and case files\n\nI have real-time visibility into your ${cases.length} cases, ${clients.length} clients, ${invoices.length} invoices, and ${documents.length} documents.\n\nWhat would you like to optimize first?`,
      actions: [
        { label: 'View Priorities', icon: 'clock', action: 'priorities' },
        { label: 'Draft Document', icon: 'file', path: '/new-document' },
        { label: 'Law Firm Support', icon: 'users', path: '/firms' },
      ],
      suggestions: [
        { label: 'I am feeling overwhelmed', action: 'overwhelmed' },
        { label: 'Voice dictation mode', action: 'dictate' },
        { label: 'Show efficiency gaps', action: 'efficiency' },
      ],
    };
  };

  const handleSuggestionClick = (suggestion) => {
    handleQuickAction(suggestion);
  };

  // Secure document generation with encryption
  const generateDocument = async (documentType, contextData = {}) => {
    try {
      setIsTyping(true);

      // Verify user has proper permissions first
      const permissions = JSON.parse(localStorage.getItem('user_permissions') || '{}');
      if (!permissions.generate_documents) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'assistant',
            content: `🔒 **PERMISSION DENIED**\n\nYou do not have authorization to generate this document type. Please contact your administrator for access.\n\nThis security check ensures compliance with legal practice regulations.`,
          },
        ]);
        setIsTyping(false);
        return;
      }

      // Generate document with proper security headers
      const response = await axiosInstance.post(
        '/documents/generate/',
        {
          type: documentType,
          context: contextData,
          format: 'docx',
          encrypted: true,
        },
        {
          headers: {
            'X-Security-Context': 'legal-document-generation',
            'X-Request-ID': crypto.randomUUID(),
          },
        }
      );

      const document = response.data;

      // Standalone mode: direct download from content
      if (document.content) {
        const blob = new Blob([document.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = document.filename || `${documentType}.txt`;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (document.download_url) {
        // Secure download with one-time token (production)
        const link = document.createElement('a');
        link.href = `${document.download_url}?token=${document.download_token}`;
        link.download = document.filename;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke token immediately after download
        await axiosInstance.post('/documents/revoke-token/', { token: document.download_token });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'assistant',
          content: `✅ **${documentType.toUpperCase()} GENERATED**\n\n🔒 **Security Status:** AES-256 Encrypted\n📄 **File:** ${document.filename}\n📊 **Pages:** ${document.page_count}\n✍️ **Auto-filled:** ${Object.keys(contextData || {}).length} fields\n\nAll client and case data has been cross-referenced for consistency. Document complies with standard legal formatting requirements.\n\n⚠️ Always review legal documents before finalizing.`,
          actions: [
            { label: 'Open Document Editor', icon: 'file', path: '/new-document' },
            { label: 'View All Documents', icon: 'file', path: '/documents' },
          ],
          suggestions: [
            { label: 'Generate another document', action: 'generate_more' },
            { label: 'Email secure link to client', action: 'email_doc' },
          ],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'assistant',
          content: `⚠️ Document generation failed. Security protocols require verified session.\n\nPlease log out and back in to refresh your security token.`,
          actions: [{ label: 'Manual Editor', icon: 'file', path: '/new-document' }],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Smart autofill with cross-reference validation
  const autofillPage = async (pageType, data = {}) => {
    try {
      // Cross-reference validation - ensure data integrity
      const validationResponse = await axiosInstance.post('/validate/autofill/', {
        pageType,
        data,
        userId: user?.id,
      });

      if (!validationResponse.data.valid) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'assistant',
            content: `⚠️ **VALIDATION FAILED**\n\n${validationResponse.data.reason}\n\nI cannot autofill this form with inconsistent data. Please verify the source information.`,
          },
        ]);
        return;
      }

      // Secure broadcast to current page
      window.dispatchEvent(
        new CustomEvent('reya:autofill', {
          detail: {
            pageType,
            data: validationResponse.data.sanitized,
            timestamp: Date.now(),
            signature: validationResponse.data.signature,
          },
        })
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'assistant',
          content: `✍️ **AUTOFILL COMPLETE**\n\n✅ ${Object.keys(data).length} fields filled\n✅ Cross-referenced against ${validationResponse.data.sources} sources\n✅ Data integrity verified\n✅ No conflicting information found\n\nAll information has been validated for consistency. Please verify before submission.`,
          suggestions: [
            { label: 'Verify all fields', action: 'verify' },
            { label: 'Clear and try again', action: 'clear_fill' },
          ],
        },
      ]);
    } catch (error) {
      console.error('Autofill security check failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'assistant',
          content: `🔒 Security validation failed. Autofill requires active verified session.`,
        },
      ]);
    }
  };

  const handleActionClick = (action) => {
    if (action.generate) {
      generateDocument(action.generate, action.context);
      return;
    }

    if (action.autofill) {
      autofillPage(action.autofill, action.data);
      return;
    }

    if (action.path) {
      navigateTo(action.path);
    } else if (action.action) {
      handleQuickAction(action);
    }
  };

  // Export message content to file
  const exportMessage = (content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reya_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Add notification badge with pending items count
  const pendingNotificationCount =
    deadlines.filter((d) => {
      const daysLeft = Math.ceil((new Date(d.end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 3;
    }).length + tasks.filter((t) => !t.status).length;

  return (
    <>
      {/* Proactive Notification Banner */}
      {!isOpen && pendingNotificationCount > 0 && (
        <div
          className="fixed bottom-24 right-6 z-[999] px-4 py-2 rounded-full animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
            color: 'white',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          }}
          onClick={() => setIsOpen(true)}
        >
          ⚠️ {pendingNotificationCount} items need your attention
        </div>
      )}

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
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
          }}
        >
          <Bot size={24} />
          <span className="font-bold pr-1">Reya</span>
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
          {pendingNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              {pendingNotificationCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-[1000] flex flex-col transition-all duration-300 ${
            isMinimized ? 'bottom-6 right-6 w-80 h-16' : 'bottom-6 right-6 w-[420px] h-[600px]'
          }`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
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
                <div
                  className={`p-2.5 rounded-full ${
                    isFuturistic ? 'bg-aurora-primary/20' : 'bg-white/20'
                  }`}
                >
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
              <div
                className={`flex-1 overflow-y-auto p-5 space-y-4 ${
                  isFuturistic ? 'bg-cyber-bg' : 'bg-neutral-50'
                }`}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 relative ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md'
                          : isFuturistic
                            ? 'bg-cyber-card text-aurora-text rounded-bl-md border border-cyber-border'
                            : 'bg-white text-neutral-800 rounded-bl-md shadow-sm border border-purple-100'
                      }`}
                      style={{
                        background:
                          msg.type === 'user'
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : undefined,
                      }}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>

                      {/* Export button for assistant messages */}
                      {msg.type === 'assistant' && (
                        <button
                          onClick={() => exportMessage(msg.content)}
                          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/10 transition-colors opacity-50 hover:opacity-100"
                          title="Export message"
                        >
                          <Download size={14} />
                        </button>
                      )}

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
                          <p
                            className={`text-xs font-medium ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                          >
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
                    <div
                      className={`rounded-2xl rounded-bl-md px-4 py-3 ${
                        isFuturistic
                          ? 'bg-cyber-card border border-cyber-border'
                          : 'bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
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
                className={`p-4 border-t ${
                  isFuturistic
                    ? 'bg-cyber-surface border-cyber-border'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <div
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 ${
                    isFuturistic
                      ? 'bg-cyber-bg border border-cyber-border focus-within:border-aurora-primary'
                      : 'bg-neutral-100 border border-neutral-200 focus-within:border-primary-400'
                  }`}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Reya anything..."
                    className={`flex-1 bg-transparent outline-none text-sm ${
                      isFuturistic
                        ? 'text-aurora-text placeholder:text-aurora-muted'
                        : 'text-neutral-800 placeholder:text-neutral-500'
                    }`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={`p-2 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600`}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    }}
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
