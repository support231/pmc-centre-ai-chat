import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './hooks/useAuth';
import ChatView from './components/ChatView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import AdminDashboard from './components/AdminDashboard';
import { LogoIcon } from './components/Icons';

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
                <div className="h-screen w-screen bg-pmc-light dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col">
                    <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <LogoIcon className="h-10 w-10 text-pmc-primary" />
                            <h1 className="text-xl font-bold text-pmc-primary dark:text-sky-400">PMC CENTRE AI</h1>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setAppView(appView === 'chat' ? 'admin' : 'chat')}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-pmc-accent text-white hover:bg-pmc-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
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
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
