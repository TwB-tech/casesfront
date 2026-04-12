import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PasswordResetSuccess() {
    const [counter, setCounter] = useState(30);  // Initialize countdown
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCounter((prevCounter) => prevCounter - 1);
        }, 1000);

        // Redirect to login when counter reaches 0
        if (counter === 0) {
            navigate('/login');
        }

        // Cleanup the interval timer when the component unmounts
        return () => clearInterval(timer);
    }, [counter, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-100">
            <h1 className="text-4xl font-bold mb-4">Success!</h1>
            <p className="text-lg mb-6">A password reset link has been sent to your email address.</p>
            <p className="text-lg mb-6">You will be redirected to the login page in {counter} seconds.</p>
            <button
                onClick={() => navigate('/login')}
                className="bg-black text-white py-2 px-4 rounded hover:bg-gray-700"
            >
                Go to Login
            </button>
        </div>
    );
}

export default PasswordResetSuccess;
