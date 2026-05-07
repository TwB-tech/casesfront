import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from './ui/Breadcrumbs';

const { Title, Text } = Typography;

function AddClient() {
  const { isFuturistic, themeConfig } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axiosInstance.post('/clients/invite', {
        name: values.name,
        email: values.email,
      });
      message.success('Client invited successfully!');
      setTimeout(() => navigate('/clients'), 1500);
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Failed to send invitation';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: isFuturistic ? '#12121a' : '#ffffff',
    borderColor: isFuturistic ? '#2a2a3a' : '#d9e2ec',
    color: isFuturistic ? '#f8fafc' : '#1a1a1a',
    borderRadius: '8px',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Breadcrumbs />

      <div
        className={`mt-6 p-8 rounded-2xl ${
          isFuturistic
            ? 'bg-cyber-card border border-cyber-border'
            : 'bg-white border border-neutral-200 shadow-sm'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-50'
            }`}
          >
            <UserOutlined
              className={`text-2xl ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}
            />
          </div>
          <h1
            className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
          >
            Add New Client
          </h1>
          <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
            Invite a client to join your CRM
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="name"
            label={
              <span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                Full Name
              </span>
            }
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Input
              prefix={
                <UserOutlined
                  className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}
                />
              }
              placeholder="Client full name"
              size="large"
              style={inputStyle}
              className={isFuturistic ? 'futuristic-input' : ''}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                Email Address
              </span>
            }
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email address' },
            ]}
          >
            <Input
              prefix={
                <MailOutlined
                  className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}
                />
              }
              placeholder="client@example.com"
              size="large"
              style={inputStyle}
              className={isFuturistic ? 'futuristic-input' : ''}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className={isFuturistic ? 'futuristic-btn' : ''}
              style={{
                background: isFuturistic ? undefined : themeConfig.accent,
                height: '48px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {loading ? 'Sending Invite...' : 'Send Invitation'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default AddClient;
