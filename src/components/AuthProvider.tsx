import React, { useState, useEffect, useCallback } from 'react';
import { User, Chat } from '../types';
import { AuthContext, AuthContextType } from '../hooks/useAuth';

// Mock DB keys
const USERS_DB_KEY = 'pmc_users_db';
const CHATS_DB_KEY = 'pmc_chats_db';
const LOGGED_IN_USER_KEY = 'pmc_logged_in_user';

// --- Helper Functions to simulate DB ---
const getMockDb = <T,>(key: string): T[] => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return [];
    }
};

const setMockDb = <T,>(key: string, data: T[]): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
    }
};

const ADMIN_EMAIL = 'admin@pmccentre.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    
    useEffect(() => {
        // Create admin user if not exists
        const users = getMockDb<User>(USERS_DB_KEY);
        if (!users.find(u => u.email === ADMIN_EMAIL)) {
            users.push({
                id: 'admin-user',
                name: 'PMC Admin',
                email: ADMIN_EMAIL,
                company: 'PMC CENTRE',
                country: 'Global'
            });
            setMockDb(USERS_DB_KEY, users);
        }

        const loggedInUserEmail = localStorage.getItem(LOGGED_IN_USER_KEY);
        if (loggedInUserEmail) {
            const allUsers = getMockDb<User>(USERS_DB_KEY);
            const loggedInUser = allUsers.find(u => u.email === loggedInUserEmail);
            if (loggedInUser) {
                setUser(loggedInUser);
                setIsAdmin(loggedInUser.email === ADMIN_EMAIL);
            }
        }
    }, []);

    const login = useCallback(async (email: string): Promise<User | null> => {
        const users = getMockDb<User>(USERS_DB_KEY);
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
            setUser(foundUser);
            setIsAdmin(foundUser.email === ADMIN_EMAIL);
            localStorage.setItem(LOGGED_IN_USER_KEY, foundUser.email);
            return foundUser;
        }
        return null;
    }, []);

    const register = useCallback(async (userData: Omit<User, 'id'>): Promise<User | null> => {
        const users = getMockDb<User>(USERS_DB_KEY);
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return null; // User already exists
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...userData
        };
        users.push(newUser);
        setMockDb(USERS_DB_KEY, users);
        setUser(newUser);
        setIsAdmin(false);
        localStorage.setItem(LOGGED_IN_USER_KEY, newUser.email);
        return newUser;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem(LOGGED_IN_USER_KEY);
    }, []);

    const getAllUsers = useCallback((): User[] => {
        return getMockDb<User>(USERS_DB_KEY);
    }, []);

    const getUserChats = useCallback((userId: string): Chat[] => {
        const allChats = getMockDb<Chat>(CHATS_DB_KEY);
        return allChats.filter(chat => chat.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    }, []);

    const saveUserChat = useCallback((chatToSave: Chat): void => {
        const allChats = getMockDb<Chat>(CHATS_DB_KEY);
        const existingChatIndex = allChats.findIndex(c => c.id === chatToSave.id);
        if (existingChatIndex > -1) {
            allChats[existingChatIndex] = chatToSave;
        } else {
            allChats.push(chatToSave);
        }
        setMockDb(CHATS_DB_KEY, allChats);
    }, []);

    const value: AuthContextType = { user, isAdmin, login, register, logout, getAllUsers, getUserChats, saveUserChat };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
