// services/apiService.ts

import { User, Chat, Message } from '../types';

/**
 * This service acts as a mock backend, using localStorage for persistence.
 * All functions are async to simulate real API calls.
 * To switch to a real backend, you would only need to change the implementation of these functions.
 */

const USERS_STORAGE_KEY = 'pmc_chat_users';
const CHATS_STORAGE_KEY = 'pmc_chat_chats';

// --- Helper Functions ---

const readUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [
      { id: 'admin-user', name: 'Admin', email: 'admin@pmccentre.com', company: 'PMC Centre', country: 'Global' },
      { id: 'user-1', name: 'John Doe', email: 'john@example.com', company: 'Paper Mill Inc.', country: 'USA' },
    ];
  } catch (e) {
    console.error('Failed to parse users from localStorage', e);
    return [];
  }
};

const writeUsers = (users: User[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};

const readChats = (): Chat[] => {
  try {
    const stored = localStorage.getItem(CHATS_STORAGE_KEY);
     return stored ? JSON.parse(stored) : [
        {
            id: 'chat-1',
            title: 'Dryer Fabric Inquiry',
            messages: [
                { id: 'msg-1', role: 'user', text: 'What are the benefits of using spiral dryer fabrics?', timestamp: Date.now() - 200000 },
                { id: 'msg-2', role: 'model', text: 'Spiral dryer fabrics offer excellent ventilation and stability.', timestamp: Date.now() - 100000, citations: [] }
            ],
            userId: 'user-1',
            createdAt: Date.now() - 200000
        }
    ];
  } catch (e) {
    console.error('Failed to parse chats from localStorage', e);
    return [];
  }
};

const writeChats = (chats: Chat[]) => {
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error('Failed to save chats to localStorage', e);
  }
};


// --- API Functions ---

export const apiLogin = async (email: string): Promise<User | null> => {
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
};

export const apiRegister = async (userData: Omit<User, 'id'>): Promise<User | null> => {
  const users = readUsers();
  if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    return null; // User already exists
  }
  const newUser: User = { ...userData, id: `user-${Date.now()}` };
  writeUsers([...users, newUser]);
  return newUser;
};

export const apiGetAllUsers = async (): Promise<User[]> => {
    return readUsers();
};

export const apiGetUserChats = async (userId: string): Promise<Chat[]> => {
    const allChats = readChats();
    return allChats.filter(c => c.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
};

export const apiCreateNewChat = async (userId: string): Promise<Chat> => {
    const newChat: Chat = {
        id: `chat-${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        userId: userId,
        createdAt: Date.now()
    };
    const allChats = readChats();
    writeChats([newChat, ...allChats]);
    return newChat;
};

export const apiAddMessageToChat = async (chatId: string, messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Chat> => {
    const allChats = readChats();
    let updatedChat: Chat | undefined;
    const updatedChats = allChats.map(chat => {
        if (chat.id === chatId) {
            const newMessage: Message = { ...messageData, id: `msg-${Date.now()}`, timestamp: Date.now() };
            updatedChat = { ...chat, messages: [...chat.messages, newMessage] };
            return updatedChat;
        }
        return chat;
    });

    if (!updatedChat) {
        throw new Error("Chat not found");
    }

    writeChats(updatedChats);
    return updatedChat;
};

export const apiUpdateChatTitle = async (chatId: string, title: string): Promise<Chat> => {
    const allChats = readChats();
    let updatedChat: Chat | undefined;
    const updatedChats = allChats.map(chat => {
        if (chat.id === chatId) {
            updatedChat = { ...chat, title };
            return updatedChat;
        }
        return chat;
    });

    if (!updatedChat) {
        throw new Error("Chat not found");
    }
    
    writeChats(updatedChats);
    return updatedChat;
};
