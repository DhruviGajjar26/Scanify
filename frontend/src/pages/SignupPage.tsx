import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const SignupPage: React.FC = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', {fullName, email, password });
            navigate('/login');
               alert("Account created successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">
            <form onSubmit={handleSubmit} className="bg-[#121216] p-10 rounded-2xl border border-[#1c1c21] w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8">Create New Account</h1>
               <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter Full Name"
                    className="w-full p-3 mb-4 rounded-lg bg-[#1c1c21]"
                    required
                />
                <input type="email" onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full p-3 mb-4 rounded-lg bg-[#1c1c21]" />
                <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 mb-6 rounded-lg bg-[#1c1c21]" />
                <button type="submit" className="w-full p-3 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9]">Sign Up</button>
          <p className="text-center text-text-secondary text-sm mt-8">
                    Don't have an account?{' '}
                    <a href="/login" className="text-primary hover:underline">
                        Log In 
                    </a>
                </p>
            </form>
              
        </div>
    );
};

export default SignupPage;