import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Chat, Message } from '../types';
import { UserIcon, BotIcon, SearchIcon } from './Icons';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const AdminDashboard: React.FC = () => {
    const { getAllUsers, getUserChats } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userChats, setUserChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllUsers = useCallback(async () => {
        setIsLoading(true);
        const allUsers = await getAllUsers();
        setUsers(allUsers.filter(u => u.email !== 'admin@pmccentre.com'));
        setIsLoading(false);
    }, [getAllUsers]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    useEffect(() => {
        if (filteredUsers.length > 0) {
            const isSelectedUserInList = filteredUsers.some(u => u.id === selectedUser?.id);
            if (!isSelectedUserInList) {
                setSelectedUser(filteredUsers[0]);
            }
        } else {
            setSelectedUser(null);
        }
    }, [filteredUsers, selectedUser]);


    useEffect(() => {
        if (selectedUser) {
            getUserChats(selectedUser.id).then(chats => {
                setUserChats(chats);
                const isSelectedChatValid = chats.some(c => c.id === selectedChat?.id);
                if (!isSelectedChatValid) {
                    setSelectedChat(chats.length > 0 ? chats[0] : null);
                }
            });
        } else {
            setUserChats([]);
            setSelectedChat(null);
        }
    }, [selectedUser, getUserChats, selectedChat]);
    
    const userStats = useMemo(() => {
        // This is a simplified calculation. For a real backend, this would be an API call.
        const totalUsers = users.length;
        return { totalUsers };
    }, [users]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><p>Loading admin data...</p></div>;
    }

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900">
            {/* User List Panel */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Admin Dashboard</h2>
                     <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <span><span className="font-semibold">{userStats.totalUsers}</span> Users</span>
                    </div>
                    <div className="relative mt-4">
                        <input
                            type="text"
                            placeholder="Search user by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-8 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                        />
                        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>
                <ul className="overflow-y-auto flex-1">
                    {filteredUsers.map(user => (
                        <li key={user.id} onClick={() => setSelectedUser(user)}
                            className={`p-4 cursor-pointer border-l-4 ${selectedUser?.id === user.id ? 'border-pmc-accent bg-teal-50 dark:bg-pmc-accent/20' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{user.company}, {user.country}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat History Panel */}
            <div className="w-2/3 flex">
                {selectedUser ? (
                    <>
                        <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
                            <div className="p-4 sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                               <h3 className="font-bold">Conversations for</h3>
                               <p className="text-sm text-pmc-accent dark:text-teal-400">{selectedUser.name}</p>
                            </div>
                            {userChats.length > 0 ? (
                                userChats.map(chat => (
                                    <div key={chat.id} onClick={() => setSelectedChat(chat)}
                                        className={`p-3 cursor-pointer ${selectedChat?.id === chat.id ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    >
                                        <p className="font-medium truncate text-sm">{chat.title}</p>
                                        <p className="text-xs text-slate-500">{new Date(chat.createdAt).toLocaleString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-sm text-slate-500">No chats found for this user.</p>
                            )}
                        </div>
                        <div className="w-2/3 overflow-y-auto p-4">
                           {selectedChat ? (
                               selectedChat.messages.map((msg: Message) => (
                                   <div key={msg.id} className={`flex items-start gap-3 mb-4`}>
                                        {msg.role === 'model' ? 
                                            <BotIcon className="w-6 h-6 rounded-full bg-pmc-primary text-white p-1 flex-shrink-0" /> : 
                                            <UserIcon className="w-6 h-6 rounded-full bg-slate-500 text-white p-1 flex-shrink-0" />}
                                       <div className="flex flex-col">
                                           <div className={`w-fit max-w-full p-3 rounded-lg ${msg.role === 'user' ? 'bg-sky-100 dark:bg-sky-900/70' : 'bg-white dark:bg-slate-700'}`}>
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.text}</ReactMarkdown>
                                                </div>
                                           </div>
                                            <p className="text-xs text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                       </div>
                                   </div>
                               ))
                           ) : (
                               <div className="flex items-center justify-center h-full">
                                   <p className="text-slate-500">Select a conversation to view details.</p>
                               </div>
                           )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center w-full">
                        <p className="text-slate-500">{searchTerm ? 'No users match your search.' : 'Select a user to view their chat history.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;