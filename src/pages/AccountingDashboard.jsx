import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, Statistic, Progress, Tag, Table, Button, message } from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

const AccountingDashboard = () => {
  const { isFuturistic } = useTheme();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const abortController = new AbortController();

    fetchDashboardData(abortController.signal);

    return () => abortController.abort();
  }, []);

  const fetchDashboardData = async (signal) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/accounting/dashboard', { signal });
      setDashboardData(response.data);
    } catch (error) {
      message.error('Failed to load dashboard data. Please try again.');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const revenueColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className={amount > 0 ? 'text-green-600' : 'text-red-600'}>
          ${Math.abs(amount).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'error'}
        >
          {status}
        </Tag>
      ),
    },
  ];

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      {/* Header Section */}
      <div
        className={`relative overflow-hidden rounded-2xl mb-8 p-8 ${
          isFuturistic
            ? 'bg-gradient-to-br from-cyber-surface via-cyber-bg to-cyber-card border border-cyber-border'
            : 'bg-gradient-to-br from-primary-50 to-white border border-primary-100'
        }`}
      >
        {isFuturistic && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-aurora-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-aurora-secondary/10 rounded-full blur-3xl" />
          </>
        )}

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className={`text-3xl md:text-4xl font-bold mb-2 ${
                  isFuturistic ? 'text-aurora-text' : 'text-primary-900'
                }`}
              >
                Accounting Dashboard
              </h1>
              <p className={`text-lg ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
                Complete financial overview for your practice
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="primary"
                size="large"
                className={isFuturistic ? 'futuristic-btn' : ''}
                style={{ background: isFuturistic ? '#6366f1' : undefined }}
                onClick={() => navigate('/new-invoice')}
              >
                <FileText className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button
                size="large"
                className={isFuturistic ? 'border-cyber-border' : ''}
                onClick={() => navigate('/expenses')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <Card
          className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
          styles={{ body: { padding: '24px' } }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm mb-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                Total Revenue
              </p>
              <Statistic
                value={dashboardData.totalRevenue}
                prefix="$"
                valueStyle={{
                  color: isFuturistic ? '#6366f1' : '#102a43',
                  fontWeight: 700,
                  fontSize: '28px',
                }}
              />
              <div className="flex items-center mt-2 text-sm">
                {dashboardData.revenueGrowth > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span
                  className={dashboardData.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}
                >
                  {Math.abs(dashboardData.revenueGrowth)}%
                </span>
                <span className={`ml-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                  vs last month
                </span>
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isFuturistic ? 'bg-aurora-primary/20' : 'bg-green-100'
              }`}
            >
              <TrendingUp
                className={`w-6 h-6 ${isFuturistic ? 'text-aurora-primary' : 'text-green-600'}`}
              />
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card
          className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
          styles={{ body: { padding: '24px' } }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm mb-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                Total Expenses
              </p>
              <Statistic
                value={dashboardData.totalExpenses}
                prefix="$"
                valueStyle={{
                  color: isFuturistic ? '#f59e0b' : '#d97706',
                  fontWeight: 700,
                  fontSize: '28px',
                }}
              />
              <div className="flex items-center mt-2 text-sm">
                {dashboardData.expenseGrowth > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span
                  className={dashboardData.expenseGrowth > 0 ? 'text-red-500' : 'text-green-500'}
                >
                  {Math.abs(dashboardData.expenseGrowth)}%
                </span>
                <span className={`ml-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                  vs last month
                </span>
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isFuturistic ? 'bg-aurora-secondary/20' : 'bg-amber-100'
              }`}
            >
              <TrendingDown
                className={`w-6 h-6 ${isFuturistic ? 'text-aurora-secondary' : 'text-amber-600'}`}
              />
            </div>
          </div>
        </Card>

        {/* Net Profit */}
        <Card
          className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
          styles={{ body: { padding: '24px' } }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm mb-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                Net Profit
              </p>
              <Statistic
                value={dashboardData.netProfit}
                prefix="$"
                valueStyle={{
                  color: isFuturistic ? '#38c172' : '#22c55e',
                  fontWeight: 700,
                  fontSize: '28px',
                }}
              />
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                  >
                    Profit Margin
                  </span>
                  <span className="text-sm font-medium text-green-500">
                    {dashboardData.profitMargin}%
                  </span>
                </div>
                <Progress
                  percent={dashboardData.profitMargin}
                  showInfo={false}
                  strokeColor="#38c172"
                  size="small"
                />
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isFuturistic ? 'bg-green-500/20' : 'bg-green-100'
              }`}
            >
              <CreditCard
                className={`w-6 h-6 ${isFuturistic ? 'text-green-500' : 'text-green-600'}`}
              />
            </div>
          </div>
        </Card>

        {/* Pending Invoices */}
        <Card
          className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
          styles={{ body: { padding: '24px' } }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm mb-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                Pending Invoices
              </p>
              <Statistic
                value={dashboardData.pendingInvoices}
                valueStyle={{
                  color: isFuturistic ? '#6366f1' : '#102a43',
                  fontWeight: 700,
                  fontSize: '28px',
                }}
              />
              <div className="flex items-center mt-2 gap-2">
                <Tag color="warning">
                  <Clock className="w-3 h-3 mr-1" />
                  {dashboardData.pendingInvoices} pending
                </Tag>
                <Tag color="error">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {dashboardData.overdueInvoices} overdue
                </Tag>
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isFuturistic ? 'bg-aurora-primary/20' : 'bg-blue-100'
              }`}
            >
              <FileText
                className={`w-6 h-6 ${isFuturistic ? 'text-aurora-primary' : 'text-blue-600'}`}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <Card
          className={`lg:col-span-2 ${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
          title={
            <span className={isFuturistic ? 'text-aurora-text' : ''}>
              Revenue vs Expenses Trend
            </span>
          }
          styles={{ body: { padding: '24px' } }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke={isFuturistic ? '#2a2a3a' : '#e2e8f0'} />
              <XAxis dataKey="month" stroke={isFuturistic ? '#94a3b8' : '#64748b'} />
              <YAxis
                stroke={isFuturistic ? '#94a3b8' : '#64748b'}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isFuturistic ? '#1a1a24' : '#fff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={isFuturistic ? '#6366f1' : '#3b82f6'}
                strokeWidth={3}
                dot={{ fill: isFuturistic ? '#6366f1' : '#3b82f6' }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={isFuturistic ? '#f59e0b' : '#f59e0b'}
                strokeWidth={3}
                dot={{ fill: isFuturistic ? '#f59e0b' : '#f59e0b' }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Expense Breakdown */}
        <Card
          className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
          title={<span className={isFuturistic ? 'text-aurora-text' : ''}>Expense Breakdown</span>}
          styles={{ body: { padding: '24px' } }}
        >
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={dashboardData.expenseCategories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dashboardData.expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: isFuturistic ? '#1a1a24' : '#fff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dashboardData.expenseCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span
                  className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}
                >
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card
        className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
        title={<span className={isFuturistic ? 'text-aurora-text' : ''}>Recent Transactions</span>}
        extra={
          <Button type="link" onClick={() => navigate('/transactions')}>
            View All
          </Button>
        }
        styles={{ body: { padding: '24px' } }}
      >
        <Table
          dataSource={dashboardData.recentTransactions}
          columns={revenueColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AccountingDashboard;
