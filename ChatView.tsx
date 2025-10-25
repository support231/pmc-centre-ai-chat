import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getChatResponse } from '../services/geminiService';
import { Message, Citation } from '../types';
import { BotIcon, UserIcon, SendIcon, PlusIcon, CitationIcon, LogoIcon } from './Icons';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const ChatView: React.FC = () => {
    const { chats, activeChat, setActiveChatId, createNewChat, addMessageToChat, updateChatTitle } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        let currentChatId = activeChat?.id;

        // If there's no active chat, create a new one
        if (!currentChatId) {
            const newChat = await createNewChat();
            currentChatId = newChat.id;
        }

        if (!currentChatId) return;

        const userMessage: Omit<Message, 'id' | 'timestamp'> = {
            role: 'user',
            text: prompt,
        };

        const currentPrompt = prompt;
        setPrompt('');
        await addMessageToChat(currentChatId, userMessage);
        setIsLoading(true);

        try {
            // Prepare history for Gemini API
            const history = (activeChat?.messages ?? []).map(msg => ({
                role: msg.role,
                parts: msg.text
            }));
            
            // We pass the current prompt, not the one from the state which is already cleared
            const { text: modelResponse, citations } = await getChatResponse(currentPrompt, history);

            const modelMessage: Omit<Message, 'id'|'timestamp'> = {
                role: 'model',
                text: modelResponse,
                citations: citations,
            };

            await addMessageToChat(currentChatId, modelMessage);
            
            // If it's the first user message, set the chat title
            if (activeChat?.messages.length === 1) {
                const title = currentPrompt.substring(0, 30) + (currentPrompt.length > 30 ? '...' : '');
                await updateChatTitle(currentChatId, title);
            }

        } catch (error) {
            console.error("Failed to get response from Gemini:", error);
            const errorMessage: Omit<Message, 'id' | 'timestamp'> = {
                role: 'model',
                text: 'Sorry, I ran into a problem. Please try again.',
            };
            await addMessageToChat(currentChatId, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full">
            {/* Chat History Sidebar */}
            <div className="w-1/4 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={createNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        New Chat
                    </button>
                </div>
                <ul className="overflow-y-auto flex-1">
                    {chats.map(chat => (
                        <li key={chat.id} onClick={() => setActiveChatId(chat.id)}
                            className={`p-3 cursor-pointer text-sm truncate border-l-4 ${activeChat?.id === chat.id ? 'border-pmc-accent bg-teal-50 dark:bg-pmc-accent/20 font-semibold' : 'border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            {chat.title}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Chat Area */}
            <div className="w-3/4 flex flex-col bg-slate-50 dark:bg-slate-900">
                <div className="flex-1 overflow-y-auto p-6">
                    {activeChat && activeChat.messages.length > 0 ? (
                        activeChat.messages.map((msg) => (
                           <div key={msg.id} className={`flex items-start gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && 
                                    <BotIcon className="w-8 h-8 rounded-full bg-pmc-primary text-white p-1.5 flex-shrink-0 mt-1" />
                                }
                               <div className={`flex flex-col w-full max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                   <div className={`w-fit max-w-full p-4 rounded-lg ${msg.role === 'user' ? 'bg-sky-100 dark:bg-sky-900/70' : 'bg-white dark:bg-slate-700 shadow-sm'}`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.text}</ReactMarkdown>
                                        </div>
                                   </div>
                                    {msg.citations && msg.citations.length > 0 && (
                                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            <h4 className="font-semibold flex items-center gap-1.5 mb-1"><CitationIcon className="w-3 h-3"/> Sources:</h4>
                                            <ol className="list-decimal list-inside space-y-1">
                                                {msg.citations.map((citation, index) => (
                                                    <li key={index}>
                                                        <a href={citation.uri} target="_blank" rel="noopener noreferrer" className="text-pmc-accent hover:underline">{citation.title}</a>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                               </div>
                               {msg.role === 'user' && 
                                    <UserIcon className="w-8 h-8 rounded-full bg-slate-500 text-white p-1.5 flex-shrink-0 mt-1" />
                               }
                           </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <LogoIcon className="h-24 w-24 text-slate-300 dark:text-slate-600" />
                            <h2 className="mt-4 text-2xl font-semibold text-slate-600 dark:text-slate-400">PMC CENTRE AI</h2>
                            <p className="mt-2 text-slate-500">Start a new conversation or select one from the side.</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto w-full">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Ask me anything about Paper Machine Clothing..."
                            className="w-full p-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-pmc-accent hover:bg-pmc-accent-dark disabled:bg-teal-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 
                                <SendIcon className="w-5 h-5" />
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatView;
