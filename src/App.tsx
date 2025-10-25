import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth.ts';
import { AuthProvider } from './components/AuthProvider.tsx';
import ChatView from './components/ChatView.tsx';
import LoginView from './components/LoginView.tsx';
import RegisterView from './components/RegisterView.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { LogoIcon } from './components/Icons.tsx';
import ApiKeyPrompt from './components/ApiKeyPrompt.tsx';

// FIX: Replaced inline type for `window.aistudio` with a named `AIStudio` interface to resolve declaration conflicts, as suggested by the TypeScript error message. This ensures type compatibility with other potential declarations of `aistudio` in the global scope.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio: AIStudio;
    }
}


type View = 'login' | 'register' | 'app' | 'admin';

const AppContent: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [view, setView] = useState<View>('login');
    const [appView, setAppView] = useState<'chat' | 'admin'>('chat');

    useEffect(() => {
        if (user) {
            setView('app');
            setAppView('chat');
        } else {
            setView('login');
        }
    }, [user]);

    const renderContent = () => {
        if (view === 'login') {
            return <LoginView onSwitchToRegister={() => setView('register')} />;
        }
        if (view === 'register') {
            return <RegisterView onSwitchToLogin={() => setView('login')} />;
        }
        if (view === 'app' && user) {
            return (
                <div className="h-screen w-screen bg-pmc-gray dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col">
                    <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <LogoIcon className="h-8 w-8 text-pmc-blue" />
                            <h1 className="text-xl font-bold text-pmc-blue dark:text-sky-400">PMC CENTRE AI</h1>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setAppView(appView === 'chat' ? 'admin' : 'chat')}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            >
                                {appView === 'chat' ? 'Admin Dashboard' : 'Go to Chat'}
                            </button>
                        )}
                    </header>
                    <main className="flex-1 overflow-hidden">
                        {appView === 'chat' ? <ChatView /> : <AdminDashboard />}
                    </main>
                </div>
            );
        }
        return <LoginView onSwitchToRegister={() => setView('register')} />;
    };

    return <div className="h-screen w-screen">{renderContent()}</div>;
};

const App: React.FC = () => {
    const [apiKeyStatus, setApiKeyStatus] = useState<'loading' | 'ready' | 'needed'>('loading');

    useEffect(() => {
        // Check if an API key has been selected when the app loads.
        const checkKey = async () => {
            try {
                // The window.aistudio object is provided by the execution environment.
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeyStatus(hasKey ? 'ready' : 'needed');
            } catch (error) {
                console.error("Could not check for API key, assuming it's needed.", error);
                setApiKeyStatus('needed'); // Fallback if aistudio fails
            }
        };

        checkKey();

        // Listen for events indicating the API key has become invalid.
        const handleInvalidKey = () => setApiKeyStatus('needed');
        window.addEventListener('invalidApiKey', handleInvalidKey);

        return () => {
            window.removeEventListener('invalidApiKey', handleInvalidKey);
        };
    }, []);

    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            setApiKeyStatus('ready'); // Optimistically assume key selection was successful.
        } catch (error) {
            console.error("Failed to open API key selection:", error);
        }
    };
    
    // Show a loading indicator while checking for the key.
    if (apiKeyStatus === 'loading') {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-pmc-gray dark:bg-slate-900">
                <LogoIcon className="h-16 w-16 text-pmc-blue animate-pulse" />
            </div>
        );
    }

    // If the key is needed, show the prompt.
    if (apiKeyStatus === 'needed') {
        return <ApiKeyPrompt onSelectKey={handleSelectKey} />;
    }
    
    // Once the key is ready, render the main application.
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
