import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Tabs,
  message,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  SettingOutlined,
  TeamOutlined,
  BarChartOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  UnlockOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import { USE_STANDALONE } from '../config';
import LicenseForm from '../components/LicenseManager/LicenseForm';
import LicenseList from '../components/LicenseManager/LicenseList';
import { useLicense } from '../contexts/LicenseContext';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading] = useState(false);
  const [activeKey, setActiveKey] = useState('1');
  const { isFuturistic } = useTheme();
  const { stats: licenseStats, refreshData: refreshLicense } = useLicense();

  // User Management State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // System Monitoring State
  const [systemInfo] = useState({
    databaseMode: USE_STANDALONE ? 'Standalone (localStorage)' : 'Supabase (PostgreSQL)',
    totalUsers: 0,
    totalCases: 0,
    storageUsed: '0 KB',
    lastBackup: 'Never',
  });

  // Backup State
  const [backupStatus, setBackupStatus] = useState('');

  useEffect(() => {
    if (activeKey === 'licenses') {
      refreshLicense();
    }
  }, [activeKey, refreshLicense]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axiosInstance.get('/admin/users/');
      setUsers(response.data.results || []);
    } catch (error) {
      message.error('Failed to load users');
      console.error(error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!USE_STANDALONE) {
      message.info('Backups are handled automatically by Supabase. No manual action required.');
      return;
    }
    try {
      const db = localStorage.getItem('wakiliworld.frontend.db.v1');
      if (!db) {
        message.warning('No data to backup');
        return;
      }
      const blob = new Blob([db], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wakiliworld-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupStatus('Backup completed successfully');
      message.success('Backup downloaded');
    } catch (error) {
      console.error('Backup failed:', error);
      setBackupStatus('Backup failed');
      message.error('Backup failed');
    }
  };

  const userColumns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'administrator' || role === 'admin' ? 'red' : 'Blue';
        return <Tag color={color}>{role?.toLowerCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2} style={{ color: isFuturistic ? '#f8fafc' : '#1e293b', marginBottom: 24 }}>
        Admin Dashboard
      </Title>

      <Tabs
        defaultActiveKey="1"
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          {
            key: '1',
            label: 'Case Management',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Case Details" style={{ marginBottom: 16 }}>
                    <Form
                      onFinish={(_values) => {
                        /* existing case details submit */
                      }}
                    >
                      {/* ... existing case details form fields ... */}
                      <Button type="primary" htmlType="submit">
                        Save Settings
                      </Button>
                    </Form>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Case Progress">
                    <Form
                      onFinish={(_values) => {
                        /* existing progress submit */
                      }}
                    >
                      {/* ... */}
                      <Button type="primary" htmlType="submit">
                        Save Settings
                      </Button>
                    </Form>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: '2',
            label: 'Client Management',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Client Profile">
                    <Form
                      onFinish={(_values) => {
                        /* existing client profile submit */
                      }}
                    >
                      {/* ... */}
                      <Button type="primary" htmlType="submit">
                        Save
                      </Button>
                    </Form>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Client Portal">
                    <Form
                      onFinish={(_values) => {
                        /* existing portal submit */
                      }}
                    >
                      {/* ... */}
                      <Button type="primary" htmlType="submit">
                        Save
                      </Button>
                    </Form>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: '3',
            label: 'User Management',
            children: (
              <Card
                title={
                  <>
                    <TeamOutlined /> All Users
                  </>
                }
                extra={
                  <Tooltip title="Refresh list">
                    <Button icon={<SettingOutlined spin={usersLoading} />} onClick={fetchUsers} />
                  </Tooltip>
                }
                style={{ marginBottom: 16 }}
              >
                <Table
                  columns={userColumns}
                  dataSource={users}
                  rowKey="id"
                  loading={usersLoading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              </Card>
            ),
          },
          {
            key: '4',
            label: 'System',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Database Mode"
                      value={systemInfo.databaseMode}
                      valueStyle={{ color: isFuturistic ? '#6366f1' : '#1890ff', fontSize: '16px' }}
                      prefix={<DatabaseOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Total Users"
                      value={systemInfo.totalUsers}
                      valueStyle={{ color: '#22c55e' }}
                      prefix={<UserOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Total Cases"
                      value={systemInfo.totalCases}
                      valueStyle={{ color: '#f59e0b' }}
                      prefix={<BarChartOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Storage Used"
                      value={systemInfo.storageUsed}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Last Backup"
                      value={systemInfo.lastBackup}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: '5',
            label: 'Backup',
            children: (
              <Card
                title={
                  <>
                    <CloudDownloadOutlined /> Backup & Restore
                  </>
                }
                style={{ maxWidth: 600 }}
              >
                <p style={{ marginBottom: 16 }}>
                  {USE_STANDALONE
                    ? 'Download a JSON backup of your local database. This file contains all your data including cases, clients, tasks, and documents.'
                    : 'In Supabase mode, database backups are handled automatically by Supabase infrastructure. You can configure point-in-time recovery in the Supabase dashboard.'}
                </p>
                <Button
                  type="primary"
                  icon={<CloudDownloadOutlined />}
                  onClick={handleBackup}
                  loading={loading}
                  size="large"
                >
                  {USE_STANDALONE ? 'Download Backup Now' : 'View Supabase Backups'}
                </Button>
                {backupStatus && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                    Last operation: {backupStatus}
                  </Text>
                )}
              </Card>
            ),
          },
          {
            key: 'licenses',
            label: 'License Management',
            children: (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Total Licenses"
                        value={licenseStats?.total || 0}
                        valueStyle={{ color: '#8b5cf6', fontSize: '18px' }}
                        prefix={<KeyOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Active"
                        value={licenseStats?.active || 0}
                        valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Expiring Soon"
                        value={licenseStats?.expiringSoon || 0}
                        valueStyle={{ color: '#faad14', fontSize: '18px' }}
                        prefix={<WarningOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Revenue (KES)"
                        value={licenseStats?.totalRevenue || 0}
                        valueStyle={{ fontSize: '16px' }}
                        prefix={<UnlockOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                <Tabs
                  defaultActiveKey="list"
                  items={[
                    {
                      key: 'list',
                      label: 'All Licenses',
                      children: <LicenseList />,
                    },
                    {
                      key: 'generate',
                      label: 'Generate License',
                      children: <LicenseForm />,
                    },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AdminDashboard;
