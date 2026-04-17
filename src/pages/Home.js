import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Avatar,
  Button,
  Modal,
  Calendar,
  List,
  Skeleton,
  Pagination,
  Tag,
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { UserOutlined, CalendarOutlined, FileOutlined } from '@ant-design/icons';
import moment from 'moment';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

/* eslint-disable no-console */
const dataPie1 = [
  { name: 'New', value: 62 },
  { name: 'Returning', value: 26 },
  { name: 'Inactive', value: 12 },
];

const dataPie2 = [
  { name: 'Paid', value: 70 },
  { name: 'Trial', value: 30 },
];

const dataBar = [
  { name: 'JAN', cases: 100 },
  { name: 'FEB', cases: 120 },
  { name: 'MAR', cases: 180 },
  { name: 'APR', cases: 150 },
  { name: 'MAY', cases: 200 },
  { name: 'JUN', cases: 250 },
  { name: 'JUL', cases: 270 },
  { name: 'AUG', cases: 50 },
  { name: 'SEP', cases: 100 },
  { name: 'OCT', cases: 250 },
  { name: 'NOV', cases: 290 },
  { name: 'DEC', cases: 400 },
];

const columns = [
  { title: 'Task', dataIndex: 'title', key: 'title' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: 'Completed', value: true },
      { text: 'Pending', value: false },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => {
      const color = status ? 'green' : 'volcano';
      return <Tag color={color}>{status ? 'Completed' : 'Pending'}</Tag>;
    },
  },
];

const COLORS1 = ['#FFBB28', '#FF8042', '#0088FE'];
const COLORS2 = ['#0088FE', '#00C49F'];

