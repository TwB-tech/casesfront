import React, { useState, useEffect } from 'react';
import { Table, Button, Radio, Row, Col, Avatar, Space, Tag, Card, Input, Select, message, Skeleton,  Pagination } from 'antd';
import ClientCard from './ClientCard';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { UserOutlined } from '@ant-design/icons';

function ClientList() {
  const [clients, setClients] = useState([]);
  const [viewMode, setViewMode] = useState(sessionStorage.getItem('viewMode') || 'table');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem('viewMode', viewMode);
  }, [viewMode]);


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
  }, []);

  const handleRowClick = (client) => {
    navigate(`/clients-details/${client.id}`, { state: { client, viewMode } });
  };

  const filterClients = (clients) => {
    let filteredClients = clients;

    if (searchQuery) {
      filteredClients = filteredClients.filter(client =>
        Object.values(client).some(value =>
          value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'All') {
      filteredClients = filteredClients.filter(client => client.status === statusFilter);
    }

    return filteredClients;
  };

  const filteredClients = filterClients(clients);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Avatar src={record.profile} icon={!record.profile && <UserOutlined />} />
          {text}
        </Space>
      ),
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.username.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.email.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: 'Male', value: 'Male' },
        { text: 'Female', value: 'Female' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      key: 'phone_number',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.phone_number.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'ID Number',
      dataIndex: 'id_number',
      key: 'id_number',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search ID number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.id_number.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Passport Number',
      dataIndex: 'passport_number',
      key: 'passport_number',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search passport number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.passport_number.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Date of Birth',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
    },
    {
      title: 'Residential Address',
      dataIndex: 'address',
      key: 'address',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.address.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Nationality',
      dataIndex: 'nationality',
      key: 'nationality',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search nationality"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.nationality.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Occupation',
      dataIndex: 'occupation',
      key: 'occupation',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search occupation"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.occupation.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Marital Status',
      dataIndex: 'marital_status',
      key: 'marital_status',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search marital status"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <UserOutlined />,
      onFilter: (value, record) => record.marital_status.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'} style={{ borderColor: status === 'Active' ? 'green' : 'red' }}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '2px' }}>
      <Card style={{ marginBottom: '20px', borderRadius: '12px', overflowX: 'auto', width: '100%', marginTop:"40px"  }}>
        <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '40px' }}>Client List</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{ marginBottom: '20px' }}
          >
            <Radio.Button value="table">Table View</Radio.Button>
            <Radio.Button value="cards">Card View</Radio.Button>
          </Radio.Group>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              placeholder="Search clients"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '180px', marginRight: '10px' }}
            />
            <Select
              defaultValue="All"
              style={{ width: 120, marginRight: '10px' }}
              onChange={(value) => setStatusFilter(value)}
            >
              <Select.Option value="All">All</Select.Option>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
            <Select
              defaultValue={10}
              style={{ width: 80 }}
              onChange={(value) => {
                setEntriesPerPage(value);
                setCurrentPage(1);
              }}
            >
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={30}>30</Select.Option>
            </Select>
          </div>
        </div>
        {
        loading ? (
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        ) : 
        viewMode === 'table' ? (
          <Table
            dataSource={filteredClients}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            pagination={false}
            style={{ cursor: 'pointer', overflowX: 'auto' }}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredClients.map((clientInfo) => (
              <Col xs={24} sm={12} md={8} lg={6} key={clientInfo.id}>
                <ClientCard
                  clientInfo={clientInfo}
                  onClick={() => handleRowClick(clientInfo)}
                />
              </Col>
            ))}
          </Row>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '10px',
            position: 'relative',
          }}
        >
          <Pagination
            current={currentPage}
            pageSize={entriesPerPage}
            total={filteredClients.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </Card>
    </div>
  );
}

export default ClientList;
