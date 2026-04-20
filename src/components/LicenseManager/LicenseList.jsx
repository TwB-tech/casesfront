import React, { useState, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  DatePicker,
  Input,
  Select,
  Row,
  Col,
  Tooltip,
  message,
  Popconfirm,
  Empty,
  Modal,
  Form,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExportOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useLicense } from '../../contexts/LicenseContext';
import { formatLicenseKey } from '../../utils/license';

const { Title, Text } = Typography;
const { Option } = Select;

const LicenseList = () => {
  const [loading, setLoading] = useState(false);
  const [filteredLicenses, setFilteredLicenses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [renewForm] = Form.useForm();

  const { licenses, renewLicense, revokeLicense } = useLicense();

  const handleRenew = async (values) => {
    if (!selectedLicense) {
      return;
    }

    setLoading(true);
    const result = await renewLicense(selectedLicense.id, values.months);
    setLoading(false);

    if (result.success) {
      Modal.destroyAll();
      message.success(
        `License renewed until ${new Date(result.license.expiryDate).toLocaleDateString()}`
      );
      setRenewModalVisible(false);
      renewForm.resetFields();
    } else {
      message.error('Failed to renew license');
    }
  };

  const handleRevoke = async (licenseId) => {
    setLoading(true);
    const result = await revokeLicense(licenseId);
    setLoading(false);
    if (result.success) {
      message.success('License revoked');
    } else {
      message.error('Failed to revoke license');
    }
  };

  const handleExport = () => {
    const exportData = [
      [
        'License Key',
        'Client Name',
        'Organization',
        'Email',
        'Expiry Date',
        'Status',
        'Payment Status',
        'Amount (KES)',
        'Maintenance (KES)',
        'Created Date',
        'Created By',
      ].join(','),
      ...filteredLicenses.map((l) =>
        [
          l.licenseKey,
          l.clientName,
          l.organization,
          l.email,
          l.expiryDate,
          l.status,
          l.paymentStatus,
          l.amount,
          l.maintenanceFee,
          l.createdAt,
          l.createdBy,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([exportData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twb-license-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`Exported ${filteredLicenses.length} licenses`);
  };

  const getStatusTag = (license) => {
    const now = new Date();
    const expiry = new Date(license.expiryDate);

    if (license.status === 'revoked') {
      return <Tag color="default">Revoked</Tag>;
    }

    if (expiry < now) {
      return <Tag color="error">Expired</Tag>;
    }

    const daysLeft = Math.ceil((expiry - now) / (24 * 60 * 60 * 1000));
    if (daysLeft <= 30) {
      return <Tag color="warning">Expiring Soon ({daysLeft}d)</Tag>;
    }

    return <Tag color="success">Active</Tag>;
  };

  const columns = [
    {
      title: 'License Key',
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      render: (key) => (
        <Text
          code
          style={{
            fontSize: '12px',
            letterSpacing: '1px',
            cursor: 'pointer',
          }}
          onClick={() => {
            navigator.clipboard.writeText(key);
            message.success('Copied to clipboard');
          }}
          title="Click to copy"
        >
          {formatLicenseKey(key)}
        </Text>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      sorter: (a, b) => a.clientName.localeCompare(b.clientName),
    },
    {
      title: 'Organization',
      dataIndex: 'organization',
      key: 'organization',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      sorter: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
      render: (date) => (
        <Space>
          {CalendarOutlined}
          <span>{new Date(date).toLocaleDateString()}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => getStatusTag(record),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status === 'paid' ? '✓ Paid' : '⏳ Pending'}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `KES ${Number(amount).toLocaleString()}`,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="Copy key">
            <Button
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(record.licenseKey);
                message.success('Copied to clipboard');
              }}
            >
              Copy
            </Button>
          </Tooltip>

          <Tooltip title={record.paymentStatus === 'paid' ? 'Already paid' : 'Mark as paid'}>
            <Button
              size="small"
              type="link"
              onClick={() => {
                // Update payment status
                const { updateLicense } = require('../../utils/license');
                updateLicense(record.id, { paymentStatus: 'paid' });
                message.success('Marked as paid');
              }}
              disabled={record.paymentStatus === 'paid'}
            >
              <CheckCircleOutlined />
            </Button>
          </Tooltip>

          <Tooltip title="Renew license">
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setSelectedLicense(record);
                renewForm.setFieldsValue({ months: 12 });
                setRenewModalVisible(true);
              }}
            >
              <CalendarOutlined />
              Renew
            </Button>
          </Tooltip>

          <Tooltip title="Revoke license">
            <Popconfirm
              title="Revoke License"
              description="Are you sure you want to revoke this license? The user will lose access."
              onConfirm={() => handleRevoke(record.id)}
              okText="Revoke"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger>
                <CloseCircleOutlined />
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            License Management
          </Title>
          <Text type="secondary">Manage all issued licenses and track payments</Text>
        </Col>
        <Col>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            Export CSV
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Input
            placeholder="Search client, org, email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={12} sm={6}>
          <Select
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="all">All Statuses</Option>
            <Option value="active">Active</Option>
            <Option value="expired">Expired</Option>
            <Option value="revoked">Revoked</Option>
          </Select>
        </Col>
        <Col xs={12} sm={6}>
          <Select
            style={{ width: '100%' }}
            value={paymentFilter}
            onChange={(value) => setPaymentFilter(value)}
          >
            <Option value="all">All Payments</Option>
            <Option value="paid">Paid</Option>
            <Option value="pending">Pending</Option>
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            placeholder={['Start date', 'End date']}
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </Col>
      </Row>

      <Card>
        {filteredLicenses.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredLicenses}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} licenses`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            scroll={{ x: 1200 }}
          />
        ) : (
          <Empty
            description={
              searchText || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'No licenses match your filters'
                : 'No licenses issued yet'
            }
          >
            {!searchText && statusFilter === 'all' && paymentFilter === 'all' && (
              <Button type="primary" onClick={() => {}}>
                Generate First License
              </Button>
            )}
          </Empty>
        )}
      </Card>

      <Modal
        title="Renew License"
        open={renewModalVisible}
        onCancel={() => setRenewModalVisible(false)}
        footer={null}
        width={480}
      >
        {selectedLicense && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Client:</Text> {selectedLicense.clientName}
              <br />
              <Text strong>Current Expiry:</Text>{' '}
              {new Date(selectedLicense.expiryDate).toLocaleDateString()}
              <br />
              <Text strong>License Key:</Text>{' '}
              <Text code>{formatLicenseKey(selectedLicense.licenseKey)}</Text>
            </div>

            <Divider />

            <Form form={renewForm} onFinish={handleRenew} layout="vertical">
              <Form.Item
                name="months"
                label="Renewal Period"
                rules={[{ required: true, message: 'Select renewal period' }]}
                initialValue={12}
              >
                <Select>
                  <Option value={6}>6 months</Option>
                  <Option value={12}>12 months</Option>
                  <Option value={24}>24 months</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Confirm Renewal ({`KES ${selectedLicense.maintenanceFee.toLocaleString()}`} per
                    renewal period)
                  </Button>
                  <Button onClick={() => setRenewModalVisible(false)}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LicenseList;
