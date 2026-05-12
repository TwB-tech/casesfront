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
import DocumentList from '../components/Documents/DocumentList';
import Settings from './Settings';
 

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
        setProfileData(profileResponse.data || {});
        setStats(statsResponse.data || { cases: 0, clients: 0, documents: 0, tasks: 0 });
      } catch (error) {
        console.error('Error fetching profile:', error);
        message.error('Failed to load profile.');
        if (user) {
          setProfileData({
            username: user.username,
            email: user.email,
            role: user.role,
            practice_areas: [],
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
                    {(Array.isArray(profileData.practice_areas)
                      ? profileData.practice_areas
                      : String(profileData.practice_areas).split(',')
                    )
                      .map((area, idx) => (
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
          <div className="mt-4">
            <DocumentList />
          </div>
        </TabPane>
        <TabPane tab="Reviews" key="reviews">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">My Reviews</h3>
              <p className="text-gray-600 mb-4">
                Reviews you've left for lawyers and services.
              </p>
              {/* Reviews list would go here */}
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Reviews will appear here after consultations.
              </div>
            </div>
          </div>
        </TabPane>
        <TabPane tab="Services" key="services">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal Services Offered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { key: 'consultation', label: 'Legal Consultation (30-60 min calls)', icon: '💬' },
                  { key: 'document_review', label: 'Document Review & Analysis', icon: '📄' },
                  { key: 'contract_drafting', label: 'Contract Drafting & Negotiation', icon: '📝' },
                  { key: 'court_representation', label: 'Court Representation', icon: '⚖️' },
                  { key: 'legal_advice', label: 'General Legal Advice', icon: '🎯' },
                ].map((service) => (
                  <div
                    key={service.key}
                    className={`p-4 border rounded-lg ${
                      profileData?.[`service_${service.key}`]
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{service.label}</h4>
                        <p className="text-sm text-gray-600">
                          {profileData?.[`service_${service.key}`] ? '✓ Offered' : 'Not offered'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Consultation Availability</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Current Availability:</strong>{' '}
                  {profileData?.consultation_availability
                    ? profileData.consultation_availability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : 'Not set'
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditModalVisible(true)}
              >
                Update Services
              </Button>
            </div>
          </div>
        </TabPane>
        <TabPane tab="Settings" key="4">
          <div className="mt-4">
            <Settings />
          </div>
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

          {/* Service fields for advocates/lawyers */}
          {profileData?.role === 'advocate' && (
            <>
              <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-medium mb-3">Legal Services</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Select the legal services you offer to clients:
                </p>
                <div className="space-y-3">
                  {[
                    { key: 'consultation', label: 'Legal Consultation (30-60 min calls)' },
                    { key: 'document_review', label: 'Document Review & Analysis' },
                    { key: 'contract_drafting', label: 'Contract Drafting & Negotiation' },
                    { key: 'court_representation', label: 'Court Representation' },
                    { key: 'legal_advice', label: 'General Legal Advice' },
                  ].map((service) => (
                    <div key={service.key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`service_${service.key}`}
                        checked={form.getFieldValue(`service_${service.key}`) || false}
                        onChange={(e) => {
                          const currentValues = form.getFieldsValue();
                          form.setFieldsValue({
                            ...currentValues,
                            [`service_${service.key}`]: e.target.checked
                          });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`service_${service.key}`} className="text-sm">
                        {service.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-medium mb-3">Consultation Availability</h4>
                <p className="text-sm text-gray-600 mb-4">
                  When are you available for client consultations?
                </p>
                <div className="space-y-3">
                  {[
                    { key: 'weekdays_9_5', label: 'Weekdays 9 AM - 5 PM' },
                    { key: 'weekdays_evening', label: 'Weekdays Evening (5 PM - 8 PM)' },
                    { key: 'weekends', label: 'Weekends' },
                    { key: 'flexible', label: 'Flexible Schedule' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={`availability_${option.key}`}
                        name="consultation_availability"
                        value={option.key}
                        checked={form.getFieldValue('consultation_availability') === option.key}
                        onChange={(e) => {
                          const currentValues = form.getFieldsValue();
                          form.setFieldsValue({
                            ...currentValues,
                            consultation_availability: option.key
                          });
                        }}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`availability_${option.key}`} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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
