import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Select,
  Tabs,
  message,
  Card,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Alert,
} from 'antd';
import axiosInstance from '../axiosConfig';
import useAuth from '../hooks/useAuth';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLicense } from '../contexts/LicenseContext';
import { getSupportedCurrencies, getCurrencyName } from '../utils/currency';

const { Title, Text } = Typography;
import LicenseActivationModal from '../components/LicenseManager/LicenseActivationModal';
import { LockOutlined, KeyOutlined, UnlockOutlined, ClockCircleOutlined } from '@ant-design/icons';
/* eslint-disable no-console, react-hooks/exhaustive-deps */

const { TabPane } = Tabs;
const { Option } = Select;

const UserSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const { user } = useAuth();
  const { currency, changeCurrency, supportedCurrencies } = useCurrency();
  const { activation, trial } = useLicense();

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
        // Remove password from profile update payload
        const { password, ...profileData } = values;
        await axiosInstance.put(`/auth/profile/`, profileData);
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
      // Map camelCase form fields to snake_case DB columns
      const payload = {
        messaging: values.messaging,
        client_communication: values.clientCommunication,
      };
      await axiosInstance.put('/user/communication-settings', payload);
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
      // Map camelCase form fields to snake_case DB columns
      const payload = {
        task_management: values.taskManagement,
        deadline_notifications: values.deadlineNotifications,
      };
      await axiosInstance.put('/user/task-settings', payload);
      message.success('Task and deadline tracking settings updated successfully');
    } catch (error) {
      message.error('Failed to update task settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionalSettingsSubmit = async (values) => {
    try {
      setLoading(true);
      // Change currency
      changeCurrency(values.currency);
      message.success('Regional settings updated successfully');
    } catch (error) {
      message.error('Failed to update regional settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Settings</h2>
      <Tabs defaultActiveKey="1">
        <TabPane tab="General Settings" key="1">
          <Form form={form} onFinish={handleGeneralSettingsSubmit}>
            <Form.Item
              label="Name"
              name="username"
              rules={[{ required: true, message: 'Please enter your name!' }]}
            >
              <Input placeholder="User Name" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please enter your email!' }]}
            >
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="License & Activation" key="license">
          <Card bordered={false} style={{ background: 'transparent' }}>
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Software License</Title>
              <p>
                WakiliWorld CRM is licensed software by Tech with Brands (TwB). Your license grants
                you the right to use this software according to the terms of the license agreement.
              </p>
            </div>

            {activation.activated ? (
              <Card
                style={{
                  background: activation.isExpiringSoon ? '#fffbe6' : '#f6ffed',
                  borderColor: activation.isExpiringSoon ? '#ffe58f' : '#b7eb8f',
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UnlockOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <div>
                      <Title level={4} style={{ color: '#389e0d', margin: 0 }}>
                        Software is Activated
                      </Title>
                      <Text type="secondary">License is valid and active</Text>
                    </div>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong>Client Name:</Text>
                      <br />
                      <Text>{activation.clientName || 'N/A'}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>License Key:</Text>
                      <br />
                      <Text code style={{ fontSize: '14px' }}>
                        {activation.licenseKey}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Activated On:</Text>
                      <br />
                      <Text>
                        {activation.activatedAt
                          ? new Date(activation.activatedAt).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Expires On:</Text>
                      <br />
                      <Text
                        style={{
                          color: activation.isExpiringSoon ? '#faad14' : '#389e0d',
                          fontWeight: activation.isExpiringSoon ? 600 : 400,
                        }}
                      >
                        {activation.expiryDate
                          ? new Date(activation.expiryDate).toLocaleDateString()
                          : 'N/A'}
                        {activation.isExpiringSoon &&
                          ` (${activation.daysRemaining} days remaining)`}
                      </Text>
                    </Col>
                  </Row>

                  {activation.maintenanceDue && (
                    <Alert
                      type="warning"
                      message="Quarterly maintenance fee due"
                      description="Please ensure your maintenance payments are up to date to avoid service interruption."
                      showIcon
                      style={{ marginTop: 8 }}
                    />
                  )}

                  {activation.paymentStatus === 'pending' && (
                    <Alert
                      type="warning"
                      message="Payment Pending"
                      description="Please complete payment to activate your license."
                      showIcon
                    />
                  )}

                  <div style={{ marginTop: 8 }}>
                    <Button
                      danger
                      onClick={() => {
                        if (
                          window.confirm(
                            'Deactivating will restrict access to the software. Continue?'
                          )
                        ) {
                          setShowActivationModal(true);
                        }
                      }}
                    >
                      Deactivate License
                    </Button>
                  </div>
                </Space>
              </Card>
            ) : (
              <Card
                style={{
                  background: trial?.inTrial ? '#f6ffed' : '#fff2e8',
                  borderColor: trial?.inTrial ? '#b7eb8f' : '#ffbb96',
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {trial?.inTrial ? (
                      <>
                        <ClockCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                        <div>
                          <Title level={4} style={{ color: '#389e0d', margin: 0 }}>
                            Trial Mode Active
                          </Title>
                          <Text type="secondary">
                            {trial.daysRemaining} days remaining in trial period
                          </Text>
                        </div>
                      </>
                    ) : (
                      <>
                        <LockOutlined style={{ fontSize: 24, color: '#fa541c' }} />
                        <div>
                          <Title level={4} style={{ color: '#d4380d', margin: 0 }}>
                            License Required
                          </Title>
                          <Text type="secondary">
                            Trial period has expired. Please activate your license.
                          </Text>
                        </div>
                      </>
                    )}
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong>Trial Started:</Text>
                      <br />
                      <Text>
                        {trial.startDate ? new Date(trial.startDate).toLocaleDateString() : 'N/A'}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Trial Expires:</Text>
                      <br />
                      <Text>
                        {trial.endDate ? new Date(trial.endDate).toLocaleDateString() : 'N/A'}
                      </Text>
                    </Col>
                  </Row>

                  <div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<KeyOutlined />}
                      onClick={() => setShowActivationModal(true)}
                      style={{ marginRight: 8 }}
                    >
                      {trial.inTrial ? 'Activate License' : 'Enter License Key'}
                    </Button>
                    <Button onClick={() => setShowActivationModal(true)}>Learn More</Button>
                  </div>

                  <Alert
                    message="Need a License?"
                    description={
                      <Space direction="vertical">
                        <Text>Contact Tech with Brands (TwB) to purchase:</Text>
                        <Text>• Email: support@techwithbrands.com</Text>
                        <Text>• Mpesa Till: 8352474 | KCB: 1261709403</Text>
                        <Text>• Initial Fee: KES 250,000 | Quarterly Maintenance: KES 40,000</Text>
                      </Space>
                    }
                    type="info"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                </Space>
              </Card>
            )}
          </Card>
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Regional" key="4">
          <Form form={form} onFinish={handleRegionalSettingsSubmit} initialValues={{ currency }}>
            <Form.Item
              label="Currency"
              name="currency"
              rules={[{ required: true, message: 'Please select currency' }]}
            >
              <Select placeholder="Select currency">
                {supportedCurrencies.map((code) => (
                  <Option key={code} value={code}>
                    {code} - {getCurrencyName(code)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>

      <LicenseActivationModal
        visible={showActivationModal}
        onClose={() => {
          setShowActivationModal(false);
        }}
        isAdmin={false}
      />
    </div>
  );
};

export default UserSettings;
