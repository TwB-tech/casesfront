import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Radio, Row, Col, Avatar, Space, Tag, Card, Input, Select, message, Skeleton, Pagination, Statistic } from 'antd';
import CaseCard from './CaseCard';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, PlusOutlined, SearchOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../../contexts/ThemeContext';
import moment from 'moment';


const CaseList = () => {
  const navigate = useNavigate();
  const { isFuturistic, themeConfig } = useTheme();
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
  const [autoRefresh, setAutoRefresh] = useState(true);

  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const isMediumScreen = useMediaQuery({ maxWidth: 1024 });

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

    // Auto-refresh cases every 5 minutes if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchCases, 300000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);


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

  const filteredCases = useMemo(() => 
    filterCasesByStatus(filterCasesBySearch(filterCasesByDate(cases))),
    [cases, searchQuery, statusFilter, startDate, endDate]
  );

  // Calculate statistics for dashboard-style cards
  const stats = useMemo(() => ({
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    pending: cases.filter(c => c.status === 'pending').length,
    closed: cases.filter(c => c.status === 'closed').length,
  }), [cases]);

  // Paginated cases
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredCases.slice(start, end);
  }, [filteredCases, currentPage, entriesPerPage]);

  const columns = [
    {
      title: 'Case Number',
      dataIndex: 'case_number',
      key: 'case_number',
      sorter: (a, b) => a.case_number.toString().localeCompare(b.case_number.toString()),
      sortOrder: orderBy === 'case_number' && order,
      render: (num) => <span style={{ fontWeight: 600, color: isFuturistic ? '#6366f1' : '#3b82f6' }}>{num}</span>,
    },
    {
      title: 'Client',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.profile} icon={!record.profile && <UserOutlined />} size={32} />
          <span style={{ color: isFuturistic ? '#f8fafc' : '#1e293b' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: orderBy === 'title' && order,
      render: (title) => <span style={{ color: isFuturistic ? '#e2e8f0' : '#475569' }}>{title}</span>,
    },
    {
      title: 'Court',
      dataIndex: 'court_name',
      key: 'court_name',
      sorter: (a, b) => (a.court_name || '').localeCompare(b.court_name || ''),
      sortOrder: orderBy === 'court_name' && order,
      render: (court) => court ? <Tag color="purple">{court}</Tag> : <span style={{ color: '#94a3b8' }}>-</span>,
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
              ? 'gold'
              : 'red'
          }
          style={{ borderRadius: '20px', padding: '4px 12px', fontWeight: 500 }}
        >
          {status?.toUpperCase()}
        </Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: orderBy === 'status' && order,
    },
    {
      title: 'Deadline',
      dataIndex: 'end_date',
      key: 'end_date',
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      sortOrder: orderBy === 'end_date' && order,
      render: (date) => {
        const daysLeft = moment(date).diff(moment(), 'days');
        const isUrgent = daysLeft <= 7 && daysLeft >= 0;
        const isOverdue = daysLeft < 0;
        return (
          <span style={{ 
            color: isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#64748b',
            fontWeight: isUrgent || isOverdue ? 600 : 400
          }}>
            {moment(date).format('MMM DD')}
          </span>
        );
      },
    },
  ];

  const handleNewCaseClick = () => {
    navigate('/case-form');
  };

  const handleRowClick = (case1) => {
    navigate(`/case-details/${case1.id}`, { state: { case1, viewMode } });
  };

  return (
    <div style={{ 
      padding: isSmallScreen ? '16px' : '24px', 
      marginTop: isSmallScreen ? '60px' : '0',
      background: isFuturistic ? '#12121a' : '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Statistics Cards - Dashboard Style */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card 
            className={isFuturistic ? 'hover-glow' : ''}
            style={{ 
              borderRadius: "12px", 
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : 'none',
              boxShadow: isFuturistic ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)'
            }} 
            hoverable
          >
            <Statistic 
              title={<span style={{ color: isFuturistic ? '#94a3b8' : '#64748b', fontSize: '12px' }}>Total Cases</span>} 
              value={stats.total} 
              valueStyle={{ color: isFuturistic ? '#f8fafc' : '#1e293b', fontWeight: 700, fontSize: '24px' }}
              prefix={<FileTextOutlined style={{ color: isFuturistic ? '#6366f1' : '#3b82f6', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            className={isFuturistic ? 'hover-glow' : ''}
            style={{ 
              borderRadius: "12px", 
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : 'none'
            }} 
            hoverable
          >
            <Statistic 
              title={<span style={{ color: isFuturistic ? '#94a3b8' : '#64748b', fontSize: '12px' }}>Open</span>} 
              value={stats.open} 
              valueStyle={{ color: '#3b82f6', fontWeight: 700, fontSize: '24px' }}
              prefix={<ClockCircleOutlined style={{ marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            className={isFuturistic ? 'hover-glow' : ''}
            style={{ 
              borderRadius: "12px", 
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : 'none'
            }} 
            hoverable
          >
            <Statistic 
              title={<span style={{ color: isFuturistic ? '#94a3b8' : '#64748b', fontSize: '12px' }}>Pending</span>} 
              value={stats.pending} 
              valueStyle={{ color: '#f59e0b', fontWeight: 700, fontSize: '24px' }}
              prefix={<ClockCircleOutlined style={{ marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            className={isFuturistic ? 'hover-glow' : ''}
            style={{ 
              borderRadius: "12px", 
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : 'none'
            }} 
            hoverable
          >
            <Statistic 
              title={<span style={{ color: isFuturistic ? '#94a3b8' : '#64748b', fontSize: '12px' }}>Closed</span>} 
              value={stats.closed} 
              valueStyle={{ color: '#22c55e', fontWeight: 700, fontSize: '24px' }}
              prefix={<CheckCircleOutlined style={{ marginRight: '8px' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card style={{ 
        borderRadius: '16px', 
        background: isFuturistic ? '#1a1a24' : '#ffffff',
        border: isFuturistic ? '1px solid #2a2a3a' : 'none',
        boxShadow: isFuturistic ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        {/* Header */}
        <Row 
          align="middle" 
          justify="space-between" 
          gutter={[16, 16]}
          style={{ marginBottom: '24px', flexWrap: 'wrap' }}
        >
          <Col>
            <h1 style={{ 
              fontSize: isSmallScreen ? '20px' : '24px', 
              fontWeight: 700,
              margin: 0,
              color: isFuturistic ? '#f8fafc' : '#1e293b'
            }}>
              CASE MANAGEMENT
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
              {filteredCases.length} cases found
            </p>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={handleNewCaseClick}
              style={{ 
                borderRadius: '10px',
                background: isFuturistic ? '#6366f1' : '#3b82f6',
                border: 'none',
                fontWeight: 600
              }}
            >
              New Case
            </Button>
          </Col>
        </Row>

        {/* Search & Filters Bar - Always at top, fully responsive */}
        <div style={{ marginBottom: '24px' }}>
          <Row gutter={[12, 12]} style={{ flexWrap: 'wrap' }}>
            <Col xs={24} sm={24} md={8}>
              <Input
                placeholder="Search by case number, client, title, or description..."
                prefix={<SearchOutlined style={{ color: '#64748b' }} />}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                size="large"
                style={{ 
                  borderRadius: '10px',
                  width: '100%'
                }}
                allowClear
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Input
                placeholder="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                size="large"
                style={{ borderRadius: '10px', width: '100%' }}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Input
                placeholder="End Date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                size="large"
                style={{ borderRadius: '10px', width: '100%' }}
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
                <Select.Option value="Open">Open</Select.Option>
                <Select.Option value="Pending">Pending</Select.Option>
                <Select.Option value="Closed">Closed</Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={2}>
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
              <Col xs={24} sm={8} md={2}>
                <Radio.Group
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
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
        ) : filteredCases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FileTextOutlined style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No cases found</h3>
            <p style={{ color: '#94a3b8' }}>
              {searchQuery || startDate || endDate || statusFilter !== 'All' 
                ? 'Try adjusting your filters or search query'
                : 'Create your first case to get started'}
            </p>
          </div>
        ) : viewMode === 'table' && !isSmallScreen ? (
          <Table
            dataSource={paginatedCases}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: 'pointer' }
            })}
            onChange={handleRequestSort}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {paginatedCases.map((caseInfo) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={caseInfo.id}>
                <CaseCard
                  caseInfo={caseInfo}
                  onClick={() => handleRowClick(caseInfo)}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* Pagination */}
        {filteredCases.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: isSmallScreen ? 'center' : 'flex-end',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <Pagination
              current={currentPage}
              pageSize={entriesPerPage}
              total={filteredCases.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={!isSmallScreen}
              showTotal={(total) => `Total ${total} cases`}
              size={isSmallScreen ? 'small' : 'default'}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default CaseList;