function Home() {
  const { isFuturistic } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch functions defined before useEffect to avoid hoisting issues
  const [financialData, setFinancialData] = useState({
    monthlyRevenue: 25410,
    pendingRevenue: 1352,
  });

  const fetchCases = async () => {
    try {
      const response = await axiosInstance.get('/advocate/cases/');
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoadingCases(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/advocate/clients/');
      const data = await response.data;
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/tasks/');
      const data = await response.data.results;
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchFinancials = async () => {
    try {
      const response = await axiosInstance.get('/accounting/dashboard/summary/');
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error fetching financials:', error);
    }
  };

  // Other UI handlers
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCases();
    fetchClients();
    fetchTasks();
    fetchFinancials();
  }, []);

  return (
    <div style={{ padding: '20px', zIndex: 1 }}>
      {/* Welcome & Insight Card */}
      <Card
        style={{
          background: isFuturistic
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            : 'linear-gradient(135deg, #102a43 0%, #243b53 100%)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: isFuturistic
            ? '0 8px 32px rgba(99, 102, 241, 0.3)'
            : '0 8px 32px rgba(16, 42, 67, 0.2)',
          marginBottom: '24px',
          border: 'none',
        }}
      >
        <Row align="middle" justify="space-between" gutter={24}>
          <Col xs={24} md={12}>
            <div>
              <h2
                style={{ marginBottom: '8px', color: 'white', fontSize: '28px', fontWeight: 600 }}
              >
                Welcome back, {user && user.username}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '16px' }}>
                Role: {user && user.role}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                {moment().format('dddd, MMMM Do YYYY')} • You have{' '}
                <strong style={{ color: '#38c172' }}>
                  {tasks.filter((t) => !t.status).length} pending tasks
                </strong>{' '}
                today
              </p>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={72}
                icon={<UserOutlined style={{ fontSize: '32px' }} />}
                style={{ border: '3px solid rgba(255,255,255,0.3)' }}
              />
            </div>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                type="primary"
                size="large"
                icon={<CalendarOutlined />}
                onClick={showModal}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '10px',
                }}
              >
                View Calendar
              </Button>
              <Button
                type="primary"
                size="large"
                style={{
                  background: isFuturistic ? '#8b5cf6' : '#38c172',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 500,
                }}
                onClick={() => navigate('/firms')}
              >
                Need Law Firm Support?
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Quick Action Bar */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6} md={4}>
          <Card
            hoverable
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              padding: '16px 8px',
            }}
            onClick={() => navigate('/case-form')}
          >
            <p style={{ margin: 0, fontWeight: 500, color: isFuturistic ? '#f8fafc' : '#102a43' }}>
              New Case
            </p>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card
            hoverable
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              padding: '16px 8px',
            }}
            onClick={() => navigate('/new-document')}
          >
            <p style={{ margin: 0, fontWeight: 500, color: isFuturistic ? '#f8fafc' : '#102a43' }}>
              New Document
            </p>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card
            hoverable
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              padding: '16px 8px',
            }}
            onClick={() => navigate('/tasks/create/')}
          >
            <p style={{ margin: 0, fontWeight: 500, color: isFuturistic ? '#f8fafc' : '#102a43' }}>
              Create Task
            </p>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card
            hoverable
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              padding: '16px 8px',
            }}
            onClick={() => navigate('/clients')}
          >
            <p style={{ margin: 0, fontWeight: 500, color: isFuturistic ? '#f8fafc' : '#102a43' }}>
              New Client
            </p>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card
            hoverable
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              padding: '16px 8px',
            }}
            onClick={() => navigate('/new-invoice')}
          >
            <p style={{ margin: 0, fontWeight: 500, color: isFuturistic ? '#f8fafc' : '#102a43' }}>
              New Invoice
            </p>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card
            hoverable
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
              background: isFuturistic ? '#1a1a24' : '#f8fafc',
              padding: '16px 8px',
            }}
            onClick={() => navigate('/firms')}
          >
            <p style={{ margin: 0, fontWeight: 500, color: isFuturistic ? '#f8fafc' : '#102a43' }}>
              Firms Marketplace
            </p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Stats Cards - Optimized layout */}
        <Col xs={24} sm={12} md={6} lg={3}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '16px',
              boxShadow: isFuturistic ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
            }}
            hoverable
          >
            {loadingCases ? (
              <Skeleton active />
            ) : (
              <>
                <Statistic
                  title={
                    <span style={{ color: isFuturistic ? '#94a3b8' : '#627d98' }}>
                      Active Cases
                    </span>
                  }
                  value={cases.cases_count || 0}
                  valueStyle={{
                    color: isFuturistic ? '#f8fafc' : '#102a43',
                    fontWeight: 600,
                    fontSize: '32px',
                  }}
                  prefix={
                    <FileOutlined
                      style={{ color: isFuturistic ? '#6366f1' : '#1890ff', marginRight: '8px' }}
                    />
                  }
                />
                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: '#38c172', fontWeight: 500 }}>8.2% </span>
                  <span style={{ color: isFuturistic ? '#6b7280' : '#627d98', fontSize: '12px' }}>
                    since last month
                  </span>
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={3}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '16px',
              boxShadow: isFuturistic ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
            }}
            hoverable
          >
            {loadingClients ? (
              <Skeleton active />
            ) : (
              <>
                <Statistic
                  title={
                    <span style={{ color: isFuturistic ? '#94a3b8' : '#627d98' }}>
                      Total Clients
                    </span>
                  }
                  value={clients.clients_count || 0}
                  valueStyle={{
                    color: isFuturistic ? '#f8fafc' : '#102a43',
                    fontWeight: 600,
                    fontSize: '32px',
                  }}
                  prefix={
                    <UserOutlined
                      style={{ color: isFuturistic ? '#8b5cf6' : '#722ed1', marginRight: '8px' }}
                    />
                  }
                />
                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: '#38c172', fontWeight: 500 }}>3.4% </span>
                  <span style={{ color: isFuturistic ? '#6b7280' : '#627d98', fontSize: '12px' }}>
                    since last month
                  </span>
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={3}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '16px',
              boxShadow: isFuturistic ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: isFuturistic ? '#94a3b8' : '#627d98' }}>Monthly Revenue</span>
              }
              value={financialData.monthlyRevenue || 25410}
              prefix="$"
              valueStyle={{
                color: isFuturistic ? '#f8fafc' : '#102a43',
                fontWeight: 600,
                fontSize: '32px',
              }}
            />
            <div style={{ marginTop: '8px' }}>
              <span
                style={{
                  color: financialData.revenueChange >= 0 ? '#38c172' : '#f5222d',
                  fontWeight: 500,
                }}
              >
                {financialData.revenueChange >= 0 ? '+' : ''}
                {financialData.revenueChange || 0.4}%
              </span>
              <span style={{ color: isFuturistic ? '#6b7280' : '#627d98', fontSize: '12px' }}>
                since last month
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={3}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '16px',
              boxShadow: isFuturistic ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: isFuturistic ? '#94a3b8' : '#627d98' }}>Pending Revenue</span>
              }
              value={financialData.pendingRevenue || 1352}
              prefix="$"
              valueStyle={{
                color: isFuturistic ? '#f59e0b' : '#faad14',
                fontWeight: 600,
                fontSize: '32px',
              }}
            />
            <div style={{ marginTop: '8px' }}>
              <span style={{ color: isFuturistic ? '#f59e0b' : '#faad14', fontWeight: 500 }}>
                Action Required
              </span>
              <span style={{ color: isFuturistic ? '#6b7280' : '#627d98', fontSize: '12px' }}>
                -{' '}
                {Math.round(
                  ((financialData.pendingRevenue || 1352) /
                    (financialData.monthlyRevenue || 25410)) *
                    100
                )}
                % outstanding
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {/* Analytics Section */}
        <Col xs={24} md={8}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '16px',
              height: '100%',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
            }}
            hoverable
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontWeight: 600,
                color: isFuturistic ? '#f8fafc' : '#102a43',
              }}
            >
              Client Distribution
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataPie1}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {dataPie1.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS1[index % COLORS1.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span style={{ color: COLORS1[0], fontWeight: 500 }}>● New</span> &nbsp;
              <span style={{ color: COLORS1[1], fontWeight: 500 }}>● Returning</span> &nbsp;
              <span style={{ color: COLORS1[2], fontWeight: 500 }}>● Inactive</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '16px',
              height: '100%',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
            }}
            hoverable
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontWeight: 600,
                color: isFuturistic ? '#f8fafc' : '#102a43',
              }}
            >
              Billing Status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataPie2}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {dataPie2.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span style={{ color: COLORS2[0], fontWeight: 500 }}>● Paid</span> &nbsp;
              <span style={{ color: COLORS2[1], fontWeight: 500 }}>● Outstanding</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            style={{
              borderRadius: '16px',
              height: '100%',
              background: isFuturistic
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #102a43 0%, #243b53 100%)',
              color: 'white',
              border: 'none',
              boxShadow: isFuturistic
                ? '0 8px 32px rgba(99, 102, 241, 0.4)'
                : '0 8px 32px rgba(16, 42, 67, 0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, color: 'white' }}>
              Need Extra Support?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>
              Access verified, subscribed law firms and advocates on-demand. No recruitment fees. No
              long-term commitments.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button
                type="primary"
                style={{
                  background: '#38c172',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  width: '100%',
                }}
                onClick={() => navigate('/firms')}
              >
                Browse Available Law Firms
              </Button>
              <Button
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '8px',
                  width: '100%',
                }}
                onClick={() => navigate('/firms')}
              >
                Post Urgent Request
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {/* Cases Dynamics Bar Chart */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: '16px' }} hoverable>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: 0, fontWeight: 600, color: '#102a43' }}>Case Volume Trend</h3>
              <Tag color="blue">2024</Tag>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dataBar} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar
                  dataKey="cases"
                  fill="linear-gradient(180deg, #1890ff 0%, #096dd9 100%)"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Key Metrics & Tasks */}
        <Col xs={24} lg={8}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card style={{ borderRadius: '16px' }} hoverable>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Paid Invoices"
                      value={30256.23}
                      prefix="$"
                      valueStyle={{ color: '#38c172', fontWeight: 600, fontSize: '20px' }}
                    />
                    <span style={{ color: '#38c172', fontWeight: 500 }}>▲ 15%</span>
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Total Revenue"
                      value={150256.23}
                      prefix="$"
                      valueStyle={{ color: '#102a43', fontWeight: 600, fontSize: '20px' }}
                    />
                    <span style={{ color: '#38c172', fontWeight: 500 }}>▲ 59%</span>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card style={{ borderRadius: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <h3 style={{ margin: 0, fontWeight: 600, color: '#102a43' }}>Priority Tasks</h3>
                  <Tag color={tasks.filter((t) => !t.status).length > 5 ? 'red' : 'green'}>
                    {tasks.filter((t) => !t.status).length} pending
                  </Tag>
                </div>
                {loadingTasks ? (
                  <Skeleton active paragraph={{ rows: 3 }} />
                ) : (
                  <>
                    <Table
                      dataSource={tasks.slice((currentPage - 1) * 3, currentPage * 3)}
                      columns={columns}
                      pagination={false}
                      size="small"
                      showHeader={false}
                      bordered={false}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <Pagination
                        current={currentPage}
                        pageSize={3}
                        total={tasks.length}
                        onChange={(page) => setCurrentPage(page)}
                        size="small"
                      />
                    </div>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modal for Calendar and Events */}
      <Modal
        title="Calendar and Upcoming Events"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]} justify="space-between">
          {/* Calendar on the left */}
          <Col xs={24} sm={12}>
            <Calendar fullscreen={false} onPanelChange={onPanelChange} />
          </Col>

          {/* Appointments and Events on the right */}
          <Col xs={24} sm={12}>
            <h3>Upcoming Events</h3>
            <List
              itemLayout="horizontal"
              dataSource={tasks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={moment(item.date).format('YYYY-MM-DD HH:mm')}
                  />
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default Home;
