import React, { useEffect, useState } from 'react';
import { Table, Avatar, Tag, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';

const CaseReports = () => {
  const navigate = useNavigate()
  const [cases, setCases] = useState([]);

  useEffect(() => {
    axiosInstance.get('/case/').then((response) => {
      setCases(response.data.results || []);
    });
  }, []);

  const columns = [
    {
      title: 'Case Number',
      dataIndex: 'case_number',
      key: 'case_number',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (client) => (
        <span>
          <Avatar src={client?.avatar} />
          <span style={{ marginLeft: 8 }}>{client?.name || 'No client assigned'}</span>
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'open' ? 'green' : status === 'closed' ? 'red' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
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
    {
      title: 'Advocate',
      dataIndex: ['advocate', 'username'],
      key: 'advocate',
    },
    {
      title: 'Court',
      dataIndex: ['court', 'name'],
      key: 'court',
    },
    {
      title: 'Organization',
      dataIndex: ['organization', 'name'],
      key: 'organization',
    },
  ];

  const NavPerfomance = () => {
    navigate('/performanceReports')
  }

  return (
  <>
   <div style={{display:"flex", justifyContent:"space-between", marginBottom:"40px", marginTop:"40px" }}>
    <h2>Reports</h2>
    <Button onClick={NavPerfomance}>
      Performance Reports
    </Button>
  </div>
  <Table 
    dataSource={cases} 
    columns={columns} 
    rowKey="id" 
    style={{ overflowX: 'auto', cursor: 'pointer' }}
    scroll={{ x: 'max-content' }} 
    />
  </>
)
};

export default CaseReports;
