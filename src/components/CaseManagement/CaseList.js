import React, { useState, useEffect } from 'react';
import { Table, Button, Radio, Row, Col, Avatar, Space, Tag, Card, Input, Select, message, Skeleton, Pagination } from 'antd';
import CaseCard from './CaseCard';
import { useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useMediaQuery } from 'react-responsive';



const CaseList = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState('ascend');
  const [orderBy, setOrderBy] = useState('case_number');
  const [cases, setCases] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [loading, setLoading] = useState(true);

  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

   // Retrieve viewMode from sessionStorage or default to 'table'
   const initialViewMode = sessionStorage.getItem('viewMode') || 'table';
   const [viewMode, setViewMode] = useState(initialViewMode);

   useEffect(() => {
    // Automatically switch to card view on small screens
    if (isSmallScreen) {
      setViewMode('cards');
    } else {
      setViewMode(initialViewMode);
    }
  }, [isSmallScreen, initialViewMode]);
 
   useEffect(() => {
     // Update sessionStorage whenever viewMode changes
     sessionStorage.setItem('viewMode', viewMode);
   }, [viewMode]);


  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.get('/case/');
        const data = response.data.results
        setCases(data);
      } catch (error) {
        console.error('Error fetching cases:', error);
        message.error('Failed to fetch cases. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);


  const handleRequestSort = (pagination, filters, sorter) => {
    setOrder(sorter.order);
    setOrderBy(sorter.field);
  };

  const filterCasesByDate = (cases) => {
    if (!startDate && !endDate) return cases;

    return cases.filter((caseItem) => {
      const caseStartDate = new Date(caseItem.start_date);
      const caseEndDate = new Date(caseItem.end_date);
      const filterStartDate = startDate ? new Date(startDate) : null;
      const filterEndDate = endDate ? new Date(endDate) : null;

      if (filterStartDate && filterEndDate) {
        return caseStartDate >= filterStartDate && caseEndDate <= filterEndDate;
      }
      if (filterStartDate) {
        return caseStartDate >= filterStartDate;
      }
      if (filterEndDate) {
        return caseEndDate <= filterEndDate;
      }
      return true;
    });
  };

  const filterCasesBySearch = (cases) => {
    if (!searchQuery) return cases;

    return cases.filter((caseItem) =>
      Object.values(caseItem).some(
        (value) =>
          value &&
          value
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    );
  };

  const filterCasesByStatus = (cases) => {
    if (statusFilter === 'All') return cases;

    return cases.filter((caseItem) => caseItem.status === statusFilter.toLowerCase());
  };

  const filteredCases = filterCasesByStatus(filterCasesBySearch(filterCasesByDate(cases)));

  const columns = [
    {
      title: 'Case Number',
      dataIndex: 'case_number',
      key: 'case_number',
      sorter: (a, b) => a.case_number.toString().localeCompare(b.case_number.toString()),
      sortOrder: orderBy === 'case_number' && order,
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
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: orderBy === 'title' && order,
    },
    {
      title: 'Advocate',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      sortOrder: orderBy === 'name' && order,
    },
    {
      title: 'Court',
      dataIndex: 'court_name',
      key: 'court_name',
      sorter: (a, b) => (a.court_name || '').localeCompare(b.court_name || ''),
      sortOrder: orderBy === 'court_name' && order,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'open'
              ? 'blue'
              : status === 'closed'
              ? 'green'
              : status === 'pending'
              ? 'yellow'
              : 'red'
          }
        >
          {status}
        </Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: orderBy === 'status' && order,
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
      sortOrder: orderBy === 'start_date' && order,
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      sortOrder: orderBy === 'end_date' && order,
    },
  
  ];

  const handleNewCaseClick = () => {
    navigate('/case-form');
  };

  const handleRowClick = (case1) => {
    navigate(`/case-details/${case1.id}`, { state: { case1, viewMode } });
  };

  return (
    <div>
      <Card style={{ marginBottom: '20px', borderRadius: '12px', flexWrap:"wrap", marginTop:"40px"  }}>
        <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '40px' }}>
          CASE LIST
        </h1>
        <div style={{display:"flex", justifyContent:"space-between"}}>
            <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginBottom: '20px', marginRight: '20px' }}>
              <Radio.Button value="All">All</Radio.Button>
              <Radio.Button value="Open">Open</Radio.Button>
              <Radio.Button value="Pending">Pending</Radio.Button>
              <Radio.Button value="Closed">Closed</Radio.Button>
            </Radio.Group>
          <div>
            <Button type="primary" onClick={handleNewCaseClick} style={{ marginBottom: '20px', marginLeft: '10px' }}>
              New Case
            </Button>
          </div>
          </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {!isSmallScreen && (
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                style={{ marginBottom: '20px', marginRight: '10px' }}
              >
                <Radio.Button value="table">Table View</Radio.Button>
                <Radio.Button value="cards">Card View</Radio.Button>
              </Radio.Group>
            )}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap:"wrap" }}>
            <Input
              placeholder="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ maxWidth: '120px',}}
            />
            <Input
              placeholder="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ maxWidth: '120px', marginLeft: '10px'  }}
            />
            <Input
              placeholder="Search cases"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '180px', marginLeft: '10px' }}
            />
            <Select
              defaultValue={10}
              style={{ width: 80, marginLeft: '10px' }}
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
          <Skeleton active avatar paragraph={{ rows: 4 }} />) :
           viewMode === 'table' && !isSmallScreen ? (
          <Table
            dataSource={filteredCases}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            onChange={handleRequestSort}
            pagination={false}
            style={{ overflowX: 'auto', cursor: 'pointer' }}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredCases.map((caseInfo) => (
              <Col xs={24} sm={12} md={8} lg={6} key={caseInfo.id}>
                <CaseCard
                  caseInfo={caseInfo}
                  onClick={() => handleRowClick(caseInfo)}
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
            total={filteredCases.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </Card>
    </div>
  );
};

export default CaseList;