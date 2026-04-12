import React, { useState } from 'react';
import { Card, Tabs, Avatar, Button, Modal, Form, Input, Upload, Tooltip } from 'antd';
import { EditOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';

const { TabPane } = Tabs;

const ProfilePage = () => {
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const {user } = useAuth();

  const showEditModal = () => {
    setEditModalVisible(true);
  };

  const handleEditOk = () => {
    form.validateFields().then(values => {
      console.log('Updated user details:', values);
      setEditModalVisible(false);
      form.resetFields();
    });
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    form.resetFields();
  };

  const showPasswordModal = () => {
    setPasswordModalVisible(true);
  };

  const handlePasswordOk = () => {
    passwordForm.validateFields().then(values => {
      console.log('Updated password:', values);
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    });
  };

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
    passwordForm.resetFields();
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card
        style={{ maxWidth: '600px', margin: 'auto', marginBottom: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        actions={[
          <Tooltip title="Edit User Details">
            <EditOutlined key="edit" onClick={showEditModal} />
          </Tooltip>,
          <Tooltip title="Change Password">
            <SettingOutlined key="setting" onClick={showPasswordModal} />
          </Tooltip>,
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Avatar size={64} icon={<UploadOutlined />} />
          <Upload showUploadList={false}>
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </div>
        <h2 style={{ marginTop: '20px' }}>UserName: {user.username.toUpperCase()}</h2>
        <span>Email: <span style={{fontWeight:"bold"}}>{user.email}</span></span> <br/>
        <span>Role: <span style={{fontWeight:"bold"}}>{user.role} </span></span>
      </Card>

      <Tabs defaultActiveKey="1" style={{ maxWidth: '600px', margin: 'auto' }}>
        <TabPane tab="Case Logs" key="1">
          {/* Case Logs content */}
          <p>Case logs will be displayed here.</p>
        </TabPane>
        <TabPane tab="Clients" key="2">
          {/* Clients content */}
          <p>Clients list will be displayed here.</p>
        </TabPane>
        <TabPane tab="Documents" key="3">
          {/* Documents content */}
          <p>Documents will be displayed here.</p>
        </TabPane>
        <TabPane tab="Settings" key="4">
          {/* Settings content */}
          <p>Settings options will be displayed here.</p>
        </TabPane>
      </Tabs>

      <Modal
        title="Edit User Details"
        visible={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Please enter your full name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter your email!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please enter your role!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Change Password"
        visible={isPasswordModalVisible}
        onOk={handlePasswordOk}
        onCancel={handlePasswordCancel}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please enter your current password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: 'Please enter your new password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirm New Password"
            name="confirmNewPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
