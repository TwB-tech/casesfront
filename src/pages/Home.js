import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Avatar, Button, Modal, Calendar, List, Skeleton, Pagination, Tag } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../axiosConfig';


const dataPie1 = [
  { name: 'New', value: 62 },
  { name: 'Returning', value: 26 },
  { name: 'Inactive', value: 12 },
];

const dataPie2 = [
  { name: 'Paid', value: 70 },
  { name: 'Trial', value: 30 },
];

const dataBar = [
  { name: 'JAN', cases: 100 },
  { name: 'FEB', cases: 120 },
  { name: 'MAR', cases: 180 },
  { name: 'APR', cases: 150 },
  { name: 'MAY', cases: 200 },
  { name: 'JUN', cases: 250 },
  { name: 'JUL', cases: 270 },
  { name: 'AUG', cases: 50 },
  { name: 'SEP', cases: 100 },
  { name: 'OCT', cases: 250 },
  { name: 'NOV', cases: 290 },
  { name: 'DEC', cases: 400 },
];


const columns = [
  { title: 'Task', dataIndex: 'title', key: 'title' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: 'Completed', value: true },
      { text: 'Pending', value: false },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => {
      let color = status ? 'green' : 'volcano';
      return <Tag color={color}>{status ? 'Completed' : 'Pending'}</Tag>;
    },
  },
];


const COLORS1 = ['#FFBB28', '#FF8042', '#0088FE'];
const COLORS2 = ['#0088FE', '#00C49F'];

