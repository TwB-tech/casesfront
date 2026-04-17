import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../axiosConfig';

export default function UserList() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!user?.role) {
          return;
        }
        if (user.role === 'advocate') {
          // Fetch clients for advocates
          const clientsResponse = await axiosInstance.get('/client/');
          setClients(clientsResponse.data.results);

          // Fetch other advocates for advocates
          const advocatesResponse = await axiosInstance.get('/advocate/firm-advocates/');
          setAdvocates(advocatesResponse.data);
        } else if (user.role === 'client' || user.role === 'individual') {
          // Fetch advocates for clients or individuals
          const advocatesResponse = await axiosInstance.get('/individual/case-advocates/');
          setAdvocates(advocatesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [user]);

  const startChat = async (otherUserId) => {
    try {
      const response = await axiosInstance.post('/chats/create-or-get-chat-room/', {
        user_id: user.id,
        other_user_id: otherUserId,
      });
      const roomName = response.data.room_name;
      // Navigate to the chat room
      navigate(`/chat/${roomName}`);
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Start a Chat</h2>
      <ul className="space-y-4">
        {/* Display Clients for Advocates */}
        {user.role === 'advocate' && clients.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Clients</h3>
            {clients.map((client) => (
              <li
                key={client.id}
                className="border dark:border-zinc-700 p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {client.username}
                  </span>
                  <button
                    onClick={() => startChat(client.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Chat
                  </button>
                </div>
              </li>
            ))}
          </>
        )}

        {/* Display Advocates for Advocates, Clients, and Individuals */}
        {advocates.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Advocates</h3>
            {advocates.map((advocate) => (
              <li
                key={advocate.id}
                className="border dark:border-zinc-700 p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {advocate.username}
                  </span>
                  <button
                    onClick={() => startChat(advocate.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Chat
                  </button>
                </div>
              </li>
            ))}
          </>
        )}

        {/* Team Chat for Organization Members */}
        {user?.organization_id && (
          <div className="border dark:border-zinc-700 p-4 rounded-lg hover:bg-purple-50 dark:hover:bg-zinc-700 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Team Chat</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chat with your entire organization
                </p>
              </div>
              <button
                onClick={() => navigate(`/chat/team_${user.organization_id}`)}
                className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Open Team Room
              </button>
            </div>
          </div>
        )}
      </ul>
    </div>
  );
}
