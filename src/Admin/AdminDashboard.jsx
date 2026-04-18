import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Checkbox,
  Select,
  Tabs,
  message,
  Table,
  Tag,
  Space,
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
  EditOutlined,
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import { USE_STANDALONE } from '../config';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('1');
  const { isFuturistic } = useTheme();

  // User Management State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // System Monitoring State
  const [systemInfo, setSystemInfo] = useState({
    databaseMode: USE_STANDALONE ? 'Standalone (localStorage)' : 'Supabase (PostgreSQL)',
    totalUsers: 0,
    totalCases: 0,
    storageUsed: '0 KB',
    lastBackup: 'Never',
  });

  // Backup State
  const [backupStatus, setBackupStatus] = useState('');

  useEffect(() => {
    if (activeKey === '3' || activeKey === 'users') {
      fetchUsers();
    }
    if (activeKey === '4' || activeKey === 'system') {
      fetchSystemStats();
    }
  }, [activeKey]);

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

  const fetchSystemStats = async () => {
    try {
      // For standalone, compute approximate storage used
      if (USE_STANDALONE) {
        const dbStr = localStorage.getItem('wakiliworld.frontend.db.v1') || '{}';
        const sizeKB = Math.round(new Blob([dbStr]).size / 1024);
        setSystemInfo((prev) => ({
          ...prev,
          storageUsed: `${sizeKB} KB`,
          totalUsers: JSON.parse(dbStr).users?.length || 0,
          totalCases: JSON.parse(dbStr).cases?.length || 0,
        }));
      } else {
        // Basic stats could be fetched from users/stats endpoint
        try {
          const statsRes = await axiosInstance.get('/users/stats/');
          // Not perfect but gives some idea
          setSystemInfo((prev) => ({
            ...prev,
            totalUsers: statsRes.data.totalUsers || 0,
            totalCases: statsRes.data.totalCases || 0,
          }));
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error fetching system stats:', err);
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

      <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="Case Management" key="1">
          {/* Existing Case Management Forms */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Case Details" style={{ marginBottom: 16 }}>
                <Form
                  onFinish={(values) => {
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
                  onFinish={(values) => {
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
        </TabPane>

        <TabPane tab="Client Management" key="2">
          {/* Existing Client Management Forms */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Client Profile">
                <Form
                  onFinish={(values) => {
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
                  onFinish={(values) => {
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
        </TabPane>

        <TabPane tab="User Management" key="3">
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
        </TabPane>

        <TabPane tab="System" key="4">
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
        </TabPane>

        <TabPane tab="Backup" key="5">
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
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
