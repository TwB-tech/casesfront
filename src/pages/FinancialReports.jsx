import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, Filter, BarChart3, 
  PieChart, TrendingUp, TrendingDown, DollarSign, Users
} from 'lucide-react';
import { Card, Button, DatePicker, Select, Table, Tag, Statistic } from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import axiosInstance from '../axiosConfig';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FinancialReports = () => {
  const { isFuturistic, themeConfig } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [reportType, setReportType] = useState('income');

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/reports/financial/');
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Fallback to sample data if API fails
      setReportData({
        incomeStatement: {
          totalRevenue: 125450,
          totalExpenses: 45230,
          netProfit: 80220,
          grossMargin: 64,
          revenueByMonth: [
            { month: 'Jan', revenue: 8500, expenses: 3200, profit: 5300 },
            { month: 'Feb', revenue: 9200, expenses: 3500, profit: 5700 },
            { month: 'Mar', revenue: 11500, expenses: 3800, profit: 7700 },
            { month: 'Apr', revenue: 10800, expenses: 4100, profit: 6700 },
            { month: 'May', revenue: 12400, expenses: 3900, profit: 8500 },
            { month: 'Jun', revenue: 14200, expenses: 4200, profit: 10000 },
          ],
          revenueByCategory: [
            { name: 'Corporate Law', value: 68200, color: '#6366f1' },
            { name: 'Commercial Litigation', value: 52500, color: '#8b5cf6' },
            { name: 'Real Estate', value: 31400, color: '#a78bfa' },
            { name: 'Family Law', value: 18300, color: '#c4b5fd' },
            { name: 'Intellectual Property', value: 15200, color: '#ddd6fe' },
            { name: 'Criminal Defense', value: 12100, color: '#ede9fe' },
          ],
          expenseBreakdown: [
            { name: 'Salaries', value: 28500 },
            { name: 'Operations', value: 8200 },
            { name: 'Marketing', value: 4500 },
            { name: 'Technology', value: 2800 },
            { name: 'Other', value: 1230 },
          ]
        },
        balanceSheet: {
          totalAssets: 245000,
          totalLiabilities: 85000,
          totalEquity: 160000,
          currentRatio: 2.88,
          debtToEquity: 0.53
        },
        topClients: [
          { id: 1, name: 'Acme Corporation', revenue: 24500, cases: 8, status: 'active' },
          { id: 2, name: 'Global Industries', revenue: 18200, cases: 5, status: 'active' },
          { id: 3, name: 'Tech Solutions Ltd', revenue: 15800, cases: 6, status: 'active' },
          { id: 4, name: 'Legal Partners Inc', revenue: 12400, cases: 4, status: 'inactive' },
          { id: 5, name: 'Smith & Associates', revenue: 9800, cases: 3, status: 'active' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const clientColumns = [
    {
      title: 'Client',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (val) => <span className="font-semibold">${val.toLocaleString()}</span>,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'Cases',
      dataIndex: 'cases',
      key: 'cases',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status}
        </Tag>
      ),
    },
  ];

  if (loading || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Breadcrumbs />
      
      {/* Header Section */}
      <div className={`relative overflow-hidden rounded-2xl mb-8 p-8 ${
        isFuturistic 
          ? 'bg-gradient-to-br from-cyber-surface via-cyber-bg to-cyber-card border border-cyber-border' 
          : 'bg-gradient-to-br from-primary-50 to-white border border-primary-100'
      }`}>
        {isFuturistic && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-aurora-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-aurora-secondary/10 rounded-full blur-3xl" />
          </>
        )}
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                isFuturistic ? 'text-aurora-text' : 'text-primary-900'
              }`}>
                Financial Reports
              </h1>
              <p className={`text-lg ${
                isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
              }`}>
                Comprehensive financial analytics and reporting
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select 
                value={reportType} 
                onChange={setReportType}
                style={{ width: 180 }}
                className={isFuturistic ? 'bg-cyber-bg' : ''}
              >
                <Option value="income">Income Statement</Option>
                <Option value="balance">Balance Sheet</Option>
                <Option value="cashflow">Cash Flow</Option>
                <Option value="clients">Client Revenue</Option>
              </Select>
              <RangePicker 
                onChange={setDateRange}
                className={isFuturistic ? 'bg-cyber-bg' : ''}
              />
              <Button 
                size="large"
                icon={<Download className="w-4 h-4" />}
                className={isFuturistic ? 'border-cyber-border' : ''}
              >
                Export PDF
              </Button>
              <Button 
                size="large"
                icon={<Download className="w-4 h-4" />}
                className={isFuturistic ? 'border-cyber-border' : ''}
              >
                Export Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <Statistic
            title={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>Total Revenue</span>}
            value={reportData.incomeStatement.totalRevenue}
            prefix="$"
            valueStyle={{ color: isFuturistic ? themeConfig.accent : '#102a43', fontWeight: 700 }}
            prefix={<DollarSign className="w-5 h-5 mr-2" />}
          />
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">12.5%</span>
            <span className={`ml-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>vs last period</span>
          </div>
        </Card>
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <Statistic
            title={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>Total Expenses</span>}
            value={reportData.incomeStatement.totalExpenses}
            prefix="$"
            valueStyle={{ color: isFuturistic ? '#f59e0b' : '#d97706', fontWeight: 700 }}
          />
          <div className="flex items-center mt-2 text-sm">
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">-3.2%</span>
            <span className={`ml-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>vs last period</span>
          </div>
        </Card>
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <Statistic
            title={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>Net Profit</span>}
            value={reportData.incomeStatement.netProfit}
            prefix="$"
            valueStyle={{ color: isFuturistic ? '#38c172' : '#22c55e', fontWeight: 700 }}
          />
          <div className="flex items-center mt-2">
            <span className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>Profit Margin: </span>
            <span className="text-sm font-semibold text-green-500 ml-1">
              {reportData.incomeStatement.grossMargin}%
            </span>
          </div>
        </Card>
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <Statistic
            title={<span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>Total Clients</span>}
            value={reportData.topClients.length}
            valueStyle={{ color: isFuturistic ? themeConfig.accent : '#102a43', fontWeight: 700 }}
            prefix={<Users className="w-5 h-5 mr-2" />}
          />
          <div className="flex items-center mt-2 text-sm">
            <span className="text-green-500">{reportData.topClients.filter(c => c.status === 'active').length} active</span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <Card 
          className={`lg:col-span-2 ${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
          title={<span className={isFuturistic ? 'text-aurora-text' : ''}>Revenue & Profit Trend</span>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.incomeStatement.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={isFuturistic ? '#2a2a3a' : '#e2e8f0'} />
              <XAxis 
                dataKey="month" 
                stroke={isFuturistic ? '#94a3b8' : '#64748b'}
              />
              <YAxis 
                stroke={isFuturistic ? '#94a3b8' : '#64748b'}
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isFuturistic ? '#1a1a24' : '#fff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
              <Bar 
                dataKey="revenue" 
                fill={isFuturistic ? '#6366f1' : '#3b82f6'}
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="profit" 
                fill={isFuturistic ? '#38c172' : '#22c55e'}
                name="Profit"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by Category */}
        <Card 
          className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
          title={<span className={isFuturistic ? 'text-aurora-text' : ''}>Revenue by Practice Area</span>}
        >
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={reportData.incomeStatement.revenueByCategory}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {reportData.incomeStatement.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
                contentStyle={{ 
                  backgroundColor: isFuturistic ? '#1a1a24' : '#fff',
                  border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {reportData.incomeStatement.revenueByCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
                    {cat.name}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  ${cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card 
        className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
        title={<span className={isFuturistic ? 'text-aurora-text' : ''}>Top Clients by Revenue</span>}
        extra={
          <Button type="link" onClick={() => window.location.href = '/clients'}>
            View All Clients
          </Button>
        }
      >
        <Table 
          dataSource={reportData.topClients}
          columns={clientColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default FinancialReports;
