import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import { Bot, Send, Search, Paperclip, Users, Bookmark, UserPlus, MoreVertical } from 'lucide-react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import eventBus from '../utils/eventBus';

export default function Chat() {
  const { user } = useAuth();
  const { isFuturistic } = useTheme();
  const { Option } = Select;
  const navigate = useNavigate();
  const isAdminOrFirm = user && ['admin', 'administrator', 'firm'].includes(user.role?.toLowerCase());

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [fileList, setFileList] = useState([]);
  const [roomName, setRoomName] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteForm] = Form.useForm();
  const [sendingInvite, setSendingInvite] = useState(false);

  // Get or create team room on mount
  useEffect(() => {
    const getRoom = async () => {
      try {
        const response = await axiosInstance.get('/chats/team-room/');
        setRoomName(response.data.room_name || 'team_chat');
      } catch (error) {
        console.error('Error getting team room:', error);
        setRoomName('team_chat');
      }
    };
    if (user) getRoom();
  }, [user]);

  // Fetch team members if admin or firm
  useEffect(() => {
    const fetchTeam = async () => {
      if (!user) return;
      const isAdminOrFirm = ['admin', 'administrator', 'firm'].includes(user.role?.toLowerCase());
      if (!isAdminOrFirm) return;

      try {
        const response = await axiosInstance.get('/users');
        setTeamMembers(response.data.results || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    fetchTeam();
  }, [user]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const messagesResponse = await axiosInstance.get(`chats/get-messages/${roomName}/`);
      const formattedMessages = messagesResponse.data.map((msg) => ({
        sender_id: msg.sender,
        message: msg.content,
        timestamp: msg.timestamp,
        room: roomName,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages on mount
  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, fetchMessages]);

  // Invite handler
  const handleInvite = async () => {
    try {
      const values = await inviteForm.validateFields();
      setSendingInvite(true);
      await axiosInstance.post('/hr/invites/', values);
      message.success('Invitation sent successfully');
      setInviteVisible(false);
      inviteForm.resetFields();
    } catch (error) {
      console.error('Error sending invite:', error);
      message.error('Failed to send invite. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  };

  // Listen for new messages from other tabs
  useEffect(() => {
    const unsub = eventBus.on('chatMessageSent', () => {
      if (user) fetchMessages();
    });
    return () => unsub();
  }, [user, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if ((!message && fileList.length === 0) || !user) return;

    const tempMessage = {
      sender_id: user.id,
      message: message,
      timestamp: new Date().toISOString(),
      room: roomName,
      temp: true,
      attachments: fileList.map((f) => f.name),
    };

    setMessages((prev) => [...prev, tempMessage]);
    const currentMessage = message;
    const filesToUpload = fileList;
    setMessage('');
    setFileList([]);

    try {
      // Send via HTTP API (which proxies to WebSocket backend)
      await axiosInstance.post('/chats/send-message/', {
        message: currentMessage,
        room: roomName,
        sender_id: user.id,
      });
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Filter messages by search
  const filteredMessages = searchQuery
    ? messages.filter((msg) =>
        msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className={`flex h-screen ${isFuturistic ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      {/* Main Chat Area */}
      <div className="flex flex-col w-full">
        {/* Header */}
        <header className={`border-b p-4 ${isFuturistic ? 'border-purple-800 bg-[#0a0a1a]' : 'border-gray-200 bg-white'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFuturistic ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500' : 'bg-blue-500'}`}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>Team Chat</h2>
                <span className={`text-xs ${connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
                  {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  className={`pl-8 pr-4 py-2 rounded-lg text-sm ${isFuturistic ? 'bg-[#1a1a2f] border-purple-800 text-white' : 'bg-gray-50 border-gray-300'}`}
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: '1px solid', width: '200px' }}
                />
              </div>
              {isAdminOrFirm && (
                <button
                  onClick={() => setShowTeamPanel(true)}
                  className={`p-2 rounded-full ${isFuturistic ? 'bg-cyber-surface text-aurora-text hover:bg-cyber-hover' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  title="Team Members"
                >
                  <Users className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <main
          ref={chatContainerRef}
          className={`flex-1 overflow-auto p-4 space-y-4 ${isFuturistic ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <Bot className={`w-16 h-16 mx-auto mb-4 ${isFuturistic ? 'text-purple-400' : 'text-gray-400'}`} />
                <p className={`text-lg ${isFuturistic ? 'text-gray-300' : 'text-gray-500'}`}>No messages yet</p>
                <p className={`text-sm ${isFuturistic ? 'text-gray-400' : 'text-gray-400'}`}>Start the conversation!</p>
              </div>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              const isOwn = msg.sender_id === user?.id || msg.sender_id === 'current-user';
              const senderName = isOwn ? (user?.username || 'You') : (msg.sender_id === 'reya' ? 'Reya AI' : 'Team Member');
              
              return (
                <div
                  key={msg.timestamp || index}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${isOwn ? (isFuturistic ? 'bg-purple-600 text-white' : 'bg-blue-500 text-white') : (isFuturistic ? 'bg-[#1a1a2f] text-gray-200 border border-purple-800' : 'bg-white text-gray-900 border')}`}>
                    {!isOwn && (
                      <p className={`text-xs font-semibold mb-1 ${isFuturistic ? 'text-purple-300' : 'text-blue-600'}`}>{senderName}</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 text-xs opacity-70">
                        📎 {msg.attachments.join(', ')}
                      </div>
                    )}
                     <p className={`text-xs mt-1 ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
                       {new Date(msg.timestamp).toLocaleString([], {
                         year: 'numeric',
                         month: 'short',
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </p>
                     {/* Save to Notes button */}
                     <button
                       onClick={() => {
                         const title = `Chat note ${new Date().toLocaleDateString()}`;
                         const content = `${senderName}: ${msg.message}`;
                         if (window.saveToNotes) {
                           window.saveToNotes(title, content).then(success => {
                             if (success) {
                               // Optionally show a brief confirmation
                               console.log('Note saved successfully');
                             }
                           });
                         } else {
                           console.error('saveToNotes not available');
                         }
                       }}
                       className={`text-xs flex items-center gap-1 mt-1 transition-colors ${
                         isFuturistic
                           ? 'text-purple-400 hover:text-purple-300'
                           : 'text-gray-400 hover:text-blue-600'
                       }`}
                       title="Save to Notes"
                     >
                       <Bookmark className="w-3 h-3" />
                       Save to Notes
                     </button>
                   </div>
                 </div>
               );
             })
          )}
        </main>

        {/* Footer / Message Input */}
        <footer className={`border-t p-4 ${isFuturistic ? 'border-purple-800 bg-[#0a0a1a]' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
               <Paperclip className={`w-5 h-5 ${isFuturistic ? 'text-purple-400 hover:text-purple-300' : 'text-gray-500 hover:text-gray-700'}`} />
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFileList((prev) => [...prev, ...files]);
                }}
              />
            </label>
            <input
              className={`flex-1 py-2 px-4 rounded-lg focus:outline-none ${isFuturistic ? 'bg-[#1a1a2f] border-purple-800 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 focus:border-blue-500'}`}
              style={{ border: '1px solid' }}
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!message && fileList.length === 0}
              className={`py-2 px-4 rounded-lg transition-colors ${isFuturistic ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:to-purple-600 text-white disabled:opacity-50' : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {fileList.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {fileList.map((file, idx) => (
                <div key={idx} className={`text-xs px-2 py-1 rounded ${isFuturistic ? 'bg-purple-900 text-purple-200' : 'bg-gray-100 text-gray-600'}`}>
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </footer>
      </div>

      {/* Team Members Panel */}
      {showTeamPanel && isAdminOrFirm && (
        <div className={`fixed inset-y-0 right-0 w-80 shadow-xl z-50 flex flex-col ${isFuturistic ? 'bg-[#1a1a2f] border-l border-purple-800' : 'bg-white border-l border-gray-200'}`}>
          <div className={`p-4 border-b flex justify-between items-center ${isFuturistic ? 'border-purple-800' : 'border-gray-200'}`}>
            <h3 className={`font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>Team Members</h3>
            <button
              onClick={() => setShowTeamPanel(false)}
              className={`p-1 rounded ${isFuturistic ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className={`p-3 rounded-lg ${isFuturistic ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFuturistic ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-blue-500 text-white'}`}>
                    {member.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className={`font-medium ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>{member.username}</div>
                    <div className={`text-xs ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>{member.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isAdminOrFirm && (
            <div className={`p-4 border-t ${isFuturistic ? 'border-purple-800' : 'border-gray-200'}`}>
              <Button
                type="primary"
                icon={<UserPlus className="w-4 h-4" />}
                className={isFuturistic ? 'futuristic-btn' : ''}
                block
                onClick={() => setInviteVisible(true)}
              >
                Invite Member
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        title="Invite Team Member"
        open={inviteVisible}
        onCancel={() => setInviteVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={inviteForm} layout="vertical" onFinish={handleInvite}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' },
            ]}
          >
            <Input placeholder="employee@company.com" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Option value="partner">Partner</Option>
              <Option value="associate">Associate</Option>
              <Option value="paralegal">Paralegal</Option>
              <Option value="legal_researcher">Legal Researcher</Option>
              <Option value="office_manager">Office Manager</Option>
              <Option value="administrator">Administrator</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select placeholder="Select department">
              <Option value="litigation">Litigation</Option>
              <Option value="corporate">Corporate</Option>
              <Option value="research">Research</Option>
              <Option value="administration">Administration</Option>
              <Option value="marketing">Marketing</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setInviteVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={sendingInvite}>
                Send Invite
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
