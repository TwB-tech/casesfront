import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Avatar, Descriptions, Button, Tag, Space, Table, Tabs, Pagination } from 'antd';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const ClientDetails = () => {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [client, setClient] = useState(state?.client || null);

   useEffect(() => {
     const fetchCases = async () => {
       try {
         const response = await axiosInstance.get(`/case/individual-cases/`);
         const allCases = response.data.results || response.data || [];
         // Filter cases to only those belonging to this client
         const clientCases = allCases.filter(c => Number(c.client_id) === Number(id));
         setCases(clientCases);
       } catch (error) {
         console.error('Error fetching cases:', error);
       }
     };

     fetchCases();
   }, [id]);

   useEffect(() => {
     if (client) {return;}
     axiosInstance.get(`/client/${id}/`).then((response) => {
       setClient(response.data || null);
     }).catch(error => {
       console.error('Error fetching client:', error);
       setClient(null);
     });
   }, [client, id]);

  const columns = [
    {
      title: 'Case Number',
      dataIndex: 'case_number',
      key: 'case_number',
    },
    {
      title: 'Client',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.profile} icon={!record.profile && <UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Advocate',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Court',
      dataIndex: 'court_name',
      key: 'court_name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'open' ? 'blue' : status === 'closed' ? 'green' : status === 'pending' ? 'grey' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
    },
  ];

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <Card style={{ padding: '20px', maxWidth: '100%', margin: '40px auto' }}>
      <Row justify="space-between" align="middle" wrap>
        <Col>
          <h1>{client.username} Details</h1>
        </Col>
        <Col>
          <Button onClick={handleBackClick} style={{ marginBottom: '20px' }}>
            <ArrowLeftOutlined /> Back to Client List
          </Button>
        </Col>
      </Row>
      <Card style={{ marginBottom: '20px', borderRadius: '20px' }}>
        <Row gutter={[16, 16]}>
          {/* Personal Information Card */}
          <Col xs={24} md={8}>
            <Card title="Personal Information" style={{ marginBottom: '20px', borderRadius: '20px' }}>
              <Row justify="center" align="middle">
                <Col>
                  <Avatar size={128} src={cases[0]?.profile} icon={<UserOutlined />} style={{ marginBottom: '20px' }} />
                </Col>
                <Col span={24}>
                  <h1 style={{ marginTop: '20px', textAlign: 'center' }}>{client.username}</h1>
                </Col>
              </Row>
              <Descriptions
                column={1}
                layout="vertical"
                size="small"
                responsive
                style={{ textAlign: 'center' }}
              >
                <Descriptions.Item label="Gender">{client.gender}</Descriptions.Item>
                <Descriptions.Item label="Nationality">{client.nationality}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">{client.date_of_birth}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Identification Card */}
          <Col xs={24} md={8}>
            <Card style={{ marginBottom: '20px', borderRadius: '20px' }}>
              <h3>Identification</h3>
              <Descriptions
                column={1}
                layout="vertical"
                size="small"
                responsive
              >
                <Descriptions.Item label="ID Number">{client.id_number}</Descriptions.Item>
                <Descriptions.Item label="Passport Number">{client.passport_number}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Contact and Status Card */}
          <Col xs={24} md={8}>
            <Card style={{ marginBottom: '20px', borderRadius: '20px' }}>
              <h3>Contact and Status</h3>
              <Descriptions
                column={1}
                layout="vertical"
                size="small"
                responsive
              >
                <Descriptions.Item label="Email">{client.email}</Descriptions.Item>
                <Descriptions.Item label="Phone Number">{client.phone_number}</Descriptions.Item>
                <Descriptions.Item label="Residential Address">{client.address}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={client.status === 'Active' ? 'green' : 'red'}>{client.status}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="All Cases" key="1">
          <Table columns={columns} dataSource={cases} style={{ overflowX: 'auto' }}  scroll={{ x: 'max-content' }} pagination={false} />
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
            pageSize={5}
            total={cases.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
        </TabPane>
        <TabPane tab="Pending" key="2">
          <Table columns={columns} dataSource={cases.filter(c => c.status === 'pending')} style={{ overflowX: 'auto' }}  scroll={{ x: 'max-content' }} pagination={false} />
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
            pageSize={5}
            total={cases.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
        </TabPane>
        <TabPane tab="Open" key="3">
          <Table columns={columns} dataSource={cases.filter(c => c.status === 'open')} style={{ overflowX: 'auto' }}  scroll={{ x: 'max-content' }} pagination={false} />
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
            pageSize={5}
            total={cases.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
        </TabPane>
        <TabPane tab="Closed" key="4">
          <Table columns={columns} dataSource={cases.filter(c => c.status === 'closed')} style={{ overflowX: 'auto' }}  scroll={{ x: 'max-content' }} pagination={false} />
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
            pageSize={5}
            total={cases.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
        </TabPane>
        <TabPane tab="Cancelled" key="5">
          <Table columns={columns} dataSource={cases.filter(c => c.status === 'cancelled')} style={{ overflowX: 'auto' }}  scroll={{ x: 'max-content' }} pagination={false} />
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
            pageSize={5}
            total={cases.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ClientDetails;
