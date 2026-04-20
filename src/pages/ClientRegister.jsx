import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailOutlined, LockOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axiosInstance from '../axiosConfig';

const { Title, Text } = Typography;

function ClientRegister() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [inviteType, setInviteType] = useState('client');

  useEffect(() => {
    if (token) {
      const type = token.startsWith('emp-') || token.startsWith('secure-') ? 'employee' : 'client';
      setInviteType(type);
    }
  }, [token]);

  const onFinish = async (values) => {
    if (!token) {
      message.error('Invalid invitation. Please contact your advocate for a new invitation.');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/clients/register/', {
        token,
        password: values.password,
        name: values.name,
      });
      if (response.data?.id) {
        message.success('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Failed to create account';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
        <Card className="max-w-md w-full shadow-xl" style={{ borderRadius: 16 }}>
          <div className="text-center py-8">
            <Title level={3} className="text-red-500">Invalid Invitation</Title>
            <Text>This invitation link is invalid or has expired.</Text>
            <div className="mt-6">
              <Button type="primary" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <Card className="max-w-md w-full shadow-xl" style={{ borderRadius: 16 }}>
        <div className="text-center mb-6">
          <div className="mb-4">
            <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WakiliWorld
            </span>
          </div>
          <Title level={3} className="mb-2">Accept Your Invitation</Title>
          <Text type="secondary">Create your client account to access your case details</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Your Full Name" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Create Password" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Button type="link" onClick={() => navigate('/login')} icon={<ArrowLeftOutlined />}>
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ClientRegister;