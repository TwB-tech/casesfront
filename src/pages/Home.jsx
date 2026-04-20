import React, { useEffect, useState, useMemo } from 'react';
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
  Select,
  Space,
  Typography,
  message,
  Alert,
  Divider,
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
import {
  UserOutlined,
  CalendarOutlined,
  FileOutlined,
  EyeOutlined,
  KeyOutlined,
  LockOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import eventBus from '../utils/eventBus';
import { useLicense } from '../contexts/LicenseContext';

/* eslint-disable no-console */
const COLORS1 = ['#FFBB28', '#FF8042', '#0088Fe'];
const COLORS2 = ['#0088Fe', '#00C49F'];

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

function Home() {
  const { isFuturistic } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeCasesModalVisible, setActiveCasesModalVisible] = useState(false);
  const [clientsModalVisible, setClientsModalVisible] = useState(false);
  const [revenueModalVisible, setRevenueModalVisible] = useState(false);
  const [invoicesModalVisible, setInvoicesModalVisible] = useState(false);
  const { user } = useAuth();
  const { activation, trial, refreshData } = useLicense();
  const navigate = useNavigate();

  // Role-based access helpers
  const hasAccountingAccess =
    user && ['admin', 'partner', 'accountant', 'manager', 'advocate', 'firm'].includes(user.role);
  const hasAdminAccess = user && ['admin', 'administrator'].includes(user.role);
  const [cases, setCases] = useState({ cases_count: 0, results: [] });
  const [clients, setClients] = useState({ clients_count: 0, results: [] });
  const [tasks, setTasks] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    monthlyRevenue: [],
    expenseCategories: [],
    recentTransactions: [],
    pendingInvoices: 0,
    overdueInvoices: 0,
    paidInvoices: 0,
  });

  // Modal-specific data states
  const [modalCases, setModalCases] = useState([]);
  const [modalClients, setModalClients] = useState([]);
  const [modalRevenueTransactions, setModalRevenueTransactions] = useState([]);
  const [modalInvoiceTransactions, setModalInvoiceTransactions] = useState([]);
  const [loadingModalCases, setLoadingModalCases] = useState(false);
  const [loadingModalClients, setLoadingModalClients] = useState(false);
  const [loadingModalRevenue, setLoadingModalRevenue] = useState(false);
  const [loadingModalInvoices, setLoadingModalInvoices] = useState(false);

  const fetchCases = async () => {
    try {
      const response = await axiosInstance.get('/case/');
      const data = response.data || {};
      setCases({
        cases_count: data.results ? data.results.length : 0,
        results: Array.isArray(data.results) ? data.results : [],
      });
    } catch (error) {
      console.error('Error fetching cases:', error);
      setCases({ cases_count: 0, results: [] });
    } finally {
      setLoadingCases(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/advocate/clients/');
      const data = response.data || {};
      setClients({
        clients_count: data.clients_count || 0,
        results: Array.isArray(data.results) ? data.results : [],
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients({ clients_count: 0, results: [] });
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/tasks/');
      const data = response.data?.results ?? [];
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
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

  // Fetch detailed data for modals
  const fetchModalCases = async () => {
    setLoadingModalCases(true);
    try {
      const response = await axiosInstance.get('/case/');
      const data = response.data || {};
      const caseList = Array.isArray(data.results) ? data.results : [];
      setModalCases(caseList);
    } catch (error) {
      console.error('Error fetching cases for modal:', error);
      setModalCases([]);
    } finally {
      setLoadingModalCases(false);
    }
  };

  const fetchModalClients = async () => {
    setLoadingModalClients(true);
    try {
      const response = await axiosInstance.get('/advocate/clients/');
      const data = response.data || {};
      const clientList = Array.isArray(data.results) ? data.results : [];
      setModalClients(clientList);
    } catch (error) {
      console.error('Error fetching clients for modal:', error);
      setModalClients([]);
    } finally {
      setLoadingModalClients(false);
    }
  };

  const fetchModalTransactions = async () => {
    setLoadingModalRevenue(true);
    try {
      const response = await axiosInstance.get('/accounting/dashboard/summary/');
      const transactions = response.data.recentTransactions || [];
      setModalRevenueTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions for modal:', error);
      setModalRevenueTransactions([]);
    } finally {
      setLoadingModalRevenue(false);
    }
  };

  const fetchModalInvoices = async () => {
    setLoadingModalInvoices(true);
    try {
      const response = await axiosInstance.get('/accounting/dashboard/summary/');
      const invoices = (response.data.recentTransactions || []).filter(
        (t) => t.type === 'income' && (t.status === 'pending' || t.status === 'overdue')
      );
      setModalInvoiceTransactions(invoices);
    } catch (error) {
      console.error('Error fetching invoices for modal:', error);
      setModalInvoiceTransactions([]);
    } finally {
      setLoadingModalInvoices(false);
    }
  };

  // Compute case volume data (cases per month) from cases list
  const caseVolumeData = useMemo(() => {
    const caseList = cases.results || [];
    if (!Array.isArray(caseList) || caseList.length === 0) {
      return [];
    }
    const monthCounts = {};
    const monthNames = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    caseList.forEach((c) => {
      const start = c.start_date ? new Date(c.start_date) : new Date(c.created_at || Date.now());
      if (isNaN(start.getTime())) {
        return;
      }
      const monthIdx = start.getMonth();
      const year = start.getFullYear();
      const key = `${year}-${monthIdx}`;
      if (!monthCounts[key]) {
        monthCounts[key] = { name: monthNames[monthIdx], cases: 0 };
      }
      monthCounts[key].cases += 1;
    });
    // Sort by month index (could also sort by key)
    return Object.values(monthCounts);
  }, [cases]);

  // Compute billing status pie data from financialData
  const billingStatusData = useMemo(() => {
    const { paidInvoices = 0, pendingInvoices = 0, overdueInvoices = 0 } = financialData;
    return [
      { name: 'Paid', value: paidInvoices },
      { name: 'Pending', value: pendingInvoices },
      { name: 'Overdue', value: overdueInvoices },
    ];
  }, [financialData]);

  // Other UI handlers
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleActiveCasesCancel = () => {
    setActiveCasesModalVisible(false);
  };

  const handleClientsCancel = () => {
    setClientsModalVisible(false);
  };

  const handleRevenueCancel = () => {
    setRevenueModalVisible(false);
  };

  const handleInvoicesCancel = () => {
    setInvoicesModalVisible(false);
  };

  const openActiveCasesModal = () => {
    setActiveCasesModalVisible(true);
    if (modalCases.length === 0) {
      fetchModalCases();
    }
  };

  const openClientsModal = () => {
    setClientsModalVisible(true);
    if (modalClients.length === 0) {
      fetchModalClients();
    }
  };

  const openRevenueModal = () => {
    setRevenueModalVisible(true);
    if (modalRevenueTransactions.length === 0) {
      fetchModalTransactions();
    }
  };

  const openInvoicesModal = () => {
    setInvoicesModalVisible(true);
    if (modalInvoiceTransactions.length === 0) {
      fetchModalInvoices();
    }
  };

  const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCases();
    fetchClients();
    fetchTasks();
    if (hasAccountingAccess) {
      fetchFinancials();
    }

    const handleRefresh = () => {
      fetchCases();
      fetchClients();
      fetchTasks();
      if (hasAccountingAccess) {
        fetchFinancials();
      }
    };

    const events = [
      'caseCreated',
      'caseUpdated',
      'caseDeleted',
      'clientCreated',
      'clientUpdated',
      'clientDeleted',
      'taskCreated',
      'taskUpdated',
      'taskDeleted',
      'documentCreated',
      'documentUpdated',
      'documentDeleted',
      'invoiceCreated',
      'invoiceUpdated',
      'invoiceDeleted',
      'expenseCreated',
      'expenseUpdated',
      'expenseDeleted',
    ];

    const unsub = events.map((event) => eventBus.on(event, handleRefresh));

    return () => {
      unsub.forEach((fn) => fn());
    };
  }, [hasAccountingAccess]);

  return (
    <div style={{ padding: '20px', zIndex: 1 }}>
      {/* License Status Banner */}
      {!activation?.activated && (
        <Alert
          type="warning"
          message={
            <Space>
              <LockOutlined />
              <span>
                <strong>License Required:</strong> Your trial expires in {trial?.daysRemaining || 0}{' '}
                days. Activate now to avoid disruption.
              </span>
              <Button
                type="link"
                onClick={() => navigate('/settings?tab=license')}
                style={{ color: '#1890ff', padding: '0 4px' }}
              >
                Activate
              </Button>
            </Space>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {activation?.activated && activation.isExpiringSoon && (
        <Alert
          type="warning"
          message={
            <Space>
              <WarningOutlined />
              <span>
                <strong>License Expiring Soon:</strong> {activation.daysRemaining} days remaining.
                Please contact Tech with Brands to renew.
              </span>
              <Button
                type="link"
                onClick={() => navigate('/admin-dashboard')}
                style={{ color: '#1890ff', padding: '0 4px' }}
              >
                Renew
              </Button>
            </Space>
          }
          style={{ marginBottom: 16 }}
        />
      )}

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
        {/* New Invoice - Accounting only */}
        {hasAccountingAccess && (
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
              <p
                style={{ margin: 0, fontWeight: 500, color: isFuturistic ? '#f8fafc' : '#102a43' }}
              >
                New Invoice
              </p>
            </Card>
          </Col>
        )}
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
        {/* Active Cases */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '16px',
              boxShadow: isFuturistic ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
            }}
            hoverable
            onClick={openActiveCasesModal}
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

        {/* Total Clients */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '16px',
              boxShadow: isFuturistic ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
            }}
            hoverable
            onClick={openClientsModal}
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

        {/* Total Revenue - Accounting only */}
        {hasAccountingAccess && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              className={isFuturistic ? 'hover-glow' : ''}
              style={{
                borderRadius: '16px',
                boxShadow: isFuturistic
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                background: isFuturistic ? '#1a1a24' : '#ffffff',
                border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
              }}
              hoverable
              onClick={openRevenueModal}
            >
              <Statistic
                title={
                  <span style={{ color: isFuturistic ? '#94a3b8' : '#627d98' }}>Total Revenue</span>
                }
                value={financialData.totalRevenue || 0}
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
                    color: financialData.revenueGrowth >= 0 ? '#38c172' : '#f5222d',
                    fontWeight: 500,
                  }}
                >
                  {financialData.revenueGrowth >= 0 ? '+' : ''}
                  {financialData.revenueGrowth || 0}%
                </span>
                <span style={{ color: isFuturistic ? '#6b7280' : '#627d98', fontSize: '12px' }}>
                  since last month
                </span>
              </div>
            </Card>
          </Col>
        )}

        {/* Pending Invoices - Accounting only */}
        {hasAccountingAccess && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              className={isFuturistic ? 'hover-glow' : ''}
              style={{
                borderRadius: '16px',
                boxShadow: isFuturistic
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                background: isFuturistic ? '#1a1a24' : '#ffffff',
                border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
              }}
              hoverable
              onClick={openInvoicesModal}
            >
              <Statistic
                title={
                  <span style={{ color: isFuturistic ? '#94a3b8' : '#627d98' }}>
                    Pending Invoices
                  </span>
                }
                value={financialData.pendingInvoices || 0}
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
                {financialData.overdueInvoices > 0 && (
                  <span style={{ color: '#f5222d', fontWeight: 500, marginLeft: '8px' }}>
                    ({financialData.overdueInvoices} overdue)
                  </span>
                )}
              </div>
            </Card>
          </Col>
        )}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {/* Analytics Section */}
        <Col xs={24} md={8}>
          {/* Expense Breakdown - Accounting only */}
          {hasAccountingAccess && (
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
                Expense Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={financialData.expenseCategories || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {(financialData.expenseCategories || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                {(financialData.expenseCategories || []).map((cat, idx) => (
                  <span key={idx} style={{ color: cat.color, fontWeight: 500, margin: '0 8px' }}>
                    ● {cat.name}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} md={8}>
          {/* Billing Status - Accounting only */}
          {hasAccountingAccess && (
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
                    data={billingStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {billingStatusData.map((entry, index) => {
                      let color = '#0088Fe';
                      if (entry.name === 'Paid') {
                        color = '#38c172';
                      } else if (entry.name === 'Pending') {
                        color = '#faad14';
                      } else if (entry.name === 'Overdue') {
                        color = '#f5222d';
                      }
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                {billingStatusData.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      color:
                        item.name === 'Paid'
                          ? '#38c172'
                          : item.name === 'Pending'
                            ? '#faad14'
                            : '#f5222d',
                      fontWeight: 500,
                      margin: '0 8px',
                    }}
                  >
                    ● {item.name}
                  </span>
                ))}
              </div>
            </Card>
          )}
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
              <BarChart data={caseVolumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                      title="Total Expenses"
                      value={financialData.totalExpenses || 0}
                      prefix="$"
                      valueStyle={{ color: '#f5222d', fontWeight: 600, fontSize: '20px' }}
                    />
                    <div style={{ marginTop: '4px' }}>
                      <span
                        style={{
                          color: financialData.expenseGrowth >= 0 ? '#f5222d' : '#38c172',
                          fontWeight: 500,
                        }}
                      >
                        {financialData.expenseGrowth >= 0 ? '▲' : '▼'}{' '}
                        {Math.abs(financialData.expenseGrowth || 0)}%
                      </span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Net Profit"
                      value={financialData.netProfit || 0}
                      prefix="$"
                      valueStyle={{
                        color: isFuturistic ? '#f8fafc' : '#102a43',
                        fontWeight: 600,
                        fontSize: '20px',
                      }}
                    />
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ color: '#38c172', fontWeight: 500 }}>
                        {financialData.profitMargin ? financialData.profitMargin.toFixed(1) : 0}%
                        margin
                      </span>
                    </div>
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
                  <Tag color={(tasks || []).filter((t) => !t.status).length > 5 ? 'red' : 'green'}>
                    {(tasks || []).filter((t) => !t.status).length} pending
                  </Tag>
                </div>
                {loadingTasks ? (
                  <Skeleton active paragraph={{ rows: 3 }} />
                ) : (
                  <>
                    <Table
                      dataSource={(tasks || []).slice((currentPage - 1) * 3, currentPage * 3)}
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
                        total={(tasks || []).length}
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
              dataSource={tasks || []}
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

      {/* Active Cases Modal */}
      <Modal
        title="Active Cases"
        visible={activeCasesModalVisible}
        onCancel={handleActiveCasesCancel}
        footer={null}
        width={800}
      >
        {loadingModalCases ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Total Active Cases"
                  value={modalCases.length}
                  valueStyle={{ fontSize: '24px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} md={18}>
              <Select
                placeholder="Filter by status"
                style={{ width: 200, marginBottom: 16 }}
                allowClear
                onChange={(value) => {
                  // Filter handled inline in render
                }}
              >
                <Select.Option value="all">All Statuses</Select.Option>
                <Select.Option value="open">Open</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="closed">Closed</Select.Option>
              </Select>
            </Col>
            <Col span={24}>
              <Table
                dataSource={modalCases}
                columns={[
                  {
                    title: 'Case Number',
                    dataIndex: 'case_number',
                    key: 'case_number',
                    render: (text) => text || 'N/A',
                  },
                  {
                    title: 'Title',
                    dataIndex: 'title',
                    key: 'title',
                  },
                  {
                    title: 'Client',
                    dataIndex: 'client',
                    key: 'client',
                    render: (client) => client?.name || 'N/A',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => {
                      const color =
                        status === 'open' ? 'green' : status === 'pending' ? 'orange' : 'default';
                      return <Tag color={color}>{status}</Tag>;
                    },
                  },
                  {
                    title: 'Start Date',
                    dataIndex: 'start_date',
                    key: 'start_date',
                    render: (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A'),
                  },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Col>
          </Row>
        )}
      </Modal>

      {/* Total Clients Modal */}
      <Modal
        title="Total Clients"
        visible={clientsModalVisible}
        onCancel={handleClientsCancel}
        footer={null}
        width={800}
      >
        {loadingModalClients ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Total Clients"
                  value={modalClients.length}
                  valueStyle={{ fontSize: '24px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Table
                dataSource={modalClients}
                columns={[
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <Space>
                        <Avatar icon={<UserOutlined />} size="small" />
                        {text || record.username || 'N/A'}
                      </Space>
                    ),
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
                    render: (role) => <Tag>{role}</Tag>,
                  },
                  {
                    title: 'Phone',
                    dataIndex: 'phone_number',
                    key: 'phone_number',
                    render: (phone) => phone || 'N/A',
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          handleClientsCancel();
                          navigate(`/clients/${record.id}`);
                        }}
                      >
                        View
                      </Button>
                    ),
                  },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Col>
          </Row>
        )}
      </Modal>

      {/* Total Revenue Modal */}
      <Modal
        title="Revenue Summary"
        visible={revenueModalVisible}
        onCancel={handleRevenueCancel}
        footer={null}
        width={800}
      >
        {loadingModalRevenue ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Total Revenue"
                  value={financialData.totalRevenue || 0}
                  prefix="$"
                  valueStyle={{ fontSize: '24px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Total Expenses"
                  value={financialData.totalExpenses || 0}
                  prefix="$"
                  valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Net Profit"
                  value={financialData.netProfit || 0}
                  prefix="$"
                  valueStyle={{ fontSize: '24px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Profit Margin"
                  value={financialData.profitMargin ? financialData.profitMargin.toFixed(1) : 0}
                  suffix="%"
                  valueStyle={{ fontSize: '24px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Typography.Title level={5}>Recent Transactions</Typography.Title>
              <Table
                dataSource={modalRevenueTransactions}
                columns={[
                  {
                    title: 'Date',
                    dataIndex: 'date',
                    key: 'date',
                    render: (date) => moment(date).format('YYYY-MM-DD'),
                  },
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                  },
                  {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type) => (
                      <Tag color={type === 'income' ? 'green' : 'red'}>{type.toUpperCase()}</Tag>
                    ),
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => {
                      const colors = {
                        paid: 'green',
                        pending: 'orange',
                        overdue: 'red',
                        completed: 'blue',
                      };
                      return <Tag color={colors[status] || 'default'}>{status}</Tag>;
                    },
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount, record) => (
                      <span
                        style={{
                          color: record.type === 'income' ? '#38c172' : '#f5222d',
                          fontWeight: 600,
                        }}
                      >
                        {record.type === 'income' ? '+' : '-'}${amount}
                      </span>
                    ),
                  },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Col>
          </Row>
        )}
      </Modal>

      {/* Pending Invoices Modal */}
      <Modal
        title="Pending & Overdue Invoices"
        visible={invoicesModalVisible}
        onCancel={handleInvoicesCancel}
        footer={null}
        width={800}
      >
        {loadingModalInvoices ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Pending"
                  value={financialData.pendingInvoices || 0}
                  valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Overdue"
                  value={financialData.overdueInvoices || 0}
                  valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: isFuturistic
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isFuturistic ? '#1a1a24' : '#ffffff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid transparent',
                }}
              >
                <Statistic
                  title="Paid"
                  value={financialData.paidInvoices || 0}
                  valueStyle={{ fontSize: '24px', fontWeight: 600, color: '#38c172' }}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Table
                dataSource={modalInvoiceTransactions}
                columns={[
                  {
                    title: 'Invoice #',
                    dataIndex: 'description',
                    key: 'description',
                    render: (text) => text?.replace('Invoice #', '') || 'N/A',
                  },
                  {
                    title: 'Date',
                    dataIndex: 'date',
                    key: 'date',
                    render: (date) => moment(date).format('YYYY-MM-DD'),
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => {
                      const colorMap = { pending: 'orange', overdue: 'red', paid: 'green' };
                      return (
                        <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>
                      );
                    },
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount) => <span style={{ fontWeight: 600 }}>${amount}</span>,
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => {
                            handleInvoicesCancel();
                            navigate(`/invoices/${record.id}`);
                          }}
                        >
                          View
                        </Button>
                        {record.status === 'pending' && (
                          <Button
                            type="link"
                            size="small"
                            style={{ color: '#38c172' }}
                            onClick={() => {
                              // Mark as paid action could be added
                              message.info('Mark as paid functionality would go here');
                            }}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </Space>
                    ),
                  },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
}

export default Home;
