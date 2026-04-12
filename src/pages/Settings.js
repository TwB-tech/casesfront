import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Select, Tabs, message } from 'antd';
import axiosInstance from '../axiosConfig';
import useAuth from '../hooks/useAuth';

const { TabPane } = Tabs;
const { Option } = Select;

const UserSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchUserDetails();
    }
  }, [user?.id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        return;
      }
      const response = await axiosInstance.get(`/auth/user/${user.id}`);
      form.setFieldsValue(response.data);

    } catch (error) {
      message.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSettingsSubmit = async (values) => {
    try {
      setLoading(true);
      if (user) {
        await axiosInstance.put(`/individual/${user.id}/`, values); 
        message.success('General settings updated successfully');
      } else {
        message.error('User ID not found');
      }
    } catch (error) {
      message.error('Failed to update general settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCommunicationSettingsSubmit = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.put('/user/communication-settings', values); // API endpoint for updating communication settings
      message.success('Communication settings updated successfully');
    } catch (error) {
      message.error('Failed to update communication settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSettingsSubmit = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.put('/user/task-settings', values); // API endpoint for updating task settings
      message.success('Task and deadline tracking settings updated successfully');
    } catch (error) {
      message.error('Failed to update task settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>User Settings</h2>
      <Tabs defaultActiveKey="1">
        <TabPane tab="General Settings" key="1">
          <Form form={form} onFinish={handleGeneralSettingsSubmit}>
            <Form.Item label="Name" name="username" rules={[{ required: true, message: 'Please enter your name!' }]}>
              <Input placeholder="User Name" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email!' }]}>
              <Input placeholder="Your Email" />
            </Form.Item>
            <Form.Item label="Change Password" name="password">
              <Input.Password placeholder="New Password" />
            </Form.Item>
            <Form.Item label="Time Zone" name="timezone">
              <Select placeholder="Select your time zone">
                <Option value="GMT">GMT</Option>
                <Option value="EST">EST</Option>
                <Option value="PST">PST</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Communication Settings" key="2">
          <Form form={form} onFinish={handleCommunicationSettingsSubmit}>
            <Form.Item name="messaging" valuePropName="checked">
              <Checkbox>Enable Internal Messaging</Checkbox>
            </Form.Item>
            <Form.Item name="clientCommunication" valuePropName="checked">
              <Checkbox>Enable Client Communication Logging</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Task and Deadline Tracking" key="3">
          <Form form={form} onFinish={handleTaskSettingsSubmit}>
            <Form.Item name="taskManagement" valuePropName="checked">
              <Checkbox>Enable Task Management</Checkbox>
            </Form.Item>
            <Form.Item name="deadlineNotifications" valuePropName="checked">
              <Checkbox>Enable Deadline Notifications</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UserSettings;
