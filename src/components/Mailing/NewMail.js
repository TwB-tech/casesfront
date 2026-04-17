import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useTheme } from "../../contexts/ThemeContext";
import axiosInstance from "../../axiosConfig";

const NewMail = () => {
    const { isFuturistic } = useTheme();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSend = (values) => {
        setLoading(true);
        axiosInstance
            .post("/clientcomm/api/clientcommunications/", {
                email: values.email,
                subject: values.subject,
                message: values.message,
                google_meet_link: values.googleMeetLink || '',
            })
            .then(() => {
                message.success("Email sent successfully!");
                form.resetFields();
            })
            .catch((error) => {
                message.error("There was an error sending the email!");
                console.error("Error:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className={`mx-auto p-6 rounded-2xl border ${isFuturistic ? 'bg-cyber-card border-cyber-border' : 'bg-white border-neutral-200'}`}>
            <header className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
                    New Email
                </h2>
                <Button type="default" onClick={() => window.history.back()}>
                    Cancel
                </Button>
            </header>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSend}
                initialValues={{ email: '', subject: '', googleMeetLink: '', message: '' }}
            >
                <Form.Item
                    label="To"
                    name="email"
                    rules={[
                        { required: true, message: 'Please enter recipient email' },
                        { type: 'email', message: 'Invalid email address' }
                    ]}
                >
                    <Input placeholder="client@example.com" />
                </Form.Item>
                <Form.Item
                    label="Subject"
                    name="subject"
                    rules={[{ required: true, message: 'Subject is required' }]}
                >
                    <Input placeholder="Email subject" />
                </Form.Item>
                <Form.Item
                    label="Google Meet Link (Optional)"
                    name="googleMeetLink"
                >
                    <Input placeholder="https://meet.google.com/..." />
                </Form.Item>
                <Form.Item
                    label="Message"
                    name="message"
                    rules={[{ required: true, message: 'Message is required' }]}
                >
                    <Input.TextArea rows={6} placeholder="Write your message..." />
                </Form.Item>
                <div className="flex justify-end">
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Send
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default NewMail;
