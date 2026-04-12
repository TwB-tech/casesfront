import React, { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';

const { Title, Paragraph } = Typography;

const ContactUsForm = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const emailSubject = `WakiliWorld Enquiry: ${values.firstName} ${values.lastName}`;
      const emailBody = values.message;
      const mailtoLink = `mailto:contact@wakiliworld.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      
      form.resetFields();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <Row justify="center" style={{ marginBottom: '60px' }}>
        <Col xs={24}>
           <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ 
              textAlign: 'center', 
              marginBottom: '16px',
              fontSize: '42px',
              fontWeight: 700,
              color: '#102a43'
            }}>Get in Touch</Title>
            <Paragraph style={{ 
              textAlign: 'center', 
              marginBottom: '0',
              fontSize: '18px',
              color: '#486581',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Have questions? Need help? Our team is here for you. We typically respond within 24 hours.
            </Paragraph>
          </div>
        </Col>
      </Row>
      
      <Row gutter={[48, 48]}>
        <Col xs={24} md={12}>
          <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="First name" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="Last name" size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <Input placeholder="your@email.com" size="large" />
              </Form.Item>
              <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Please enter your message' }]}>
                <Input.TextArea rows={5} placeholder="How can we help you?" size="large" />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting} 
                  size="large"
                  style={{ 
                    width: '100%',
                    background: '#102a43',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 500
                  }}
                >
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card style={{ 
            borderRadius: '16px', 
            border: 'none', 
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            height: '100%'
          }}>
            <Title level={3} style={{ 
              textAlign: 'left', 
              marginBottom: '32px',
              fontSize: '28px',
              fontWeight: 600,
              color: '#102a43'
            }}>Contact Information</Title>
            
             <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontWeight: 600, color: '#102a43', marginBottom: '8px' }}>Head Office</h4>
              <Paragraph style={{ color: '#486581', marginBottom: '4px' }}>
                WakiliWorld Ltd.<br />
                Nairobi, Kenya
              </Paragraph>
              <Paragraph style={{ color: '#1890ff', fontWeight: 500 }}>
                +254 791 472 688<br />
                admin@techwithbrands.com
              </Paragraph>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontWeight: 600, color: '#102a43', marginBottom: '8px' }}>Development</h4>
              <Paragraph style={{ color: '#486581', marginBottom: '4px' }}>
                Built by Tech with Brands
              </Paragraph>
              <Paragraph style={{ color: '#1890ff', fontWeight: 500 }}>
                https://techwithbrands.com
              </Paragraph>
            </div>
            
            <div>
              <h4 style={{ fontWeight: 600, color: '#102a43', marginBottom: '8px' }}>Support Hours</h4>
              <Paragraph style={{ color: '#486581' }}>
                Monday - Friday: 8:00 AM - 8:00 PM EAT<br />
                Saturday: 9:00 AM - 5:00 PM EAT
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContactUsForm;
