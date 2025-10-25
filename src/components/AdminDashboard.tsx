import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { User, Chat, Message } from '../types.ts';
import { UserIcon, BotIcon } from './Icons.tsx';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const AdminDashboard: React.FC = () => {
    const { getAllUsers, getUserChats } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userChats, setUserChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    useEffect(() => {
        const allUsers = getAllUsers().filter(u => u.email !== 'admin@pmccentre.com');
        setUsers(allUsers);
        if (allUsers.length > 0) {
            setSelectedUser(allUsers[0]);
        }
    }, [getAllUsers]);

    useEffect(() => {
        if (selectedUser) {
            const chats = getUserChats(selectedUser.id);
            setUserChats(chats);
            setSelectedChat(chats.length > 0 ? chats[0] : null);
        } else {
            setUserChats([]);
            setSelectedChat(null);
        }
    }, [selectedUser, getUserChats]);

    const userStats = useMemo(() => {
        const totalUsers = users.length;
        const totalChats = users.reduce((acc, user) => acc + getUserChats(user.id).length, 0);
        return { totalUsers, totalChats };
    }, [users, getUserChats]);

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900">
            {/* User List Panel */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Admin Dashboard</h2>
                    <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <span><span className="font-semibold">{userStats.totalUsers}</span> Users</span>
                        <span><span className="font-semibold">{userStats.totalChats}</span> Chats</span>
                    </div>
                </div>
                <ul className="overflow-y-auto flex-1">
                    {users.map(user => (
                        <li key={user.id} onClick={() => setSelectedUser(user)}
                            className={`p-4 cursor-pointer border-l-4 ${selectedUser?.id === user.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
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
                               <p className="text-sm text-sky-600 dark:text-sky-400">{selectedUser.name}</p>
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
                                            <BotIcon className="w-6 h-6 rounded-full bg-pmc-blue text-white p-1 flex-shrink-0" /> : 
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
                        <p className="text-slate-500">Select a user to view their chat history.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
