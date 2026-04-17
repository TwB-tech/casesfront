import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Tooltip,
  Statistic,
  Row,
  Col,
  Tag,
  message,
} from 'antd';
import {
  EditOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useMediaQuery } from 'react-responsive';
import axiosInstance from '../axiosConfig';
import moment from 'moment';
/* eslint-disable no-console */

const { TabPane } = Tabs;

const ProfilePage = () => {
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ cases: 0, clients: 0, documents: 0, tasks: 0 });
  const { user } = useAuth();
  const { isFuturistic } = useTheme();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchProfileData = async () => {
      try {
        const [profileResponse, statsResponse] = await Promise.all([
          axiosInstance.get('/auth/profile/'),
          axiosInstance.get('/users/stats/'),
        ]);
        setProfileData(profileResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        message.error('Failed to load profile.');
        if (user) {
          setProfileData({
            username: user.username,
            email: user.email,
            role: user.role,
          });
        }
      }
    };
    fetchProfileData();
  }, [user]);

  const showEditModal = () => {
    setEditModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      // Map form fields to backend schema
      const payload = {
        username: values.fullName, // fullName -> username
        email: values.email,
        role: values.role,
      };
      await axiosInstance.put('/auth/profile/', payload);
      message.success('Profile updated successfully');
      setEditModalVisible(false);
      form.resetFields();

      // Refresh profile data
      const profileResponse = await axiosInstance.get('/auth/profile/');
      setProfileData(profileResponse.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    form.resetFields();
  };

  const showPasswordModal = () => {
    setPasswordModalVisible(true);
  };

  const handlePasswordOk = async () => {
    try {
      const values = await passwordForm.validateFields();
      await axiosInstance.post('/auth/change-password/', values);
      message.success('Password changed successfully');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password');
    }
  };

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
    passwordForm.resetFields();
  };

  return (
    <div
      style={{
        padding: isSmallScreen ? '16px' : '24px',
        marginTop: isSmallScreen ? '60px' : '0',
        background: isFuturistic ? '#12121a' : '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card
            className={isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}
            style={{ borderRadius: '12px' }}
          >
            <Statistic
              title="Cases"
              value={stats.cases}
              valueStyle={{ color: isFuturistic ? '#f8fafc' : '#1e293b', fontWeight: 700 }}
              prefix={<FileTextOutlined style={{ color: '#3b82f6', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className={isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}
            style={{ borderRadius: '12px' }}
          >
            <Statistic
              title="Clients"
              value={stats.clients}
              valueStyle={{ color: isFuturistic ? '#f8fafc' : '#1e293b', fontWeight: 700 }}
              prefix={<UserOutlined style={{ color: '#22c55e', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className={isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}
            style={{ borderRadius: '12px' }}
          >
            <Statistic
              title="Documents"
              value={stats.documents}
              valueStyle={{ color: isFuturistic ? '#f8fafc' : '#1e293b', fontWeight: 700 }}
              prefix={<FileTextOutlined style={{ color: '#8b5cf6', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className={isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}
            style={{ borderRadius: '12px' }}
          >
            <Statistic
              title="Tasks"
              value={stats.tasks}
              valueStyle={{ color: isFuturistic ? '#f8fafc' : '#1e293b', fontWeight: 700 }}
              prefix={<CheckCircleOutlined style={{ color: '#f59e0b', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Profile Card */}
      <Card
        style={{
          maxWidth: '800px',
          margin: 'auto',
          marginBottom: '24px',
          borderRadius: '16px',
          boxShadow: isFuturistic ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
          background: isFuturistic ? '#1a1a24' : '#ffffff',
          border: isFuturistic ? '1px solid #2a2a3a' : 'none',
        }}
        actions={[
          <Tooltip key="edit" title="Edit User Details">
            <EditOutlined onClick={showEditModal} style={{ fontSize: '18px' }} />
          </Tooltip>,
          <Tooltip key="change-password" title="Change Password">
            <SettingOutlined onClick={showPasswordModal} style={{ fontSize: '18px' }} />
          </Tooltip>,
        ]}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isSmallScreen ? 'column' : 'row',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Avatar
              size={isSmallScreen ? 80 : 100}
              icon={<UserOutlined />}
              src={profileData?.profile}
              style={{
                background: isFuturistic ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#3b82f6',
                fontSize: '36px',
                fontWeight: 700,
              }}
            />
            <Upload
              showUploadList={false}
              action="/api/upload-avatar"
              style={{ position: 'absolute', bottom: 0, right: 0 }}
            >
              <Button
                size="small"
                icon={<UploadOutlined />}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
              />
            </Upload>
          </div>

          <div style={{ flex: 1, textAlign: isSmallScreen ? 'center' : 'left' }}>
            <h2
              style={{
                fontSize: isSmallScreen ? '22px' : '28px',
                fontWeight: 700,
                margin: 0,
                color: isFuturistic ? '#f8fafc' : '#1e293b',
              }}
            >
              {(profileData?.username || user?.username || 'User').toUpperCase()}
            </h2>
            <p
              style={{
                fontSize: '16px',
                margin: '8px 0',
                color: isFuturistic ? '#e2e8f0' : '#475569',
              }}
            >
              {profileData?.email || user?.email}
            </p>
            <Tag
              color="blue"
              style={{
                borderRadius: '20px',
                padding: '4px 16px',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {profileData?.role || user?.role}
            </Tag>

            {profileData?.bio && (
              <p
                style={{
                  marginTop: '16px',
                  color: isFuturistic ? '#94a3b8' : '#64748b',
                  fontSize: '14px',
                  lineHeight: 1.5,
                }}
              >
                {profileData.bio}
              </p>
            )}

            {profileData?.practice_areas && (
              <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  justifyContent: isSmallScreen ? 'center' : 'flex-start',
                }}
              >
                {profileData.practice_areas.split(',').map((area, idx) => (
                  <Tag key={idx} style={{ borderRadius: '12px' }}>
                    {area.trim()}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>

        {profileData?.member_since && (
          <div
            style={{
              paddingTop: '16px',
              borderTop: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <p
                style={{ fontSize: '12px', color: isFuturistic ? '#94a3b8' : '#64748b', margin: 0 }}
              >
                Member Since
              </p>
              <p
                style={{
                  fontWeight: 600,
                  color: isFuturistic ? '#f8fafc' : '#1e293b',
                  margin: '4px 0 0 0',
                }}
              >
                {moment(profileData.member_since).format('MMMM YYYY')}
              </p>
            </div>
            <div>
              <p
                style={{ fontSize: '12px', color: isFuturistic ? '#94a3b8' : '#64748b', margin: 0 }}
              >
                Last Active
              </p>
              <p
                style={{
                  fontWeight: 600,
                  color: isFuturistic ? '#f8fafc' : '#1e293b',
                  margin: '4px 0 0 0',
                }}
              >
                {moment(profileData.last_active).fromNow()}
              </p>
            </div>
          </div>
        )}
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
