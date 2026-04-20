import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Table,
  Tooltip,
} from 'antd';
import {
  KeyOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useLicense } from '../../contexts/LicenseContext';
import { generateLicenseKey, formatLicenseKey } from '../../utils/license';

const { Title, Text } = Typography;
const { Option } = Select;

const LicenseForm = () => {
  const [batchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState([]);
  const [savedLicenses, setSavedLicenses] = useState([]);
  const { createLicense, licenses: allLicenses } = useLicense();

  const handlePreviewBatch = async (values) => {
    const { count, expiryDate, clientName, organization, email, amount, maintenanceFee, domain } =
      values;

    if (!count || count < 1 || count > 100) {
      message.error('Batch size must be between 1 and 100');
      return;
    }

    if (!expiryDate) {
      message.error('Please select an expiry date');
      return;
    }

    const keys = [];
    for (let i = 0; i < count; i++) {
      keys.push({
        licenseKey: generateLicenseKey(),
        clientName: clientName || 'Unassigned',
        organization: organization || '',
        email: email || '',
        expiryDate: expiryDate.format('YYYY-MM-DD'),
        amount: amount || 250000,
        maintenanceFee: maintenanceFee || 40000,
        allowedDomain: domain || null,
      });
    }

    setGeneratedKeys(keys);
  };

  const handleSaveLicense = async (licenseData) => {
    setLoading(true);
    try {
      const result = await createLicense({
        ...licenseData,
        createdBy: 'Tony Kamau',
        paymentStatus: 'pending',
        status: 'active',
      });

      if (result.success) {
        setGeneratedKeys([]);
        batchForm.resetFields();
        message.success(`License ${licenseData.licenseKey} saved`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSave = async () => {
    if (generatedKeys.length === 0) {
      message.warning('No licenses to save');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const keyData of generatedKeys) {
      try {
        await createLicense({
          ...keyData,
          createdBy: 'Tony Kamau',
          paymentStatus: 'pending',
          status: 'active',
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error('Failed to save license:', error);
      }
    }

    setLoading(false);
    setGeneratedKeys([]);
    batchForm.resetFields();
    message.info(`Batch saved: ${successCount} created, ${errorCount} failed`);
  };

  const handleClearBatch = () => {
    setGeneratedKeys([]);
    batchForm.resetFields();
  };

  const handleExportKeys = (keys = generatedKeys) => {
    if (keys.length === 0) {
      message.warning('No keys to export');
      return;
    }

    const csvContent = [
      [
        'License Key',
        'Client Name',
        'Organization',
        'Email',
        'Expiry Date',
        'Amount (KES)',
        'Maintenance (KES)',
      ].join(','),
      ...keys.map((k) =>
        [
          k.licenseKey,
          k.clientName,
          k.organization,
          k.email,
          k.expiryDate,
          k.amount,
          k.maintenanceFee,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twb-licenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`Exported ${keys.length} license keys`);
  };

  useEffect(() => {
    // Filter only licenses created in this session for display
    setSavedLicenses(allLicenses.filter((l) => l.createdBy === 'Tony Kamau').slice(-10));
  }, [allLicenses]);

  const columns = [
    {
      title: 'License Key',
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      render: (key) => (
        <Text code style={{ fontSize: '12px' }}>
          {formatLicenseKey(key)}
        </Text>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Org',
      dataIndex: 'organization',
      key: 'organization',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status === 'paid' ? 'Paid' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
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
          <Tooltip title="Mark as paid">
            <Button
              size="small"
              type="link"
              onClick={() => {
                // Mark as paid
                const { updateLicense } = require('../../utils/license');
                updateLicense(record.id, { paymentStatus: 'paid' });
                message.success('Marked as paid');
              }}
              disabled={record.paymentStatus === 'paid'}
            >
              ✓ Paid
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>License Management</Title>
      <Text type="secondary">
        Generate and manage license keys for clients. Each license costs 250,000 KES initial +
        40,000 KES quarterly maintenance.
      </Text>

      <Divider />

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card
            title="Generate License Keys"
            extra={
              <Tooltip title="Generate batch and save to system">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => batchForm.submit()}>
                  Batch Generate
                </Button>
              </Tooltip>
            }
          >
            <Form form={batchForm} onFinish={handlePreviewBatch} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="count"
                    label="Number of Keys"
                    rules={[{ required: true, message: 'Required' }]}
                    initialValue={1}
                  >
                    <Select>
                      <Option value={1}>1 key</Option>
                      <Option value={5}>5 keys</Option>
                      <Option value={10}>10 keys</Option>
                      <Option value={25}>25 keys</Option>
                      <Option value={50}>50 keys</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="expiryDate"
                    label="Expiry Date"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="clientName" label="Client Name (Optional)">
                    <Input placeholder="Law Firm XYZ" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="organization" label="Organization">
                    <Input placeholder="xyz.co.ke" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email" label="Email">
                    <Input placeholder="admin@firm.co.ke" type="email" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="amount" label="Initial Fee (KES)" initialValue={250000}>
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maintenanceFee"
                    label="Quarterly Maintenance (KES)"
                    initialValue={40000}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="domain" label="Allowed Domain (Optional)">
                    <Input placeholder="firm.co.ke" />
                  </Form.Item>
                </Col>
              </Row>

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="default"
                  onClick={() => {
                    const key = generateLicenseKey();
                    navigator.clipboard.writeText(key);
                    message.success('Generated key copied to clipboard');
                  }}
                  icon={<KeyOutlined />}
                >
                  Generate Single Key
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Batch Preview"
            extra={
              generatedKeys.length > 0 && (
                <Space>
                  <Button
                    icon={<ExportOutlined />}
                    onClick={() => handleExportKeys()}
                    disabled={loading}
                  >
                    Export CSV
                  </Button>
                  <Button onClick={handleClearBatch}>Clear</Button>
                </Space>
              )
            }
          >
            {generatedKeys.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <KeyOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
                <p>Generate keys to preview them here</p>
                <Text type="secondary">
                  Keys are not saved until you click &quot;Batch Generate&quot; and then confirm
                  each one
                </Text>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Tag color="blue">{generatedKeys.length} keys generated</Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Review and save individually
                  </Text>
                </div>

                {generatedKeys.map((keyData, idx) => (
                  <Card
                    key={idx}
                    size="small"
                    style={{
                      marginBottom: 8,
                      borderColor: '#8b5cf6',
                      borderWidth: 1,
                    }}
                  >
                    <Row justify="space-between" align="middle">
                      <Col flex="auto">
                        <Space direction="vertical" size={0}>
                          <Text strong style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
                            {formatLicenseKey(keyData.licenseKey)}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {keyData.clientName} • Expires:{' '}
                            {new Date(keyData.expiryDate).toLocaleDateString()}
                          </Text>
                        </Space>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleSaveLicense(keyData)}
                          loading={loading && generatedKeys.length === 1}
                          icon={<CheckCircleOutlined />}
                        >
                          Save
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}

                {generatedKeys.length > 0 && (
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Button type="primary" onClick={handleBatchSave} loading={loading} block>
                      Save All {generatedKeys.length} Licenses
                    </Button>
                    <Text
                      type="secondary"
                      style={{ fontSize: '11px', display: 'block', marginTop: 8 }}
                    >
                      Bulk save all generated keys to the system
                    </Text>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Recently Created Licenses</Divider>
      {savedLicenses.length > 0 ? (
        <Table
          columns={columns}
          dataSource={savedLicenses}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <ClockCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
          <p>No licenses created yet</p>
        </div>
      )}
    </div>
  );
};

export default LicenseForm;
