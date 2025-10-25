import { createContext, useContext } from 'react';
import { User, Chat } from '../types';

export interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    login: (email: string) => Promise<User | null>;
    register: (userData: Omit<User, 'id'>) => Promise<User | null>;
    logout: () => void;
    getAllUsers: () => User[];
    getUserChats: (userId: string) => Chat[];
    saveUserChat: (chat: Chat) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
