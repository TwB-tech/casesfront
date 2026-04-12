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
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import useAuth from '../hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import axiosInstance from '../axiosConfig';

export default function Chats() {
    const { roomName } = useParams();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    // Reference for the chat container
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const response = await axiosInstance.get(`chats/room-info/${roomName}/`);
                const otherUserId = response.data.participants.find(id => id !== user.id);
                const otherUserResponse = await axiosInstance.get(`/auth/user/${otherUserId}/`);
                setOtherUser(otherUserResponse.data);
            } catch (error) {
                console.error('Error fetching room info:', error);
            }
        };

        if (user && roomName) {
            fetchRoomInfo();
        } else {
            console.log('No user or room name');
        }
    }, [user, roomName]);

    // Fetch previous messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const messagesResponse = await axiosInstance.get(`chats/get-messages/${roomName}/`);
                const formattedMessages = messagesResponse.data.map(msg => ({
                    sender_id: msg.sender,
                    message: msg.content,
                    timestamp: msg.timestamp,
                    room: roomName
                }));
                setMessages(formattedMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        if (user && roomName) {
            fetchMessages();
        }
    }, [user, roomName]);

    // Scroll to the last message whenever messages update
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!message || !user) {
            return;
        }

        try {
            const response = await axiosInstance.post('/chats/send-message/', {
                message,
                room: roomName,
                sender_id: user.id,
            });
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender_id: response.data.sender,
                    message: response.data.content,
                    timestamp: response.data.timestamp,
                    room: roomName,
                },
            ]);
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div key="1" className="flex h-screen bg-white dark:bg-zinc-800 mt-10">
            <aside className="w-80 border-r dark:border-zinc-700">
                <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Messages</h2>
                    </div>
                    <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        <Input className="pl-8" placeholder="Search messages..." type="search" />
                        <Button className="absolute right-2.5 top-3" size="icon" variant="ghost" />
                    </div>
                    <div className="space-y-2">
                        <Card className="p-2">
                            <CardContent>
                                <h3 className="font-semibold">{otherUser && otherUser.username ? otherUser.username : 'Loading...'}</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Last message...</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </aside>
            <section className="flex flex-col w-full">
                <header className="border-b dark:border-zinc-700 p-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Avatar className="relative overflow-visible w-10 h-10">
                            <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                            {otherUser && otherUser.username ? otherUser.username : 'Loading...'}
                            <span className="text-xs text-green-600 block">Online</span>
                        </div>
                    </h2>
                </header>
               
                <main ref={chatContainerRef} className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={msg.timestamp || index}
                                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`rounded-lg p-2 max-w-xs ${msg.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <footer className="border-t dark:border-zinc-700 p-4">
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost">
                            <SmileIcon className="w-6 h-6" />
                        </Button>
                        <Input
                            className="flex-1"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button onClick={sendMessage}>Send</Button>
                    </div>
                </footer>
            </section>
        </div>
    );
}

function SearchIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}

function SmileIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
        </svg>
    )
}

