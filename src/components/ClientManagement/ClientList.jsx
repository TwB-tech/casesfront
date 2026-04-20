import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Radio,
  Row,
  Col,
  Avatar,
  Space,
  Tag,
  Card,
  Input,
  Select,
  message,
  Skeleton,
  Pagination,
  Statistic,
} from 'antd';
import ClientCard from './ClientCard';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../../contexts/ThemeContext';
import eventBus from '../../utils/eventBus';

function ClientList() {
  const [clients, setClients] = useState([]);
  const [manualViewMode, setManualViewMode] = useState(
    () => sessionStorage.getItem('clientViewMode') || 'table'
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { isFuturistic } = useTheme();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const navigate = useNavigate();

  // Derive effective view mode: on mobile always use 'cards', otherwise use manual preference
  const viewMode = isSmallScreen ? 'cards' : manualViewMode;

  useEffect(() => {
    sessionStorage.setItem('clientViewMode', manualViewMode);
  }, [manualViewMode]);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/client/');
        const data = response.data.results;
        setClients(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        message.error('Failed to fetch clients. Please try again later.');
        setLoading(false);
      }
    };

    fetchClients();

    const handleClientChange = () => {
      fetchClients();
    };

    const unsub = [
      eventBus.on('clientCreated', handleClientChange),
      eventBus.on('clientUpdated', handleClientChange),
      eventBus.on('clientDeleted', handleClientChange),
    ];

    return () => {
      unsub.forEach((fn) => fn());
    };
  }, []);

  const handleRowClick = (client) => {
    navigate(`/clients-details/${client.id}`, { state: { client, viewMode } });
  };

  const handleNewClientClick = () => {
    navigate('/client-form');
  };

  const filteredClients = useMemo(() => {
    let result = clients;

    if (searchQuery) {
      result = result.filter((client) =>
        Object.values(client).some(
          (value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter((client) => client.status === statusFilter);
    }

    return result;
  }, [clients, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(
    () => ({
      total: clients.length,
      active: clients.filter((c) => c.status === 'Active').length,
      inactive: clients.filter((c) => c.status === 'Inactive').length,
    }),
    [clients]
  );

  // Paginated results
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredClients.slice(start, end);
  }, [filteredClients, currentPage, entriesPerPage]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Avatar src={record.profile} icon={!record.profile && <UserOutlined />} size={32} />
          <span style={{ color: isFuturistic ? '#f8fafc' : '#1e293b', fontWeight: 500 }}>
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <span style={{ color: isFuturistic ? '#e2e8f0' : '#475569' }}>{email}</span>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (phone) => <span style={{ color: '#64748b' }}>{phone}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={status === 'Active' ? 'green' : 'red'}
          style={{ borderRadius: '20px', padding: '4px 12px', fontWeight: 600 }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: isSmallScreen ? '16px' : '24px',
        marginTop: isSmallScreen ? '60px' : '0',
        background: isFuturistic ? '#12121a' : '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={8}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : 'none',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: isFuturistic ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
                  Total Clients
                </span>
              }
              value={stats.total}
              valueStyle={{
                color: isFuturistic ? '#f8fafc' : '#1e293b',
                fontWeight: 700,
                fontSize: '24px',
              }}
              prefix={
                <UserOutlined
                  style={{ color: isFuturistic ? '#6366f1' : '#3b82f6', marginRight: '8px' }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : 'none',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: isFuturistic ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
                  Active
                </span>
              }
              value={stats.active}
              valueStyle={{ color: '#22c55e', fontWeight: 700, fontSize: '24px' }}
              prefix={<CheckCircleOutlined style={{ marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card
            className={isFuturistic ? 'hover-glow' : ''}
            style={{
              borderRadius: '12px',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : 'none',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: isFuturistic ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
                  Inactive
                </span>
              }
              value={stats.inactive}
              valueStyle={{ color: '#ef4444', fontWeight: 700, fontSize: '24px' }}
              prefix={<StopOutlined style={{ marginRight: '8px' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card
        style={{
          borderRadius: '16px',
          background: isFuturistic ? '#1a1a24' : '#ffffff',
          border: isFuturistic ? '1px solid #2a2a3a' : 'none',
          boxShadow: isFuturistic ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <Row
          align="middle"
          justify="space-between"
          gutter={[16, 16]}
          style={{ marginBottom: '24px', flexWrap: 'wrap' }}
        >
          <Col>
            <h1
              style={{
                fontSize: isSmallScreen ? '20px' : '24px',
                fontWeight: 700,
                margin: 0,
                color: isFuturistic ? '#f8fafc' : '#1e293b',
              }}
            >
              CLIENT MANAGEMENT
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
              {filteredClients.length} clients found
            </p>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleNewClientClick}
              style={{
                borderRadius: '10px',
                background: isFuturistic ? '#6366f1' : '#3b82f6',
                border: 'none',
                fontWeight: 600,
              }}
            >
              New Client
            </Button>
          </Col>
        </Row>

        {/* Search & Filters Bar - Always at top */}
        <div style={{ marginBottom: '24px' }}>
          <Row gutter={[12, 12]} style={{ flexWrap: 'wrap' }}>
            <Col xs={24} sm={24} md={10}>
              <Input
                placeholder="Search by name, email, phone, ID, or address..."
                prefix={<SearchOutlined style={{ color: '#64748b' }} />}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                size="large"
                style={{
                  borderRadius: '10px',
                  width: '100%',
                }}
                allowClear
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                size="large"
                style={{ width: '100%', borderRadius: '10px' }}
              >
                <Select.Option value="All">All Status</Select.Option>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Select
                value={entriesPerPage}
                onChange={(value) => {
                  setEntriesPerPage(value);
                  setCurrentPage(1);
                }}
                size="large"
                style={{ width: '100%', borderRadius: '10px' }}
              >
                <Select.Option value={10}>10 / page</Select.Option>
                <Select.Option value={20}>20 / page</Select.Option>
                <Select.Option value={30}>30 / page</Select.Option>
              </Select>
            </Col>
            {!isSmallScreen && (
              <Col xs={24} sm={8} md={6}>
                <Radio.Group
                  value={viewMode}
                  onChange={(e) => setManualViewMode(e.target.value)}
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Radio.Button value="table">Table</Radio.Button>
                  <Radio.Button value="cards">Cards</Radio.Button>
                </Radio.Group>
              </Col>
            )}
          </Row>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          </div>
        ) : filteredClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <UserOutlined style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No clients found</h3>
            <p style={{ color: '#94a3b8' }}>
              {searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your filters or search query'
                : 'Add your first client to get started'}
            </p>
          </div>
        ) : viewMode === 'table' && !isSmallScreen ? (
          <Table
            dataSource={paginatedClients}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: 'pointer' },
            })}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {paginatedClients.map((clientInfo) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={clientInfo.id}>
                <ClientCard clientInfo={clientInfo} onClick={() => handleRowClick(clientInfo)} />
              </Col>
            ))}
          </Row>
        )}

        {/* Pagination */}
        {filteredClients.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: isSmallScreen ? 'center' : 'flex-end',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Pagination
              current={currentPage}
              pageSize={entriesPerPage}
              total={filteredClients.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={!isSmallScreen}
              showTotal={(total) => `Total ${total} clients`}
              size={isSmallScreen ? 'small' : 'default'}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default ClientList;
