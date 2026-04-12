import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'; // Ant Design icons for eye toggle

function SignIn() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const { login } = useContext(AuthContext);
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
        try {
            await login(formData.email, formData.password);
            message.success('Login successful!');
            setLoading(false);
            navigate('/home');
        } catch (error) {
            console.error('Login failed:', error);
            message.error('Login failed!');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex" style={{ backgroundColor: '#F2E0D6FF' }}>
            <div className="container mx-auto my-auto relative flex flex-col w-11/12 sm:w-4/5 lg:w-1/2">
                <div className="text-6xl font-bold whitespace-pre-line text-center tracking-tighter mb-12">
                    Sign In
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
                            value={formData.email}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            style={{ backgroundColor: '#e0cfc8' }}
                            required
                        />
                    </div>
                    <div className="mb-6 relative">
                        <label htmlFor="password" className="block text-sm font-bold mb-2">PASSWORD</label>
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
                    <div className="flex items-center justify-between">
                        <button 
                            type="submit" 
                            className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>
                        <a href="/forgot-password" className="inline-block align-baseline font-bold text-sm text-black hover:text-gray-700">
                            Forgot Password?
                        </a>
                    </div>
                </motion.form>
                <div className="mt-8 text-center">
                    <p>Don't have an account? <a href="/signup" className="font-bold text-black hover:text-gray-700">Sign Up</a></p>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
