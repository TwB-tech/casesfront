import React, { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, Card, message } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const { Title, Text } = Typography;

const ContactUsForm = () => {
  const { isFuturistic, themeConfig } = useTheme();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const emailSubject = `WakiliWorld Enquiry: ${values.firstName} ${values.lastName}`;
      const emailBody = values.message;
      const mailtoLink = `mailto:contact@wakiliworld.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      setSubmitted(true);
      message.success('Opening email client...');
      form.resetFields();
    } catch (errorInfo) {
      console.error('Failed:', errorInfo);
      message.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: isFuturistic ? '#12121a' : '#ffffff',
    borderColor: isFuturistic ? '#2a2a3a' : '#d9e2ec',
    color: isFuturistic ? '#f8fafc' : '#1a1a1a',
    borderRadius: '8px',
  };

  const contactInfo = [
    {
      icon: EnvironmentOutlined,
      title: 'Head Office',
      lines: ['WakiliWorld Ltd.', 'Nairobi, Kenya'],
      highlight: false,
    },
    {
      icon: PhoneOutlined,
      title: 'Phone',
      lines: ['+254 791 472 688'],
      highlight: true,
    },
    {
      icon: MailOutlined,
      title: 'Email',
      lines: ['admin@techwithbrands.com'],
      highlight: true,
    },
    {
      icon: ClockCircleOutlined,
      title: 'Support Hours',
      lines: ['Monday - Friday: 8:00 AM - 8:00 PM EAT', 'Saturday: 9:00 AM - 5:00 PM EAT'],
      highlight: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs />
      
      {/* Header */}
      <div className="text-center mb-12 pt-8">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
          isFuturistic ? 'bg-aurora-primary/10 border border-aurora-primary/30' : 'bg-primary-50'
        }`}>
          <MailOutlined className={isFuturistic ? 'text-aurora-primary' : 'text-primary-600'} />
          <span className={`text-sm font-medium ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}>
            We would love to hear from you
          </span>
        </div>
        <Title 
          level={1} 
          className={`mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
          style={{ fontSize: '42px', fontWeight: 700 }}
        >
          Get in Touch
        </Title>
        <Text className={`text-lg block max-w-xl mx-auto ${
          isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
        }`}>
          Have questions? Need help? Our team is here for you. We typically respond within 24 hours.
        </Text>
      </div>
      
      <Row gutter={[48, 48]}>
        {/* Contact Form */}
        <Col xs={24} md={12}>
          <Card 
            className={`h-full ${
              isFuturistic 
                ? 'bg-cyber-card border-cyber-border' 
                : 'shadow-sm'
            }`}
            style={{ borderRadius: '16px' }}
            styles={{ body: { padding: '32px' } }}
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  isFuturistic ? 'bg-success/20' : 'bg-success-50'
                }`}>
                  <CheckCircleOutlined className={`text-4xl ${isFuturistic ? 'text-success' : 'text-success-500'}`} />
                </div>
                <Title level={3} className={`mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
                  Message Ready
                </Title>
                <Text className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
                  Your email client should open with the pre-filled message. 
                  If it does not open, please email us directly at admin@techwithbrands.com
                </Text>
                <div className="mt-6">
                  <Button 
                    type="primary" 
                    onClick={() => setSubmitted(false)}
                    className={isFuturistic ? 'futuristic-btn' : ''}
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="firstName"
                      label={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>First Name</span>}
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Input 
                        placeholder="First name" 
                        size="large"
                        style={inputStyle}
                        className={isFuturistic ? 'futuristic-input' : ''}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lastName"
                      label={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>Last Name</span>}
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Input 
                        placeholder="Last name" 
                        size="large"
                        style={inputStyle}
                        className={isFuturistic ? 'futuristic-input' : ''}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  name="email"
                  label={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>Email Address</span>}
                  rules={[
                    { required: true, message: 'Required' },
                    { type: 'email', message: 'Valid email required' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'} />}
                    placeholder="your@email.com" 
                    size="large"
                    style={inputStyle}
                    className={isFuturistic ? 'futuristic-input' : ''}
                  />
                </Form.Item>
                
                <Form.Item
                  name="message"
                  label={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>Message</span>}
                  rules={[{ required: true, message: 'Please enter your message' }]}
                >
                  <Input.TextArea 
                    rows={5} 
                    placeholder="How can we help you?" 
                    size="large"
                    style={inputStyle}
                    className={isFuturistic ? 'futuristic-input' : ''}
                  />
                </Form.Item>
                
                <Form.Item className="mb-0">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting} 
                    size="large"
                    icon={<SendOutlined />}
                    block
                    className={isFuturistic ? 'futuristic-btn' : ''}
                    style={{ 
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: 600,
                    }}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>
        
        {/* Contact Information */}
        <Col xs={24} md={12}>
          <Card 
            className={`h-full ${
              isFuturistic 
                ? 'bg-cyber-card border border-cyber-border' 
                : 'shadow-sm'
            }`}
            style={{ borderRadius: '16px' }}
            styles={{ body: { padding: '32px' } }}
          >
            <Title level={3} className={`mb-8 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
              Contact Information
            </Title>
            
            <div className="space-y-8">
              {contactInfo.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-50'
                  }`}>
                    <item.icon className={`text-xl ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
                      {item.title}
                    </h4>
                    {item.lines.map((line, lineIdx) => (
                      <Text 
                        key={lineIdx} 
                        className={`block ${item.highlight ? (isFuturistic ? 'text-aurora-primary' : 'text-accent-500') : (isFuturistic ? 'text-aurora-muted' : 'text-neutral-600')}`}
                        style={item.highlight ? { fontWeight: 500 } : {}}
                      >
                        {line}
                      </Text>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Development Credit */}
            <div className={`mt-8 pt-8 border-t ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}`}>
              <div className={`p-4 rounded-xl ${
                isFuturistic ? 'bg-cyber-bg' : 'bg-neutral-50'
              }`}>
                <Text className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                  Built with care by
                </Text>
                <a 
                  href="https://techwithbrands.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className={`block font-semibold ${isFuturistic ? 'text-aurora-primary hover:text-aurora-secondary' : 'text-primary-600 hover:text-primary-700'}`}
                >
                  Tech with Brands
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className={`mt-8 pt-8 border-t ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}`}>
              <Text className={`text-sm mb-4 block ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Follow Us
              </Text>
              <div className="flex gap-4">
                {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:-translate-y-1 ${
                      isFuturistic 
                        ? 'bg-cyber-bg text-aurora-muted hover:text-aurora-primary hover:bg-aurora-primary/10' 
                        : 'bg-neutral-100 text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Map Placeholder */}
      <div className={`mt-12 rounded-2xl overflow-hidden ${
        isFuturistic 
          ? 'bg-cyber-card border border-cyber-border' 
          : 'bg-neutral-100'
      }`}>
        <div className={`h-64 flex items-center justify-center ${
          isFuturistic ? 'bg-gradient-to-br from-cyber-surface to-cyber-bg' : 'bg-gradient-to-br from-primary-50 to-neutral-100'
        }`}>
          <div className="text-center">
            <EnvironmentOutlined className={`text-5xl mb-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}`} />
            <Text className={`text-lg ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
              Nairobi, Kenya
            </Text>
            <Text className={`block text-sm mt-2 ${isFuturistic ? 'text-aurora-muted/70' : 'text-neutral-400'}`}>
              Interactive map coming soon
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsForm;
