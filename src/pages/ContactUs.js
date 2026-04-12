import React, { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

const ContactUsForm = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const emailSubject = `Wakili Hub Enquiries: ${values.firstName} ${values.lastName}`;
      const emailBody = values.message;
      const mailtoLink = `mailto:wakilihub@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      
      // Clear the form fields after successful submission
      form.resetFields();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Row justify="center" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '10px' }}>Get in Touch with Wakilihub</Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: '30px' }}>
            We’re here to help! Whether you have a question about our services, need assistance with a case, or want to give feedback, our team is ready to assist you. Please fill out the form below, and we will get back to you as soon as possible.
          </Paragraph>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter your first name' }]}>
              <Input placeholder="Enter your first name" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter your last name' }]}>
              <Input placeholder="Enter your last name" />
            </Form.Item>
            <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Please enter your message' }]}>
              <Input.TextArea rows={4} placeholder="Enter your message" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} style={{ width: '100%' }}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      
      <Row justify="center" style={{ marginTop: '40px' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8} style={{display:"flex"}}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>Our Locations</Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: '10px' }}>
            <strong>Head Office:</strong><br />
            Wakilihub Ltd.<br />
            123 Legal Avenue,<br />
            Nairobi, Kenya<br />
            Phone: +254 700 000 000<br />
            Email: wakilihub@gmail.com
          </Paragraph>
          <Paragraph style={{ textAlign: 'center', marginBottom: '10px' }}>
            <strong>Branch Office:</strong><br />
            Wakilihub Ltd.<br />
            456 Law Street,<br />
            Mombasa, Kenya<br />
            Phone: +254 700 000 001<br />
            Email: mombasa@wakilihub.com
          </Paragraph>
        </Col>
      </Row>
    </>
  );
};

export default ContactUsForm;
