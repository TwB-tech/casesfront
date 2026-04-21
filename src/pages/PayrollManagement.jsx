import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, Plus, FileText, CheckCircle } from 'lucide-react';
import { Card, Table, Button, Modal, Form, DatePicker, Tag, message } from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import axiosInstance from '../axiosConfig';
/* eslint-disable no-console */

const PayrollManagement = () => {
  const { isFuturistic } = useTheme();
  const { currency } = useCurrency();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/payroll/');
      setPayrolls(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      message.error('Failed to load payroll data. Please try again.');
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Employees',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span className="font-semibold">{formatCurrency(amount, currency)}</span>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Payslips',
      dataIndex: 'payslips',
      key: 'payslips',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          processed: 'success',
          pending: 'warning',
          draft: 'default',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Date Processed',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, _record) => (
        <div className="flex gap-2">
          <Button size="small" type="link">
            View
          </Button>
          <Button size="small" type="link">
            Download
          </Button>
        </div>
      ),
    },
  ];

  const handleCreatePayroll = async (values) => {
    try {
      setLoading(true);
      // Format dates properly
      values.period = values.period.format('YYYY-MM');
      values.paymentDate = values.paymentDate.format('YYYY-MM-DD');
      await axiosInstance.post('/payroll/', values);
      message.success('Payroll created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchPayrolls();
    } catch (error) {
      console.error('Error creating payroll:', error);
      message.error('Failed to create payroll');
    } finally {
      setLoading(false);
    }
  };

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
                Payroll Management
              </h1>
              <p className={`text-lg ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
                Process employee payroll and generate payslips
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="primary"
                size="large"
                icon={<Plus className="w-4 h-4" />}
                className={isFuturistic ? 'futuristic-btn' : ''}
                style={{ background: isFuturistic ? '#6366f1' : undefined }}
                onClick={() => setIsModalVisible(true)}
              >
                Process Payroll
              </Button>
              <Button
                size="large"
                icon={<Download className="w-4 h-4" />}
                className={isFuturistic ? 'border-cyber-border' : ''}
              >
                Export Reports
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isFuturistic ? 'bg-aurora-primary/20' : 'bg-blue-100'
              }`}
            >
              <CreditCard
                className={`w-6 h-6 ${isFuturistic ? 'text-aurora-primary' : 'text-blue-600'}`}
              />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                This Period
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {formatCurrency(27500, currency)}
              </p>
            </div>
          </div>
        </Card>
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isFuturistic ? 'bg-green-500/20' : 'bg-green-100'
              }`}
            >
              <CheckCircle
                className={`w-6 h-6 ${isFuturistic ? 'text-green-500' : 'text-green-600'}`}
              />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Processed
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                3
              </p>
            </div>
          </div>
        </Card>
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isFuturistic ? 'bg-yellow-500/20' : 'bg-yellow-100'
              }`}
            >
              <Calendar
                className={`w-6 h-6 ${isFuturistic ? 'text-yellow-500' : 'text-yellow-600'}`}
              />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Next Payroll
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                May 30
              </p>
            </div>
          </div>
        </Card>
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isFuturistic ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}
            >
              <FileText
                className={`w-6 h-6 ${isFuturistic ? 'text-purple-500' : 'text-purple-600'}`}
              />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                YTD Total
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {formatCurrency(110000, currency)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payroll History Table */}
      <Card
        className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
        styles={{ body: { padding: '24px' } }}
        data-testid="payroll-table-card"
      >
        <Table
          dataSource={payrolls}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          data-testid="payroll-table"
        />
      </Card>

      {/* Create Payroll Modal */}
      <Modal
        title="Process New Payroll"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePayroll}>
          <Form.Item
            name="period"
            label="Payroll Period"
            rules={[{ required: true, message: 'Please select period' }]}
          >
            <DatePicker.MonthPicker style={{ width: '100%' }} placeholder="Select month" />
          </Form.Item>
          <Form.Item
            name="paymentDate"
            label="Payment Date"
            rules={[{ required: true, message: 'Please select payment date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Process Payroll
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PayrollManagement;
