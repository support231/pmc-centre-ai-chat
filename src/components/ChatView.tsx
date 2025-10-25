import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { getChatResponse } from '../services/geminiService.ts';
import { Chat, Message, Citation } from '../types.ts';
import { SendIcon, UserIcon, BotIcon, PlusIcon, LogoutIcon, CitationIcon } from './Icons.tsx';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const ChatView: React.FC = () => {
    const { user, logout, getUserChats, saveUserChat } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (user) {
            const userChats = getUserChats(user.id);
            setChats(userChats);
            if (userChats.length > 0) {
                setActiveChat(userChats[0]);
            } else {
                handleNewChat();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, getUserChats]);

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);

    const handleNewChat = () => {
        if (!user) return;
        const newChat: Chat = {
            id: `chat-${Date.now()}`,
            title: 'New Conversation',
            messages: [],
            userId: user.id,
            createdAt: Date.now(),
        };
        setActiveChat(newChat);
    };

    const handleSelectChat = (chat: Chat) => {
        setActiveChat(chat);
    };
    
    const updateChat = useCallback((updatedChat: Chat) => {
        setActiveChat(updatedChat);
        setChats(prevChats => {
            const existingChatIndex = prevChats.findIndex(c => c.id === updatedChat.id);
            let newChats;
            if (existingChatIndex > -1) {
                newChats = [...prevChats];
                newChats[existingChatIndex] = updatedChat;
            } else {
                newChats = [updatedChat, ...prevChats];
            }
            return newChats.sort((a,b) => b.createdAt - a.createdAt);
        });
        saveUserChat(updatedChat);
    }, [saveUserChat]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading || !user || !activeChat) return;

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            text: inputMessage,
            timestamp: Date.now(),
        };

        const updatedMessages = [...activeChat.messages, userMessage];
        const updatedChat = { ...activeChat, messages: updatedMessages };

        if (activeChat.messages.length === 0) {
            updatedChat.title = inputMessage.substring(0, 40) + (inputMessage.length > 40 ? '...' : '');
        }

        updateChat(updatedChat);
        setInputMessage('');
        setIsLoading(true);

        const history = activeChat.messages.map(m => ({ role: m.role, parts: m.text }));
        const { text, citations } = await getChatResponse(inputMessage, history);
        
        setIsLoading(false);

        const modelMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            role: 'model',
            text: text,
            citations: citations,
            timestamp: Date.now(),
        };
        
        const finalChat = { ...updatedChat, messages: [...updatedMessages, modelMessage] };
        updateChat(finalChat);
    };

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-100 dark:bg-slate-800 flex flex-col p-2">
                <button
                    onClick={handleNewChat}
                    className="flex items-center justify-center gap-2 w-full p-3 mb-4 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    New Chat
                </button>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => handleSelectChat(chat)}
                            className={`p-3 my-1 rounded-lg cursor-pointer truncate ${activeChat?.id === chat.id ? 'bg-sky-100 dark:bg-sky-900 font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            {chat.title}
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user?.name}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <LogoutIcon className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                    {activeChat && activeChat.messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-pmc-blue flex-shrink-0 flex items-center justify-center">
                                    <BotIcon className="h-5 w-5 text-white" />
                                </div>
                            )}
                            <div className={`max-w-2xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 rounded-bl-none'}`}>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                     <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.text}</ReactMarkdown>
                                </div>
                                {msg.citations && msg.citations.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-slate-300 dark:border-slate-600">
                                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <CitationIcon className="h-4 w-4"/>
                                            Sources
                                        </h4>
                                        <ol className="text-xs list-decimal list-inside space-y-1">
                                            {msg.citations.map((citation: Citation, index: number) => (
                                                <li key={index}>
                                                    <a href={citation.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">
                                                        {citation.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                             {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-500 flex-shrink-0 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4 mb-6">
                             <div className="w-8 h-8 rounded-full bg-pmc-blue flex-shrink-0 flex items-center justify-center">
                                <BotIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="max-w-2xl p-4 rounded-2xl bg-white dark:bg-slate-700 rounded-bl-none flex items-center gap-2">
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-2">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Ask a technical question about PMC..."
                            className="flex-1 bg-transparent focus:outline-none resize-none p-2"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !inputMessage.trim()} className="p-2 rounded-lg bg-sky-600 text-white disabled:bg-slate-400 disabled:cursor-not-allowed">
                            <SendIcon className="h-6 w-6" />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ChatView;
