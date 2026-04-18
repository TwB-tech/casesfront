import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Filter,
  Search,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Tag as AntTag,
  message,
} from 'antd';
import { useCurrency } from "../contexts/CurrencyContext";
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import axiosInstance from '../axiosConfig';
import { formatCurrency } from '../utils/currency';
/* eslint-disable no-console */

const { Option } = Select;
const { TextArea } = Input;

const ExpenseManagement = () => {
  const { isFuturistic } = useTheme();
  const { currency } = useCurrency();
  const { currency } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const abortController = new AbortController();
    fetchExpenses(abortController.signal);
    return () => abortController.abort();
  }, []);

  const fetchExpenses = async (signal) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/expenses/', { signal });
      setExpenses(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      message.error('Failed to load expenses. Please try again.');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <AntTag color="blue">{category}</AntTag>,
      filters: [
        { text: 'Supplies', value: 'Supplies' },
        { text: 'Entertainment', value: 'Entertainment' },
        { text: 'Technology', value: 'Technology' },
        { text: 'Operations', value: 'Operations' },
        { text: 'Professional', value: 'Professional' },
        { text: 'Travel', value: 'Travel' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span className="font-semibold">{formatCurrency(amount, currency)}</span>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          approved: 'success',
          pending: 'warning',
          rejected: 'error',
        };
        const icons = {
          approved: <CheckCircle className="w-3 h-3 mr-1" />,
          pending: <Calendar className="w-3 h-3 mr-1" />,
          rejected: <XCircle className="w-3 h-3 mr-1" />,
        };
        return (
          <AntTag color={colors[status]} icon={icons[status]}>
            {status}
          </AntTag>
        );
      },
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Submitted By',
      dataIndex: 'submitted_by',
      key: 'submittedBy',
      render: (name) => <span>{name}</span>,
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
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Format date properly
      values.date = values.date.format('YYYY-MM-DD');
      await axiosInstance.post('/expenses/', values);
      message.success('Expense submitted successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchExpenses();
    } catch (error) {
      console.error('Error submitting expense:', error);
      message.error('Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Expense Management
              </h1>
              <p className={`text-lg ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
                Track, categorize, and manage all practice expenses
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
                Add Expense
              </Button>
              <Button
                size="large"
                icon={<Download className="w-4 h-4" />}
                className={isFuturistic ? 'border-cyber-border' : ''}
              >
                Export
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 max-w-xl">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                isFuturistic
                  ? 'bg-cyber-bg border border-cyber-border focus-within:border-aurora-primary'
                  : 'bg-white border border-neutral-200 shadow-sm'
              }`}
            >
              <Search
                className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}
                size={20}
              />
              <input
                type="text"
                placeholder="Search expenses by description or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  isFuturistic
                    ? 'text-aurora-text placeholder:text-aurora-muted'
                    : 'text-neutral-800'
                }`}
              />
              <Filter
                className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}
                size={20}
              />
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
              <DollarSign
                className={`w-6 h-6 ${isFuturistic ? 'text-aurora-primary' : 'text-blue-600'}`}
              />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Total This Month
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {formatCurrency(
                  expenses.reduce((sum, e) => sum + e.amount, 0),
                  currency
                )}
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
                Approved
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                $
                {expenses
                  .filter((e) => e.status === 'approved')
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString()}
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
                Pending
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                $
                {expenses
                  .filter((e) => e.status === 'pending')
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString()}
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
                Total Count
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {formatCurrency(
                  expenses.reduce((sum, e) => sum + e.amount, 0),
                  currency
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card
        className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
        styles={{ body: { padding: '24px' } }}
      >
        <Table
          dataSource={filteredExpenses}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} expenses`,
          }}
        />
      </Card>

      {/* Add Expense Modal */}
      <Modal
        title="Add New Expense"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="date"
            label="Expense Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={2} placeholder="Enter expense description" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              <Option value="Court Fees">Court Fees</Option>
              <Option value="Bar Dues">Bar Dues</Option>
              <Option value="Expert Witnesses">Expert Witnesses</Option>
              <Option value="Technology">Technology</Option>
              <Option value="Operations">Operations</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Professional">Professional</Option>
              <Option value="Travel">Travel</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount ($)"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <Input type="number" placeholder="0.00" />
          </Form.Item>
          <Form.Item name="receipt" label="Receipt Attachment">
            <Upload>
              <Button icon={<FileText className="w-4 h-4" />}>Upload Receipt</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Submit Expense
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpenseManagement;



