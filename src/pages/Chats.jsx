// import { useParams } from 'react-router-dom';
// import React, { useState, useEffect, useCallback } from 'react';
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";
// import { Card, CardContent } from "../components/ui/card";
// import useAuth from '../hooks/useAuth';
// import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
// import axiosInstance from '../axiosConfig';

// export default function Chats() {
//     const { roomName } = useParams();
//     const { user } = useAuth();
//     const [message, setMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [socket, setSocket] = useState(null);
//     const [otherUser, setOtherUser] = useState(null);

//     useEffect(() => {
//         const fetchRoomInfo = async () => {
//             try {
//                 const response = await axiosInstance.get(`chats/room-info/${roomName}/`);
//                 const otherUserId = response.data.participants.find(id => id !== user.id);
//                 const otherUserResponse = await axiosInstance.get(`/auth/user/${otherUserId}/`);
//                 setOtherUser(otherUserResponse.data);
//             } catch (error) {
//                 console.error('Error fetching room info:', error);
//             }
//         };

//         if (user && roomName) {
//             fetchRoomInfo();
//         } else {
//             console.log('No user or room name');
//         }
//     }, [user, roomName]);

//     // Fetch previous messages
//     useEffect(() => {
//         const fetchMessages = async () => {
//             try {
//                 const messagesResponse = await axiosInstance.get(`chats/get-messages/${roomName}/`);
//                 const formattedMessages = messagesResponse.data.map(msg => ({
//                     sender_id: msg.sender,
//                     message: msg.content,
//                     timestamp: msg.timestamp,
//                     room: roomName
//                 }));
//                 setMessages(formattedMessages);
//             } catch (error) {
//                 console.error('Error fetching messages:', error);
//             }
//         };

//         if (user && roomName) {
//             fetchMessages();
//         }
//     }, [user, roomName]);

//     useEffect(() => {
//         if (user && roomName) {
//             const socketInstance = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);
//             setSocket(socketInstance);

//             socketInstance.onopen = () => {
//                 console.log('WebSocket connection opened');
//             };

//             socketInstance.onerror = (error) => {
//                 console.log('WebSocket error:', error);
//             };

//             socketInstance.onmessage = function(event) {
//                 const data = JSON.parse(event.data);
//                 console.log('Received message:', data);
//                 setMessages((prevMessages) => [...prevMessages, data]);
//             };

//             socketInstance.onclose = () => {
//                 console.log('WebSocket connection closed');
//             };

//             return () => socketInstance.close();
//         }
//     }, [user, roomName]);

//     const sendMessage = () => {
//         if (socket && message && user) {
//             const messageData = {
//                 message: message,
//                 room: roomName,
//                 sender_id: user.id,
//             };
//             socket.send(JSON.stringify(messageData));
//             setMessage('');
//         } else {
//             console.log('No socket, message or user');
//         }
//     };

//     return (
//         <div key="1" className="flex h-screen bg-white dark:bg-zinc-800">
//             <aside className="w-80 border-r dark:border-zinc-700">
//                 <div className="p-4 space-y-4">
//                     <div className="flex justify-between items-center">
//                         <h2 className="text-xl font-bold">Messages</h2>
//                     </div>
//                     <div className="relative">
//                         <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
//                         <Input className="pl-8" placeholder="Search messages..." type="search" />
//                         <Button className="absolute right-2.5 top-3" size="icon" variant="ghost" />
//                     </div>
//                     <div className="space-y-2">
//                         <Card className="p-2">
//                             <CardContent>
//                                 <h3 className="font-semibold">{otherUser && otherUser.username ? otherUser.username : 'Loading...'}</h3>
//                                 <p className="text-xs text-zinc-500 dark:text-zinc-400">Last message...</p>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>
//             </aside>
//             <section className="flex flex-col w-full">
//                 <header className="border-b dark:border-zinc-700 p-4">
//                     <h2 className="text-xl font-bold flex items-center gap-2">
//                         <Avatar className="relative overflow-visible w-10 h-10">
//                             <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
//                             <AvatarFallback>U</AvatarFallback>
//                         </Avatar>
//                         <div>
//                             {otherUser && otherUser.username ? otherUser.username : 'Loading...'}
//                             <span className="text-xs text-green-600 block">Online</span>
//                         </div>
//                     </h2>
//                 </header>

//                 <main className="flex-1 overflow-auto p-4">
//                 <div className="space-y-4">
//                     {messages.map((msg, index) => (
//                         <div
//                             key={msg.timestamp || index}
//                             className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
//                         >
//                             <div className={`rounded-lg p-2 max-w-xs ${msg.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
//                                 <p className="text-sm">{msg.message}</p>
//                                 <p className="text-xs text-gray-500">
//                                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                 </p>

