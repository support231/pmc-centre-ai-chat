import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogoIcon } from './Icons';

interface RegisterViewProps {
    onSwitchToLogin: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [country, setCountry] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        if (!name || !email || !company || !country) {
            setError('All fields are required.');
            setIsLoading(false);
            return;
        }

        const newUser = await register({ name, email, company, country });
        if (!newUser) {
            setError('An account with this email already exists.');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pmc-light dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                <div className="flex flex-col items-center mb-6">
                    <LogoIcon className="h-16 w-16 text-pmc-primary mb-2" />
                    <h1 className="text-2xl font-bold text-pmc-primary dark:text-sky-400">Create Your Account</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Join the PMC CENTRE AI Chat Beta</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Full Name" id="name" type="text" value={name} onChange={setName} required />
                    <InputField label="Email" id="email" type="email" value={email} onChange={setEmail} required />
                    <InputField label="Company Name" id="company" type="text" value={company} onChange={setCompany} required />
                    <InputField label="Country" id="country" type="text" value={country} onChange={setCountry} required />

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-pmc-accent text-white p-3 rounded-md font-semibold hover:bg-pmc-accent-dark disabled:bg-teal-400 transition-colors"
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-pmc-accent hover:underline">
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

interface InputFieldProps {
    label: string;
    id: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, type, value, onChange, required }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            required={required}
        />
    </div>
);


export default RegisterView;
