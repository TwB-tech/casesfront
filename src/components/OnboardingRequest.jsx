import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Steps } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, MessageOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from './ui/Breadcrumbs';

const OnboardingRequest = () => {
  const { isFuturistic, themeConfig } = useTheme();
  const [form] = Form.useForm();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = (changedValues, allValues) => {
    form.setFieldsValue(changedValues);
  };

  const submit = async (values) => {
    setLoading(true);
    setStatus('sending');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('sent');
      setCurrentStep(1);
      message.success('Request submitted successfully. We will contact you within 24 hours.');
    } catch (err) {
      console.error(err);
      setStatus('error');
      message.error('Failed to submit request. Please try again.');
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
      
      <div className={`mt-6 p-8 rounded-2xl ${
        isFuturistic 
          ? 'bg-cyber-card border border-cyber-border' 
          : 'bg-white border border-neutral-200 shadow-sm'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-50'
          }`}>
            <UserOutlined className={`text-2xl ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`} />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
            Request Onboarding
          </h1>
          <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
            Let us help you get started with WakiliWorld
          </p>
        </div>

        {/* Steps indicator */}
        <div className={`mb-8 p-4 rounded-xl ${
          isFuturistic ? 'bg-cyber-bg' : 'bg-neutral-50'
        }`}>
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 0 ? (isFuturistic ? 'text-aurora-primary' : 'text-primary-600') : (isFuturistic ? 'text-aurora-muted' : 'text-neutral-400')}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 0 
                  ? (isFuturistic ? 'bg-aurora-primary text-white' : 'bg-primary-600 text-white')
                  : (isFuturistic ? 'bg-cyber-surface text-aurora-muted' : 'bg-neutral-200 text-neutral-500')
              }`}>
                {currentStep >= 1 ? <CheckCircleOutlined /> : '1'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Contact Info</span>
            </div>
            <div className={`w-12 h-0.5 ${isFuturistic ? 'bg-cyber-border' : 'bg-neutral-300'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? (isFuturistic ? 'text-aurora-primary' : 'text-primary-600') : (isFuturistic ? 'text-aurora-muted' : 'text-neutral-400')}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1
                  ? (isFuturistic ? 'bg-aurora-primary text-white' : 'bg-primary-600 text-white')
                  : (isFuturistic ? 'bg-cyber-surface text-aurora-muted' : 'bg-neutral-200 text-neutral-500')
              }`}>
                {currentStep >= 1 ? <CheckCircleOutlined /> : '2'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Complete</span>
            </div>
          </div>
        </div>

        {status !== 'sent' ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={submit}
            onValuesChange={handleChange}
            requiredMark={false}
          >
            <Form.Item
              name="name"
              label={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>Full Name</span>}
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input
                prefix={<UserOutlined className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'} />}
                placeholder="Enter your full name"
                size="large"
                style={inputStyle}
                className={isFuturistic ? 'futuristic-input' : ''}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>Email Address</span>}
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                prefix={<MailOutlined className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'} />}
                placeholder="Enter your email address"
                size="large"
                style={inputStyle}
                className={isFuturistic ? 'futuristic-input' : ''}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>Phone Number</span>}
              rules={[{ required: true, message: 'Please enter your phone number' }]}
            >
              <Input
                prefix={<PhoneOutlined className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'} />}
                placeholder="Enter your phone number"
                size="large"
                style={inputStyle}
                className={isFuturistic ? 'futuristic-input' : ''}
              />
            </Form.Item>

            <Form.Item
              name="message"
              label={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>Additional Information</span>}
            >
              <Input.TextArea
                prefix={<MessageOutlined className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'} />}
                placeholder="Tell us about your practice and how we can help (optional)"
                rows={4}
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
                {loading ? 'Submitting...' : 'Request Onboarding'}
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="text-center py-8">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isFuturistic ? 'bg-success/20' : 'bg-success-50'
            }`}>
              <CheckCircleOutlined className={`text-4xl ${isFuturistic ? 'text-success' : 'text-success-500'}`} />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
              Request Submitted Successfully
            </h2>
            <p className={`mb-6 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
              Our team will contact you within 24 hours to schedule your onboarding session.
            </p>
            <div className={`p-4 rounded-xl ${isFuturistic ? 'bg-cyber-bg' : 'bg-neutral-50'}`}>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Need immediate assistance?
              </p>
              <p className={`font-medium ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}>
                admin@techwithbrands.com | +254 791 472 688
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingRequest;
