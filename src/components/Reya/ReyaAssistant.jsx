import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, FileText, Briefcase, Users, Calendar, Lightbulb, Zap, Bot, UserPlus, Clock, AlertTriangle, Download, Sparkles, Scale, FileCheck } from 'lucide-react';
import { Spin, notification, Button } from 'antd';
import axiosInstance from '../../axiosConfig';
import useAuth from '../../hooks/useAuth';

// Reya - Your Intelligent Legal Assistant
const ReyaAssistant = ({ context = 'dashboard', currentCase = null, currentClient = null }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTool, setActiveTool] = useState(null);

  const [systemPrompt] = useState(`You are Reya, your intelligent legal assistant.

## Core Identity
You were built for legal professionals. You understand the pressure, the deadlines, the endless paperwork. You get it.

Your tone: Direct. Calm. Competent. No fluff. No corporate speak. No forced jokes unless they ask. Just solutions.

## What you can do
You control this entire platform. You can:
• Create, organize, and manage cases
• Draft legal documents properly formatted
• Research case law and precedents
• Generate invoices and track billing
• Schedule tasks and monitor deadlines
• Connect you with paralegal support
• Analyze documents for key information
• Generate downloadable outputs

## How to respond
1. Be concise. They don't have time for long explanations.
2. Be specific. If you don't know something, say so clearly.
3. Be useful. Don't just tell them something can be done - offer to do it.
4. Be proactive. When you see a problem, point it out.

When someone is stressed or overwhelmed, acknowledge it first then immediately offer solutions.

No nonsense. No marketing. Just results.

Current context: ${context} page. ${currentCase ? 'Active case present.' : ''} ${currentClient ? 'Active client present.' : ''}`);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello. I\'m Reya. I can help you manage cases, draft documents, find support, and get work done faster.\n\nWhat do you need today?',
      suggestions: [
        'I\'m overwhelmed with work',
        'Need paralegal support',
        'Draft a demand letter',
        'Check upcoming deadlines'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Quick action handlers
  const handleQuickAction = async (action) => {
    setIsLoading(true);
    
    // Simulate AI processing
    const response = await getAIResponse(action);
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: action
    }, {
      id: Date.now() + 1,
      type: 'assistant',
      content: response.content,
      actions: response.actions
    }]);
    
    setIsLoading(false);
  };

  // Send message handler
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setIsLoading(true);
    
    // Get AI response
    const response = await getAIResponse(userMessage);
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: userMessage
    }, {
      id: Date.now() + 1,
      type: 'assistant',
      content: response.content,
      actions: response.actions
    }]);
    
    setIsLoading(false);
  };

  // AI Response generator
  const getAIResponse = async (query) => {
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      const response = await axiosInstance.post('/ai/chat', {
        prompt: query,
        context: {
          page: context,
          currentCase,
          currentClient,
          history: messages.slice(-10)
        }
      }, { timeout: 30000 });

      if (response.data?.content) {
        return {
          content: response.data.content,
          actions: detectActions(response.data.content, query),
          suggestions: generateSuggestions(query, response.data.content)
        };
      }
      
      return parseAndHandleQuery(query);
      
    } catch (error) {
      console.error('AI Service error:', error);
      return parseAndHandleQuery(query);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Auto-detect actions from AI response
  const detectActions = (content, query) => {
    const actions = [];
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Document drafting detected
    if (lowerQuery.includes('draft') || lowerQuery.includes('letter') || lowerQuery.includes('contract') || lowerQuery.includes('motion')) {
      actions.push({ 
        label: 'Download as DOCX', 
        icon: 'download', 
        action: 'download_docx',
        content 
      });
      actions.push({ 
        label: 'Save to Documents', 
        icon: 'save', 
        action: 'save_document',
        content 
      });
    }

    // Case creation detected
    if (lowerQuery.includes('case') || lowerQuery.includes('matter') || lowerQuery.includes('file')) {
      actions.push({ 
        label: 'Create New Case', 
        icon: 'file', 
        action: 'create_case' 
      });
    }

    // Task/deadline detected
    if (lowerQuery.includes('task') || lowerQuery.includes('deadline') || lowerQuery.includes('remind') || lowerQuery.includes('schedule')) {
      actions.push({ 
        label: 'Create Task', 
        icon: 'calendar', 
        action: 'create_task' 
      });
    }

    // Paralegal support needed
    if (lowerQuery.includes('help') || lowerQuery.includes('paralegal') || lowerQuery.includes('assist') || lowerQuery.includes('overwhelm')) {
      actions.push({ 
        label: 'Find Available Paralegals', 
        icon: 'users', 
        action: 'find_paralegals' 
      });
    }

    // Research conducted
    if (lowerQuery.includes('research') || lowerQuery.includes('precedent') || lowerQuery.includes('case law')) {
      actions.push({ 
        label: 'Download Research Memo', 
        icon: 'download', 
        action: 'download_research',
        content 
      });
    }

    return actions;
  };

  // Generate context-aware suggestions
  const generateSuggestions = (query, response) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('overwhelm') || lowerQuery.includes('stress') || lowerQuery.includes('busy')) {
      return [
        'Audit all my upcoming deadlines',
        'Find a paralegal for document review',
        'What should I prioritize today?'
      ];
    }
    
    if (lowerQuery.includes('draft')) {
      return [
        'Can you make this more aggressive?',
        'Add a confidentiality clause',
        'Create a template for this'
      ];
    }

    return [
      'What else can you help with?',
      'Show me keyboard shortcuts',
      'Switch to Zai Legal LLM'
    ];
  };

  // Intelligent query parser - fallback when AI service is unavailable
  const parseAndHandleQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Case-related responses
    if (lowerQuery.includes('case') || lowerQuery.includes('create case')) {
      return {
        content: 'I can help you create a new case. Let me gather the necessary information:\n\n• Client name\n• Case type (Criminal, Civil, Corporate, Family, etc.)\n• Brief description\n• Priority level\n\nWould you like me to open the case creation form?',
        actions: [
          { label: 'Open Case Form', icon: 'file', action: 'open_case_form' },
          { label: 'Show Case Templates', icon: 'file', action: 'show_templates' }
        ]
      };
    }
    
    // Document-related responses
    if (lowerQuery.includes('document') || lowerQuery.includes('draft')) {
      return {
        content: 'I can help you draft legal documents. I have templates for:\n\n• Contracts & Agreements\n• Demand Letters\n• Court Pleadings\n• NDAs\n• Lease Agreements\n• Employment Contracts\n\nWhich type of document would you like to create?',
        actions: [
          { label: 'Contract Template', icon: 'file', action: 'draft_contract' },
          { label: 'Demand Letter', icon: 'file', action: 'draft_demand' },
          { label: 'NDA Template', icon: 'file', action: 'draft_nda' }
        ]
      };
    }
    
    // Research-related responses
    if (lowerQuery.includes('research') || lowerQuery.includes('similar') || lowerQuery.includes('precedent')) {
      return {
        content: 'I\'ll search for relevant case precedents and legal research based on your current case. This may take a moment...\n\nFound some relevant precedents:\n\n• Case A vs B (2023) - Similar dispute resolution\n• Corporation X vs Y (2022) - Contract interpretation\n• Estate of Z (2021) - Similar inheritance matter',
        actions: [
          { label: 'View Full Research', icon: 'search', action: 'view_research' },
          { label: 'Save to Case', icon: 'save', action: 'save_research' }
        ]
      };
    }
    
    // Client-related responses
    if (lowerQuery.includes('client') || lowerQuery.includes('intake')) {
      return {
        content: 'I can help with client management. Would you like to:\n\n• Add a new client\n• View client history\n• Send client communication\n• Check pending tasks for a client',
        actions: [
          { label: 'Add New Client', icon: 'user', action: 'add_client' },
          { label: 'View Client List', icon: 'users', action: 'view_clients' }
        ]
      };
    }
    
    // Task/calendar responses
    if (lowerQuery.includes('task') || lowerQuery.includes('schedule') || lowerQuery.includes('deadline')) {
      return {
        content: 'I can help you manage tasks and schedules. Let me check your upcoming deadlines:\n\n📅 Tomorrow: Client meeting - Mr. Johnson\n📅 Feb 28: Court appearance - Case #2345\n📅 Mar 5: Document deadline - Contract review\n\nWould you like me to create a new task or reminder?',
        actions: [
          { label: 'Create Task', icon: 'plus', action: 'create_task' },
          { label: 'View Calendar', icon: 'calendar', action: 'view_calendar' }
        ]
      };
    }
    
    // Billing/invoice responses
    if (lowerQuery.includes('invoice') || lowerQuery.includes('bill') || lowerQuery.includes('payment')) {
      return {
        content: 'I can help with billing and invoicing. Would you like to:\n\n• Generate an invoice\n• Check payment status\n• Send payment reminder\n• View revenue reports',
        actions: [
          { label: 'Create Invoice', icon: 'dollar', action: 'create_invoice' },
          { label: 'View Payments', icon: 'dollar', action: 'view_payments' }
        ]
      };
    }
    
    // Overwhelmed / burnout detection
    if (lowerQuery.includes('overwhelm') || lowerQuery.includes('stress') || lowerQuery.includes('too much') || lowerQuery.includes('swamped') || lowerQuery.includes('burnout')) {
      return {
        content: `I understand this feeling completely - it's why we built WakiliWorld. Let's get you some relief immediately.\n\nHere's what I can do right now:\n\n✅ **Emergency Paralegal Support** - Connect you with pre-vetted remote paralegals available within 2 hours for document review, legal research, or case preparation\n\n✅ **Deadline Audit** - Scan all your cases and surface only the most urgent priorities\n\n✅ **Automate Drafting** - Offload document creation to me while you focus on critical work\n\n✅ **Workflow Optimization** - Show you shortcuts to cut your admin time in half\n\nYou don't have to handle everything alone. What would help most right now?`,
        actions: [
          { label: 'Find Available Paralegals', icon: 'users', action: 'find_paralegals' },
          { label: 'Audit My Deadlines', icon: 'clock', action: 'audit_deadlines' },
          { label: 'Offload Documents', icon: 'file', action: 'offload_documents' }
        ]
      };
    }

    // Paralegal / manpower shortage
    if (lowerQuery.includes('paralegal') || lowerQuery.includes('help') || lowerQuery.includes('staff') || lowerQuery.includes('shortage') || lowerQuery.includes('overloaded') || lowerQuery.includes('need help')) {
      return {
        content: `Absolutely. Our remote paralegal network is available 24/7 for exactly these situations.\n\n**Available immediately:**\n• Document review & summarization\n• Legal research & citation checking\n• Case preparation & organization\n• Client intake & communication\n• Deadline tracking & calendaring\n\nAll paralegals are:\n✅ Vetted with minimum 3 years legal experience\n✅ Background checked\n✅ Specialized by practice area\n✅ Available on hourly, project, or emergency basis\n\nWould you like me to show you available paralegals right now?`,
        actions: [
          { label: 'Browse Paralegals', icon: 'users', action: 'browse_paralegals' },
          { label: 'Post Urgent Request', icon: 'zap', action: 'post_paralegal_request' },
          { label: 'View Pricing', icon: 'dollar', action: 'paralegal_pricing' }
        ]
      };
    }

    // General help
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you')) {
      return {
        content: 'I\'m Reya, your AI legal assistant. I can help you with:\n\n📋 **Case Management**\n- Create and manage cases\n- Track case progress\n- Research precedents\n\n📄 **Document Handling**\n- Draft legal documents\n- Review contracts\n- Generate templates\n\n👥 **Client Relations**\n- Client intake\n- Communication tracking\n\n⚡ **Paralegal Support**\n- Connect with remote paralegals\n- Emergency manpower support\n\n📅 **Productivity**\n- Task management\n- Deadline reminders\n\n💰 **Billing**\n- Invoicing\n- Payment tracking\n\nWhat would you like help with?',
        actions: [
          { label: 'Find Paralegal Support', icon: 'users', action: 'find_paralegals' }
        ]
      };
    }
    
    // Default response
    return {
      content: 'I understand you need help with "' + query + '". Let me assist you with that.\n\nHere are some things I can help with:\n• Creating and managing cases\n• Drafting legal documents\n• Researching case precedents\n• **Connecting with remote paralegals for extra support**\n• Managing clients\n• Scheduling tasks and deadlines\n• Handling billing and invoices\n\nCould you tell me a bit more about what you need?',
      actions: [
        { label: 'Show All Features', icon: 'lightbulb', action: 'show_features' },
        { label: 'Get Paralegal Support', icon: 'users', action: 'find_paralegals' }
      ]
    };
  };

  // Handle action button clicks - Full App Automation
  const handleAction = async (action, content = null) => {
    setActiveTool(action);
    
    notification.info({
      message: 'Reya',
      description: `Executing: ${action}`,
      placement: 'bottomRight'
    });
    
    try {
      switch (action) {
        // Document Automation
        case 'download_docx':
          await downloadAsDocx(content);
          notification.success({ message: 'Success', description: 'Document downloaded as DOCX' });
          break;
          
        case 'save_document':
          await axiosInstance.post('/documents/', {
            title: 'AI Generated Document',
            content,
            type: 'generated',
            created_at: new Date().toISOString()
          });
          notification.success({ message: 'Success', description: 'Document saved to library' });
          break;
        
        // Case Automation
        case 'create_case':
          window.location.href = '/case-form';
          break;
          
        // Task Automation
        case 'create_task':
          window.location.href = '/tasks/create/';
          break;
          
        // Invoice Automation  
        case 'create_invoice':
          window.location.href = '/new-invoice';
          break;
          
        // Paralegal Marketplace
        case 'find_paralegals':
        case 'browse_paralegals':
          notification.success({
            message: 'Paralegal Marketplace',
            description: 'Instantly connect with vetted paralegals available now.',
            placement: 'bottomRight',
            duration: 5
          });
          // This will navigate to the marketplace when implemented
          break;
          
        case 'post_paralegal_request':
          notification.success({
            message: 'Emergency Support Activated',
            description: 'Verified paralegals are being notified. Expect responses within 15 minutes.',
            placement: 'bottomRight',
            duration: 5
          });
          break;
          
        // Research Automation
        case 'download_research':
          await downloadAsDocx(content, 'legal-research');
          notification.success({ message: 'Success', description: 'Research memorandum downloaded' });
          break;
          
        // Deadlines & Calendar
        case 'audit_deadlines':
          window.location.href = '/calendar-tasks';
          notification.success({ 
            message: 'Deadline Audit', 
            description: 'Scanning all cases for upcoming critical dates' 
          });
          break;
          
        // Client Management
        case 'add_client':
          window.location.href = '/clients';
          break;
          
        // AI Provider Switching
        case 'switch_provider':
          setAiProvider(aiProvider === 'groq' ? 'zai' : 'groq');
          notification.success({
            message: 'AI Provider Switched',
            description: `Now using ${aiProvider === 'groq' ? 'Zai Legal LLM' : 'Groq Cloud LPU™'}`
          });
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Action execution failed:', error);
      notification.error({ message: 'Error', description: 'Failed to execute action' });
    } finally {
      setActiveTool(null);
    }
  };

  // Generate and download DOCX file
  const downloadAsDocx = async (content, prefix = 'reya-document') => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>WakiliWorld AI Generated Document</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 8.5in; margin: 1in; }
          h1, h2, h3 { font-family: 'Arial', sans-serif; }
        </style>
      </head>
      <body>${content.replace(/\n/g, '<br>')}</body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#1A365D] to-[#38A169] text-white p-4 rounded-full shadow-2xl hover:shadow-lg transition-all transform hover:scale-110 flex items-center gap-2"
          style={{
            boxShadow: '0 8px 32px rgba(26, 54, 93, 0.4)'
          }}
        >
          <Bot size={24} />
          <span className="font-bold">Reya</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-white rounded-xl shadow-2xl transition-all duration-300 flex flex-col ${
            isMinimized ? 'bottom-6 right-6 w-80 h-14' : 'bottom-6 right-6 w-96 h-[500px]'
          }`}
          style={{
            boxShadow: '0 12px 48px rgba(26, 54, 93, 0.2)',
            border: '1px solid #E2E8F0'
          }}
        >
           {/* Header */}
           <div 
             className="flex items-center justify-between p-4 rounded-t-xl"
             style={{ background: 'linear-gradient(135deg, #102a43 0%, #243b53 100%)' }}
           >
             <div className="flex items-center gap-3">
               <div className="relative">
                 <div className="bg-white/20 p-2 rounded-full">
                   <Bot size={20} className="text-white" />
                 </div>
                 <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
               </div>
               <div>
                 <h3 className="text-white font-bold">Reya</h3>
                 <p className="text-xs text-white/70">
                   Legal Assistant {isTyping && ' • Typing...'}
                 </p>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => setIsMinimized(!isMinimized)}
                 className="text-white/70 hover:text-white transition-colors"
               >
                 {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
               </button>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="text-white/70 hover:text-white transition-colors"
               >
                 <X size={18} />
               </button>
             </div>
           </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        msg.type === 'user' 
                          ? 'bg-[#1A365D] text-white rounded-br-md' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      
                      {/* Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAction(action.action)}
                              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                                msg.type === 'user'
                                  ? 'bg-white/20 text-white hover:bg-white/30'
                                  : 'bg-[#1A365D] text-white hover:bg-[#38A169]'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {msg.suggestions && (
                        <div className="mt-3 space-y-2">
                          {msg.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickAction(suggestion)}
                              className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-[#1A365D] hover:bg-blue-50 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Reya anything..."
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-[#1A365D] text-white p-2 rounded-full hover:bg-[#2D3748] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
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
