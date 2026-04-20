import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function RegisterSuccess() {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: '/register-success' } });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #512DA8 0%, #C2185B 100%)',
        marginTop: '120px',
      }}
    >
      <Result
        status="success"
        title="Registration Successful"
        subTitle="A verification email has been sent to your email address. Please check your inbox and click the verification link to activate your account."
        extra={[
          <Button type="primary" key="login" onClick={handleLoginRedirect}>
            Go to Login
          </Button>,
        ]}
        style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
}

export default RegisterSuccess;