function Home() {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useAuth();
  const [cases, setCases] = useState([])
  const [clients, setClients] = useState([])
  const [tasks, setTasks] = useState([])
  // const [invoices, setInvoices] = useState([])
  // const [payments, setPayments] = useState([])
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  // const [loadingInvoices, setLoadingInvoices] = useState(true);
  // const [loadingPayments, setLoadingPayments] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    fetchCases();
    fetchClients();
    fetchTasks();
    // fetchInvoices();
    // fetchPayments();
  } , [])



  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const response = await axiosInstance.get('/advocate/cases/');
      setCases(response.data);
      setLoadingCases(false);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setLoadingCases(false);
    }
  };



  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await axiosInstance.get('/advocate/clients/');
      const data = await response.data;
      setClients(data);
      setLoadingClients(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setLoadingClients(false);
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await axiosInstance.get('/tasks/');
      const data = await response.data.results;
      setTasks(data);
      setLoadingTasks(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoadingTasks(false);
    }
  };

  // const fetchInvoices = async () => {
  //   try {
  //     const response = await axiosInstance.get('/invoices/');
  //     const data = await response.data;
  //     setInvoices(data);
  //   } catch (error) {
  //     console.error('Error fetching invoices:', error);
  //   }
  // }

  // const fetchPayments = async () => {
  //   try {
  //     const response = await axiosInstance.get('/payments/');
  //     const data = await response.data;
  //     setPayments(data);
  //   } catch (error) {
  //     console.error('Error fetching payments:', error);
  //   }
  // }

  

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  return (
    <div style={{ padding: '20px', zIndex:1 }}>

        {/* Welcome Card */}
        <Card style={{
          backgroundColor: '#f0f2f5',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
        }}>

        <Row align="middle" justify="space-between">
          <Col>
            <div>
              <h2 style={{ marginBottom:"10px" }}>Welcome, <span style={{textTransform:"uppercase"}}>{user && user.username}</span></h2>
              <p style={{ color: '#888', marginBottom: '10px' }}>Role: {user && user.role}</p>
              <p style={ {  fontWeight: 'bold'}}>Today is {moment().format('dddd, MMMM Do YYYY')}.</p>
            </div>
          </Col>
          <Col>
            <Avatar size={64} icon={<UserOutlined />} />
          </Col>
          <Col>
            <Button icon={<CalendarOutlined />} onClick={showModal}>
              Open Calendar
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} justify="start">
        {/* First Two Cards in the First Column */}
        <Col xs={24} sm={12} md={6}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
            <Card style={{borderRadius: "20px"}}  hoverable>
            {loadingCases ? (
              <Skeleton active />
            ) : (
              <>
                <Statistic title="Cases" value={cases.cases_count || 0} />
                <span style={{ color: 'green' }}>▲ 8.2% since last month</span>
              </>
            )}
          </Card>
            </Col>
            <Col span={24}>
            <Card style={{borderRadius: "20px"}}  hoverable>
            {loadingClients ? (
              <Skeleton active />
            ) : (
              <>
                <Statistic title="Clients" value={clients.clients_count || 0} />
                <span style={{ color: 'green' }}>▲ 3.4% since last month</span>
              </>
            )}
          </Card>
            </Col>
          </Row>
        </Col>
         
        {/* Second Two Cards in the Second Column */}
        <Col xs={24} sm={12} md={6}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card style={{borderRadius: "20px"}} hoverable>
                <Statistic title="Month total" value={25410} prefix="$" />
                <span style={{ color: 'red' }}>▼ 0.4% since last month</span>
              </Card>
            </Col>
            <Col span={24}>
              <Card style={{borderRadius: "20px"}} hoverable>
                <Statistic title="Revenue" value={1352} prefix="$" />
                <span style={{ color: 'red' }}>▼ 1.2% since last month</span>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Pie Chart for Users in the Third Column, spans the height of two cards */}
        <Col xs={24} sm={12} md={6}>
          <Card style={{ height: '100%', textAlign: 'center', borderRadius: "20px" }} hoverable>
            <h1 style={{ textAlign: 'center' }}>My Clients</h1>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataPie1}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataPie1.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS1[index % COLORS1.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: COLORS1[0] }}>● 62% New</span> &nbsp;
              <span style={{ color: COLORS1[1] }}>● 26% Returning</span> &nbsp;
              <span style={{ color: COLORS1[2] }}>● 12% Inactive</span>
            </div>
          </Card>
        </Col>

        {/* Pie Chart for Subscriptions in the Fourth Column, spans the height of two cards */}
        <Col xs={24} sm={12} md={6}>
          <Card style={{ height: '100%', borderRadius:"20px" }} hoverable>
            <h1 style={{ textAlign: 'center' }}>Case Bills</h1>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataPie2}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataPie2.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: COLORS2[0] }}>● 70% Paid</span> &nbsp;
              <span style={{ color: COLORS2[1] }}>● 30% Trial</span>
            </div>
          </Card>
        </Col>
      </Row>


      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        {/* Cases Dynamics Bar Chart */}
        <Col xs={24} md={12}>
          <Card style={{borderRadius: "20px"}} hoverable title="Cases Dynamics" extra={<span>2021</span>}>
          <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dataBar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Months" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Cases" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Bar
                  dataKey="cases"
                  fill="#8884d8"
                  radius={[10, 10, 0, 0]} // Add top border radius here
                  barSize={10} // Make the bars thin as per the image example
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Paid Invoices and Funds Received Cards */}
        <Col xs={24} md={12}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card style={{borderRadius: "20px"}} hoverable>
                <Statistic title="Paid Invoices" value={30256.23} prefix="$" />
                <span style={{ color: 'green' }}>▲ 15%</span>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{borderRadius: "20px"}} hoverable>
                <Statistic title="Funds Received" value={150256.23} prefix="$" />
                <span style={{ color: 'green' }}>▲ 59%</span>
              </Card>
            </Col>
          </Row>

          {/* Task Table below the Cards */}
          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Card style={{ borderRadius: "20px" , maxHeight:"350px"}}>
              {loadingTasks ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <>
                <h2 style={{ textAlign: 'center' }}>Tasks</h2>
                <Table dataSource={tasks} columns={columns} pagination={false}  style={{overflowY:"auto"}}  scroll={{ x: 'max-content' }}/>
              </>
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
                  pageSize={3}
                  total={tasks.length}
                  onChange={(page) => setCurrentPage(page)}
                />
              </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>


      {/* Modal for Calendar and Events */}
      <Modal
        title="Calendar and Upcoming Events"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]} justify="space-between">
          {/* Calendar on the left */}
          <Col xs={24} sm={12}>
            <Calendar fullscreen={false} onPanelChange={onPanelChange} />
          </Col>

          {/* Appointments and Events on the right */}
          <Col xs={24} sm={12}>
            <h3>Upcoming Events</h3>
            <List
              itemLayout="horizontal"
              dataSource={tasks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={moment(item.date).format('YYYY-MM-DD HH:mm')}
                  />
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Modal>

    </div>
  );
}

export default Home;
