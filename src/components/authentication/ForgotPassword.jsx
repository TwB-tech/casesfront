import React, { useState, useContext  } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useContext(AuthContext);
    const navigate = useNavigate(); 

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate password reset request logic
        try {
            await forgotPassword(email);
            message.success('Password reset link sent to your email!');
            setEmail('');
            setLoading(false);
            navigate('/password-reset-success');
        } catch (error) {
            console.error('Failed to send reset link:', error);
            message.error('Failed to send reset link!');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex" style={{ backgroundColor: '#F2E0D6FF' }}>
            <div className="container mx-auto my-auto relative flex flex-col w-11/12 sm:w-4/5 lg:w-1/2">
                <div className="text-6xl font-bold whitespace-pre-line text-center tracking-tighter mb-12">
                    Forgot Password
                </div>
                <motion.form 
                    onSubmit={handleSubmit} 
                    className="mt-12 w-full mx-auto rounded-3xl p-8"
                    style={{ backgroundColor: '#ebe9d8' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-bold mb-2">EMAIL</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            style={{ backgroundColor: '#e0cfc8' }}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button 
                            type="submit" 
                            className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </motion.form>
                <div className="mt-8 text-center">
                    <p>Remember your password? <a href="/login" className="font-bold text-black hover:text-gray-700">Sign In</a></p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
