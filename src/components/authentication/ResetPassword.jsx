import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'; // Ant Design icons for eye toggle

function ResetPassword() {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
    const { resetPassword } = useContext(AuthContext);
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate password reset logic
        if (formData.password !== formData.confirmPassword) {
            message.error('Passwords do not match!');
            setLoading(false);
            return;
        }

        try {
           await resetPassword(formData.password);
            message.success('Password successfully reset!');
            navigate('/login');
            setLoading(false);
        } catch (error) {
            console.error('Password reset failed:', error);
            message.error('Password reset failed!');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex" style={{ backgroundColor: '#F2E0D6FF' }}>
            <div className="container mx-auto my-auto relative flex flex-col w-11/12 sm:w-4/5 lg:w-1/2">
                <div className="text-6xl font-bold whitespace-pre-line text-center tracking-tighter mb-12">
                    Reset Password
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
                    <div className="mb-6 relative">
                        <label htmlFor="password" className="block text-sm font-bold mb-2">NEW PASSWORD</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                style={{ backgroundColor: '#e0cfc8' }}
                                required
                            />
                            <span 
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            </span>
                        </div>
                    </div>
                    <div className="mb-6 relative">
                        <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2">CONFIRM PASSWORD</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                style={{ backgroundColor: '#e0cfc8' }}
                                required
                            />
                            <span 
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button 
                            type="submit" 
                            className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}

export default ResetPassword;