//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </main>
//                 <footer className="border-t dark:border-zinc-700 p-4">
//                     <div className="flex items-center gap-2">
//                         <Button size="icon" variant="ghost">
//                             <SmileIcon className="w-6 h-6" />
//                         </Button>
//                         <Input
//                             className="flex-1"
//                             placeholder="Type a message..."
//                             value={message}
//                             onChange={(e) => setMessage(e.target.value)}
//                         />
//                         <Button onClick={sendMessage}>Send</Button>
//                     </div>
//                 </footer>
//             </section>
//         </div>
//     );

// }

// function SearchIcon(props) {
//     return (
//         <svg
//             {...props}
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//         >
//             <circle cx="11" cy="11" r="8" />
//             <path d="m21 21-4.3-4.3" />
//         </svg>
//     )
// }

// function SmileIcon(props) {
//     return (
//         <svg
//             {...props}
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//         >
//             <circle cx="12" cy="12" r="10" />
//             <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
//         </svg>
//     )
// }

import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { Input, Upload } from 'antd';
import { Card } from 'antd';
import { Avatar } from 'antd';
import { UserOutlined, SendOutlined, SearchOutlined, PaperClipOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../axiosConfig';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../contexts/ThemeContext';

export default function Chats() {
  const { roomName } = useParams();
  const { user } = useAuth();
  const { isFuturistic } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [fileList, setFileList] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const chatContainerRef = useRef(null);
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  // Determine if this is a team room
  const isTeamRoom = roomName && roomName.startsWith('team_');

  // Fetch room info
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        // For team rooms, no otherUser to fetch
        if (isTeamRoom) {
          setOtherUser(null);
          return;
        }
        const response = await axiosInstance.get(`chats/room-info/${roomName}/`);
        const otherUserId = response.data.participants.find((id) => id !== user.id);
        const otherUserResponse = await axiosInstance.get(`/auth/user/${otherUserId}/`);
        setOtherUser(otherUserResponse.data);
      } catch (error) {
        console.error('Error fetching room info:', error);
      }
    };

    if (user && roomName) {
      fetchRoomInfo();
    }
  }, [user, roomName, isTeamRoom]);

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    if (user && roomName) {
      fetchMessages();
    }
  }, [user, roomName]);

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (user && roomName) {
      try {
        const socketInstance = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);

        socketInstance.onopen = () => {
          // eslint-disable-next-line no-console
          console.log('WebSocket connection opened');
          setConnectionStatus('connected');
        };

        socketInstance.onerror = (error) => {
          // eslint-disable-next-line no-console
          console.log('WebSocket error:', error);
          setConnectionStatus('error');
        };

        socketInstance.onmessage = function (event) {
          const data = JSON.parse(event.data);
          // eslint-disable-next-line no-console
          console.log('Received message:', data);
          setMessages((prevMessages) => [...prevMessages, data]);
        };

        socketInstance.onclose = () => {
          // eslint-disable-next-line no-console
          console.log('WebSocket connection closed');
          setConnectionStatus('disconnected');
        };

        // Defer setting socket to avoid synchronous setState in effect
        setTimeout(() => setSocket(socketInstance), 0);

        return () => socketInstance.close();
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setTimeout(() => setConnectionStatus('error'), 0);
      }
    }
  }, [user, roomName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message - use WebSocket first, fallback to HTTP
  const sendMessage = async () => {
    if ((!message && fileList.length === 0) || !user) {
      return;
    }

    const tempMessage = {
      sender_id: user.id,
      message: message,
      timestamp: new Date().toISOString(),
      room: roomName,
      temp: true,
      attachments: fileList.map((f) => f.name),
    };

    // Add optimistic update
    setMessages((prev) => [...prev, tempMessage]);
    const currentMessage = message;
    const filesToUpload = fileList;
    setMessage('');
    setFileList([]);

    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const messageData = {
          message: currentMessage,
          room: roomName,
          sender_id: user.id,
        };
        socket.send(JSON.stringify(messageData));
      } else {
        // Fallback to HTTP if WebSocket not available
        const formData = new FormData();
        formData.append('message', currentMessage);
        formData.append('room', roomName);
        formData.append('sender_id', user.id);
        filesToUpload.forEach((file) => {
          formData.append('attachments', file);
        });

        const response = await axiosInstance.post('/chats/send-message/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Replace temp message with actual response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.temp
              ? {
                  sender_id: response.data.sender,
                  message: response.data.content,
                  timestamp: response.data.timestamp,
                  room: roomName,
                  attachments: response.data.attachments || [],
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on failure
      setMessages((prev) => prev.filter((msg) => !msg.temp));
    }
  };

  // Handle enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // File upload handlers
  const handleFileUpload = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      setFileList((prev) => [...prev, file]);
    }
  };

  const removeFile = (index) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  // Filter messages by search query
  const filteredMessages = searchQuery
    ? messages.filter((msg) => msg.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div
      style={{
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row',
        background: isFuturistic ? '#12121a' : '#f8fafc',
        marginTop: isSmallScreen ? '60px' : '0',
      }}
    >
      {/* Sidebar - Messages List */}
      <aside
        style={{
          width: isSmallScreen ? '100%' : '320px',
          borderRight: isSmallScreen ? 'none' : '1px solid #e2e8f0',
          borderBottom: isSmallScreen ? '1px solid #e2e8f0' : 'none',
          background: isFuturistic ? '#1a1a24' : '#ffffff',
          overflowY: 'auto',
          flexShrink: 0,
          display: isSmallScreen ? 'none' : 'block', // Hide sidebar on mobile for now
        }}
      >
        <div style={{ padding: '16px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '16px',
              color: isFuturistic ? '#f8fafc' : '#1e293b',
            }}
          >
            Messages
          </h2>

          <Input
            placeholder="Search messages..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: '16px', borderRadius: '8px' }}
          />

          <Card
            hoverable
            style={{
              borderRadius: '12px',
              marginBottom: '8px',
              background: isFuturistic ? '#252532' : '#f1f5f9',
              border: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar src={otherUser?.profile} icon={<UserOutlined />} size={40} />
              <div>
                <h3
                  style={{
                    fontWeight: 500,
                    margin: 0,
                    color: isFuturistic ? '#f8fafc' : '#1e293b',
                  }}
                >
                  {otherUser?.username || 'Loading...'}
                </h3>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0,
                  }}
                >
                  {messages.length > 0
                    ? messages[messages.length - 1]?.message?.substring(0, 30) + '...'
                    : 'Start conversation'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: isFuturistic ? '#12121a' : '#f8fafc',
        }}
      >
        {/* Chat Header */}
        <header
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: isFuturistic ? '#1a1a24' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Avatar src={otherUser?.profile} icon={<UserOutlined />} size={44} />
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                margin: 0,
                color: isFuturistic ? '#f8fafc' : '#1e293b',
              }}
            >
              {isTeamRoom ? 'Team Chat' : otherUser?.username || 'Loading...'}
            </h2>
            <span
              style={{
                fontSize: '12px',
                color: connectionStatus === 'connected' ? '#22c55e' : '#ef4444',
              }}
            >
              {connectionStatus === 'connected' ? 'Online' : 'Reconnecting...'}
            </span>
          </div>

          {/* Mobile Search Button */}
          {isSmallScreen && (
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            />
          )}
        </header>

        {/* Messages Container */}
        <main
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: isFuturistic ? '#12121a' : '#f8fafc',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMessages.map((msg, index) => (
                <div
                  key={msg.timestamp || index}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: isSmallScreen ? '80%' : '60%',
                      padding: '12px 16px',
                      borderRadius:
                        msg.sender_id === user.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background:
                        msg.sender_id === user.id
                          ? isFuturistic
                            ? '#6366f1'
                            : '#3b82f6'
                          : isFuturistic
                            ? '#252532'
                            : '#ffffff',
                      color:
                        msg.sender_id === user.id
                          ? '#ffffff'
                          : isFuturistic
                            ? '#f8fafc'
                            : '#1e293b',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>{msg.message}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div
                        style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}
                      >
                        {msg.attachments.map((att, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '12px',
                              padding: '2px 6px',
                              background: 'rgba(0,0,0,0.1)',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            📎 {att.name || att}
                          </span>
                        ))}
                      </div>
                    )}
                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '11px',
                        opacity: 0.7,
                        textAlign: 'right',
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Message Input */}
        <footer
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e2e8f0',
            background: isFuturistic ? '#1a1a24' : '#ffffff',
          }}
        >
          {/* File previews */}
          {fileList.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {fileList.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: isFuturistic ? '#252532' : '#f1f5f9',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span
                    style={{
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => removeFile(idx)}
                    style={{ padding: '2px 4px', minWidth: 'auto' }}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isSmallScreen ? '8px' : '12px',
            }}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileUpload}
              showUploadList={false}
              multiple
            >
              <Button
                type="text"
                icon={<PaperClipOutlined />}
                size="large"
                style={{ color: '#64748b' }}
              />
            </Upload>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              size="large"
              style={{
                flex: 1,
                borderRadius: '24px',
                padding: '8px 16px',
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              size="large"
              style={{
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isFuturistic ? '#6366f1' : '#3b82f6',
                border: 'none',
              }}
            />
          </div>
        </footer>
      </section>
    </div>
  );
}
