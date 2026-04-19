import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  FileText,
  Award,
  Briefcase,
  CheckCircle,
  XCircle,
  Download,
  Mail,
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
  Tag,
  Avatar,
  Statistic,
  message,
  Tabs,
} from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import axiosInstance from '../axiosConfig';
/* eslint-disable no-console */

const { Option } = Select;

const HRManagement = () => {
  const { isFuturistic } = useTheme();
  const { currency } = useCurrency();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hr/employees/');
      const employeesData = response.data.results || response.data;
      // Map API user object to table row shape
      const mapped = employeesData.map((emp) => ({
        id: emp.id,
        name: emp.username || emp.email,
        email: emp.email,
        role: emp.role || 'employee',
        department: emp.department || 'General',
        billableRate: emp.billable_rate || '$150/hr',
        utilization: emp.utilization || 85,
        status: emp.status || 'Active',
        leaveBalance: emp.leave_balance || 30,
        avatar: null,
        currentLeave: null,
      }));
      setEmployees(mapped);
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to load employees. Please try again.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const employeeColumns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            style={{
              background: isFuturistic ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#3b82f6',
              fontWeight: 600,
            }}
          >
            {text?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <div>
            <p className="font-medium m-0">{text}</p>
            <p className={`text-sm m-0 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
              {record.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <span className="capitalize">{role?.replace('_', ' ')}</span>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <Tag color="blue">{dept || 'N/A'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Active' ? 'success' : status === 'on_leave' ? 'warning' : 'error';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
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

  const tabItems = [
    {
      key: 'employees',
      label: 'Employees',
    },
    {
      key: 'leave',
      label: 'Leave Requests',
    },
    {
      key: 'payroll',
      label: 'Payroll',
    },
    {
      key: 'documents',
      label: 'Documents',
    },
  ];

  const handleAddEmployee = async (values) => {
    try {
      setLoading(true);
      // Map form values to API payload
      const payload = {
        full_name: values.name,
        email: values.email,
        role: values.role,
        department: values.department,
        hire_date: values.joinDate.format('YYYY-MM-DD'),
        salary: values.salary,
        phone_number: '',
        address: '',
      };
      await axiosInstance.post('/hr/employees/', payload);
      message.success('Employee added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      message.error('Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteEmployee = async (values) => {
    try {
      setLoading(true);
      // Simulate invite API call; adjust endpoint as needed
      await axiosInstance.post('/hr/invites/', values);
      message.success('Invitation sent successfully');
      setIsInviteModalVisible(false);
      inviteForm.resetFields();
    } catch (error) {
      console.error('Error sending invite:', error);
      message.error('Failed to send invite. Please try again.');
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
          {/* Leadership Quick Status Indicators */}
          <div className="flex flex-wrap gap-3 mb-6">
            {employees
              .filter((e) => e.status === 'on_leave')
              .map((emp) => (
                <Tag
                  key={emp.id}
                  color="warning"
                  icon={<Calendar className="w-3 h-3" />}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {emp.name} - On Leave
                </Tag>
              ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className={`text-3xl md:text-4xl font-bold mb-2 ${
                  isFuturistic ? 'text-aurora-text' : 'text-primary-900'
                }`}
              >
                Human Resources
              </h1>
              <p className={`text-lg ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
                Manage employees, leave, payroll, and team documents
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="primary"
                size="large"
                icon={<UserPlus className="w-4 h-4" />}
                className={isFuturistic ? 'futuristic-btn' : ''}
                style={{ background: isFuturistic ? '#6366f1' : undefined }}
                onClick={() => setIsModalVisible(true)}
              >
                Add Employee
              </Button>
              <Button
                size="large"
                icon={<Mail className="w-4 h-4" />}
                className={isFuturistic ? 'border-cyber-border' : ''}
                onClick={() => setIsInviteModalVisible(true)}
              >
                Invite Employee
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
              <Users
                className={`w-6 h-6 ${isFuturistic ? 'text-aurora-primary' : 'text-blue-600'}`}
              />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Total Employees
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {employees.length}
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
              <Briefcase
                className={`w-6 h-6 ${isFuturistic ? 'text-green-500' : 'text-green-600'}`}
              />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Active
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {employees.filter((e) => e.status === 'active').length}
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
                On Leave
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {employees.filter((e) => e.status === 'on_leave').length}
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
              <Award
                className={`w-6 h-6 ${isFuturistic ? 'text-purple-500' : 'text-purple-600'}`}
              />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Departments
              </p>
              <p
                className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                5
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card
        className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
        styles={{ body: { padding: '0' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className={isFuturistic ? 'p-6 pb-0' : 'p-6 pb-0'}
        />

        <div className="p-6">
          {activeTab === 'employees' && (
            <>
              <div className="mb-4 flex flex-wrap gap-4">
                <Select
                  placeholder="Filter by Department"
                  style={{ width: 200 }}
                  allowClear
                  onChange={(value) => setFilterDept(value)}
                  value={filterDept || undefined}
                >
                  <Option value="">All Departments</Option>
                  {Array.from(new Set(employees.map((e) => e.department).filter(Boolean))).map(
                    (dept) => (
                      <Option key={dept} value={dept}>
                        {dept}
                      </Option>
                    )
                  )}
                </Select>
                <Select
                  placeholder="Filter by Role"
                  style={{ width: 200 }}
                  allowClear
                  onChange={(value) => setFilterRole(value)}
                  value={filterRole || undefined}
                >
                  <Option value="">All Roles</Option>
                  {Array.from(new Set(employees.map((e) => e.role).filter(Boolean))).map((role) => (
                    <Option key={role} value={role}>
                      {role}
                    </Option>
                  ))}
                </Select>
              </div>
              <Table
                dataSource={employees.filter((emp) => {
                  if (filterDept && emp.department !== filterDept) {
                    return false;
                  }
                  if (filterRole && emp.role !== filterRole) {
                    return false;
                  }
                  return true;
                })}
                columns={employeeColumns}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
              />
            </>
          )}

          {activeTab === 'leave' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className={isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}>
                  <Statistic
                    title="Pending Requests"
                    value={3}
                    valueStyle={{ color: '#faad14', fontWeight: 600 }}
                    prefix={<Clock className="mr-2" />}
                  />
                </Card>
                <Card className={isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}>
                  <Statistic
                    title="Approved This Month"
                    value={8}
                    valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                    prefix={<CheckCircle className="mr-2" />}
                  />
                </Card>
                <Card className={isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}>
                  <Statistic
                    title="Total Leave Days Used"
                    value={47}
                    valueStyle={{ color: '#1890ff', fontWeight: 600 }}
                    prefix={<Calendar className="mr-2" />}
                  />
                </Card>
              </div>

              <h4 className="text-lg font-semibold mb-4">Current Leave Status</h4>
              <div className="mb-6">
                {employees
                  .filter((e) => e.status === 'on_leave')
                  .map((emp) => (
                    <Card
                      key={emp.id}
                      className={`mb-3 ${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            size={40}
                            style={{
                              background: isFuturistic
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : '#3b82f6',
                              fontWeight: 600,
                            }}
                          >
                            {emp.avatar}
                          </Avatar>
                          <div>
                            <p className="font-medium m-0">{emp.name}</p>
                            <p
                              className={`text-sm m-0 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                            >
                              {emp.currentLeave?.type || 'Annual Leave'} â€¢{' '}
                              {emp.currentLeave?.daysRemaining || 0} days remaining
                            </p>
                          </div>
                        </div>
                        <Tag color="warning">
                          {emp.currentLeave?.startDate || 'N/A'} -{' '}
                          {emp.currentLeave?.endDate || 'N/A'}
                        </Tag>
                      </div>
                    </Card>
                  ))}
              </div>

              <h4 className="text-lg font-semibold mb-4">Leave Request History</h4>
              <Table
                dataSource={[
                  {
                    id: 1,
                    employee: 'Sarah Mitchell',
                    type: 'Annual Leave',
                    startDate: '2024-05-01',
                    endDate: '2024-05-05',
                    days: 5,
                    status: 'pending',
                  },
                  {
                    id: 2,
                    employee: 'Michael Chen',
                    type: 'Sick Leave',
                    startDate: '2024-04-08',
                    endDate: '2024-04-10',
                    days: 3,
                    status: 'approved',
                  },
                  {
                    id: 3,
                    employee: 'Amanda Rodriguez',
                    type: 'Personal Leave',
                    startDate: '2024-04-01',
                    endDate: '2024-04-02',
                    days: 2,
                    status: 'approved',
                  },
                ]}
                columns={[
                  { title: 'Employee', dataIndex: 'employee', key: 'employee' },
                  {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type',
                    render: (t) => <Tag color="blue">{t}</Tag>,
                  },
                  {
                    title: 'Period',
                    key: 'period',
                    render: (_, r) => `${r.startDate} to ${r.endDate}`,
                  },
                  { title: 'Days', dataIndex: 'days', key: 'days' },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (s) => (
                      <Tag
                        color={s === 'approved' ? 'success' : s === 'pending' ? 'warning' : 'error'}
                      >
                        {s}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: () => (
                      <div className="flex gap-2">
                        <Button size="small" type="primary">
                          Approve
                        </Button>
                        <Button size="small" danger>
                          Decline
                        </Button>
                      </div>
                    ),
                  },
                ]}
                rowKey="id"
                pagination={false}
              />
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="text-center py-12">
              <FileText
                className={`w-16 h-16 mx-auto mb-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}`}
              />
              <h3
                className={`text-xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                Payroll Management
              </h3>
              <p className={`${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
                Payroll processing and history coming soon
              </p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-center py-12">
              <FileText
                className={`w-16 h-16 mx-auto mb-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}`}
              />
              <h3
                className={`text-xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                HR Documents
              </h3>
              <p className={`${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
                Employee document management coming soon
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Employee Modal */}
      <Modal
        title="Add New Employee"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEmployee}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' },
            ]}
          >
            <Input placeholder="email@company.com" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Option value="partner">Partner</Option>
              <Option value="associate">Associate</Option>
              <Option value="paralegal">Paralegal</Option>
              <Option value="advocate">Advocate</Option>
              <Option value="researcher">Legal Researcher</Option>
              <Option value="manager">Office Manager</Option>
              <Option value="admin">Administrator</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select placeholder="Select department">
              <Option value="litigation">Litigation</Option>
              <Option value="corporate">Corporate</Option>
              <Option value="research">Research</Option>
              <Option value="administration">Administration</Option>
              <Option value="marketing">Marketing</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="joinDate"
            label="Join Date"
            rules={[{ required: true, message: 'Please select join date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="salary"
            label="Salary ($)"
            rules={[{ required: true, message: 'Please enter salary' }]}
          >
            <Input type="number" placeholder="0.00" />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Add Employee
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Invite Employee Modal */}
      <Modal
        title="Invite Employee"
        open={isInviteModalVisible}
        onCancel={() => setIsInviteModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={inviteForm} layout="vertical" onFinish={handleInviteEmployee}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' },
            ]}
          >
            <Input placeholder="employee@company.com" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Option value="partner">Partner</Option>
              <Option value="associate">Associate</Option>
              <Option value="paralegal">Paralegal</Option>
              <Option value="legal_researcher">Legal Researcher</Option>
              <Option value="office_manager">Office Manager</Option>
              <Option value="administrator">Administrator</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select placeholder="Select department">
              <Option value="litigation">Litigation</Option>
              <Option value="corporate">Corporate</Option>
              <Option value="research">Research</Option>
              <Option value="administration">Administration</Option>
              <Option value="marketing">Marketing</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setIsInviteModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Send Invite
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HRManagement;
