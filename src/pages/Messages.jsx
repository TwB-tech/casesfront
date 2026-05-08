import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import { MessageCircle, Send, Search, Paperclip, Users, User, MoreVertical, Plus } from 'lucide-react';
import { Modal, Form, Input, Select, Button, message, Avatar, List, Badge } from 'antd';
import eventBus from '../utils/eventBus';

export default function Messages() {
  const { user } = useAuth();
  const { isFuturistic } = useTheme();
  const { Option } = Select;
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [fileList, setFileList] = useState([]);
  const [users, setUsers] = useState([]);
  const [newConversationVisible, setNewConversationVisible] = useState(false);
  const [form] = Form.useForm();

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch users for starting new conversations
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const response = await axiosInstance.get('/users');
        // Filter out current user and get users from different organizations or external contacts
        const availableUsers = response.data.results.filter(u => u.id !== user.id);
        setUsers(availableUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [user]);

  // Fetch conversations (direct message rooms)
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      // This would need a new API endpoint to get all DM conversations for a user
      // For now, we'll create conversations on demand when messages are sent
      const response = await axiosInstance.get(`/chats/user-conversations/${user.id}`);
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (roomName) => {
    if (!user || !roomName) return;
    try {
      const messagesResponse = await axiosInstance.get(`chats/get-messages/${roomName}`);
      const formattedMessages = messagesResponse.data.map((msg) => ({
        sender_id: msg.sender,
        message: msg.content,
        timestamp: msg.timestamp,
        room: roomName,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user]);

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.room_name);
    }
  }, [selectedConversation, fetchMessages]);

  // Listen for new messages
  useEffect(() => {
    const unsub = eventBus.on('chatMessageSent', () => {
      if (user && selectedConversation) {
        fetchMessages(selectedConversation.room_name);
      }
    });
    return () => unsub();
  }, [user, selectedConversation, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Start new conversation
  const handleStartConversation = async () => {
    try {
      const values = await form.validateFields();
      const otherUser = users.find(u => u.id === values.user_id);

      if (!otherUser) {
        message.error('Selected user not found');
        return;
      }

      // Create or get existing room
      const response = await axiosInstance.post('/chats/create-or-get-chat-room', {
        user_id: user.id,
        other_user_id: values.user_id,
      });

      const conversation = {
        ...response.data,
        other_user: otherUser,
      };

      setSelectedConversation(conversation);
      setConversations(prev => {
        const existing = prev.find(c => c.id === conversation.id);
        if (existing) return prev;
        return [...prev, conversation];
      });

      setNewConversationVisible(false);
      form.resetFields();
      message.success('Conversation started');
    } catch (error) {
      console.error('Error starting conversation:', error);
      message.error('Failed to start conversation');
    }
  };

  // Send message
  const sendMessage = async () => {
    if ((!message && fileList.length === 0) || !user || !selectedConversation) return;

    const tempMessage = {
      sender_id: user.id,
      message: message,
      timestamp: new Date().toISOString(),
      room: selectedConversation.room_name,
      temp: true,
      attachments: fileList.map((f) => f.name),
    };

    setMessages((prev) => [...prev, tempMessage]);
    const currentMessage = message;
    const filesToUpload = fileList;
    setMessage('');
    setFileList([]);

    try {
      await axiosInstance.post('/chats/send-message', {
        message: currentMessage,
        room: selectedConversation.room_name,
        sender_id: user.id,
      });
      fetchMessages(selectedConversation.room_name);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Filter conversations by search
  const filteredConversations = searchQuery
    ? conversations.filter((conv) =>
        conv.other_user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const getConversationDisplayName = (conv) => {
    return conv.other_user?.username || 'Unknown User';
  };

  const getConversationAvatar = (conv) => {
    return conv.other_user?.username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className={`flex h-screen ${isFuturistic ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      {/* Conversations Sidebar */}
      <div className={`w-80 border-r ${isFuturistic ? 'border-purple-800 bg-[#0a0a1a]' : 'border-gray-200 bg-white'} flex flex-col`}>
        {/* Header */}
        <header className={`border-b p-4 ${isFuturistic ? 'border-purple-800' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFuturistic ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500' : 'bg-blue-500'}`}>
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
                <span className={`text-xs ${connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
                  {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setNewConversationVisible(true)}
              size="small"
            >
              New
            </Button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-400" />
              <input
                className={`pl-8 pr-4 py-2 rounded-lg text-sm w-full ${isFuturistic ? 'bg-[#1a1a2f] border-purple-800 text-white' : 'bg-gray-50 border-gray-300'}`}
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: '1px solid' }}
              />
            </div>
          </div>
        </header>

        {/* Conversations List */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading conversations...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <MessageCircle className={`w-16 h-16 mb-4 ${isFuturistic ? 'text-purple-400' : 'text-gray-400'}`} />
              <p className={`text-lg mb-2 ${isFuturistic ? 'text-gray-300' : 'text-gray-500'}`}>No conversations yet</p>
              <p className={`text-sm mb-4 ${isFuturistic ? 'text-gray-400' : 'text-gray-400'}`}>Start a conversation with someone</p>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setNewConversationVisible(true)}
              >
                Start Conversation
              </Button>
            </div>
          ) : (
            <List
              dataSource={filteredConversations}
              renderItem={(conv) => (
                <List.Item
                  className={`cursor-pointer hover:bg-opacity-50 ${
                    selectedConversation?.id === conv.id
                      ? isFuturistic ? 'bg-purple-900 bg-opacity-30' : 'bg-blue-50'
                      : isFuturistic ? 'hover:bg-purple-900 hover:bg-opacity-20' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar className={isFuturistic ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-blue-500'}>
                        {getConversationAvatar(conv)}
                      </Avatar>
                    }
                    title={
                      <span className={`font-medium ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                        {getConversationDisplayName(conv)}
                      </span>
                    }
                    description={
                      <span className={`text-sm ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
                        {conv.last_message || 'No messages yet'}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </main>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {selectedConversation ? (
          <>
            {/* Header */}
            <header className={`border-b p-4 ${isFuturistic ? 'border-purple-800 bg-[#0a0a1a]' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <Avatar className={isFuturistic ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-blue-500'}>
                  {getConversationAvatar(selectedConversation)}
                </Avatar>
                <div>
                  <h2 className={`font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                    {getConversationDisplayName(selectedConversation)}
                  </h2>
                  <span className={`text-xs text-green-500`}>
                    Online
                  </span>
                </div>
              </div>
            </header>

            {/* Messages Area */}
            <main
              ref={chatContainerRef}
              className={`flex-1 overflow-auto p-4 space-y-4 ${isFuturistic ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}
            >
              {messages.map((msg, index) => {
                const isOwn = msg.sender_id === user?.id;
                const senderName = isOwn ? 'You' : getConversationDisplayName(selectedConversation);

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
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </main>

            {/* Message Input */}
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${isFuturistic ? 'text-purple-400' : 'text-gray-400'}`} />
              <p className={`text-lg ${isFuturistic ? 'text-gray-300' : 'text-gray-500'}`}>Select a conversation</p>
              <p className={`text-sm ${isFuturistic ? 'text-gray-400' : 'text-gray-400'}`}>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <Modal
        title="Start New Conversation"
        open={newConversationVisible}
        onCancel={() => setNewConversationVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleStartConversation}>
          <Form.Item
            name="user_id"
            label="Select User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Choose someone to message">
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.username} ({user.role})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setNewConversationVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Start Conversation
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}