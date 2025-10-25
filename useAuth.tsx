import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Chat, Message } from '../types';
import * as api from '../services/apiService';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string) => Promise<User | null>;
  logout: () => void;
  register: (userData: Omit<User, 'id'>) => Promise<User | null>;
  // Admin functions
  getAllUsers: () => Promise<User[]>;
  getUserChats: (userId: string) => Promise<Chat[]>;
  // Chat functions for logged in user
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChatId: (chatId: string | null) => void;
  createNewChat: () => Promise<Chat>;
  addMessageToChat: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // To handle initial auth check

  // This effect can be used later to check for a session token
  useEffect(() => {
    // For now, we start with no user logged in.
    setIsInitializing(false);
  }, []);

  const refreshUserChats = useCallback(async (userId: string) => {
    const chats = await api.apiGetUserChats(userId);
    setUserChats(chats);
    return chats;
  }, []);

  const login = async (email: string): Promise<User | null> => {
    const user = await api.apiLogin(email);
    if (user) {
      setCurrentUser(user);
      const chats = await refreshUserChats(user.id);
      setActiveChatId(chats.length > 0 ? chats[0].id : null);
    }
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    setUserChats([]);
    setActiveChatId(null);
  };

  const register = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    const newUser = await api.apiRegister(userData);
    if (newUser) {
      setCurrentUser(newUser);
      setUserChats([]);
      setActiveChatId(null);
    }
    return newUser;
  };

  const getAllUsers = async () => api.apiGetAllUsers();
  const getUserChats = async (userId: string) => api.apiGetUserChats(userId);

  const activeChat = activeChatId ? userChats.find(c => c.id === activeChatId) || null : null;

  const createNewChat = async (): Promise<Chat> => {
    if (!currentUser) throw new Error("No user logged in");
    const newChat = await api.apiCreateNewChat(currentUser.id);
    await refreshUserChats(currentUser.id);
    setActiveChatId(newChat.id);
    return newChat;
  };

  const addMessageToChat = async (chatId: string, messageData: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentUser) throw new Error("No user logged in");
    await api.apiAddMessageToChat(chatId, messageData);
    await refreshUserChats(currentUser.id);
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    if (!currentUser) throw new Error("No user logged in");
    await api.apiUpdateChatTitle(chatId, title);
    await refreshUserChats(currentUser.id);
  };

  const value: AuthContextType = {
    user: currentUser,
    isAdmin: currentUser?.email === 'admin@pmccentre.com',
    login,
    logout,
    register,
    getAllUsers,
    getUserChats,
    chats: userChats,
    activeChat,
    setActiveChatId,
    createNewChat,
    addMessageToChat,
    updateChatTitle,
    isInitializing,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};