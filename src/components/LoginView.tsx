import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { LogoIcon } from './Icons.tsx';

interface LoginViewProps {
    onSwitchToRegister: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const user = await login(email);
        if (!user) {
            setError('User not found. Please check your email or register.');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pmc-gray dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                <div className="flex flex-col items-center mb-6">
                    <LogoIcon className="h-16 w-16 text-pmc-blue mb-2" />
                    <h1 className="text-2xl font-bold text-pmc-blue dark:text-sky-400">Welcome Back</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Log in to the PMC CENTRE AI Chat</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-sky-600 text-white p-3 rounded-md font-semibold hover:bg-sky-700 disabled:bg-sky-400 transition-colors"
                    >
                        {isLoading ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToRegister} className="font-medium text-sky-600 hover:underline">
                        Register for Beta
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginView;
