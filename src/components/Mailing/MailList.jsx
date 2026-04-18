import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Input, Tag, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MailOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../../contexts/ThemeContext';
import DOMPurify from 'dompurify';
import moment from 'moment';

const MailList = () => {
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isFuturistic } = useTheme();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    axiosInstance
      .get('/clientcomm/api/clientcommunications/')
      .then((response) => {
        setMails(response.data.results || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('There was an error fetching the mails!', error);
        setLoading(false);
      });
  }, []);

  // Filter mails by search query
  const filteredMails = searchQuery
    ? mails.filter(
        (mail) =>
          mail.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mail.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mail.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mails;

  const columns = [
    {
      title: 'To',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <span style={{ fontWeight: 500, color: isFuturistic ? '#f8fafc' : '#1e293b' }}>
          {DOMPurify.sanitize(email || '')}
        </span>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => (
        <span style={{ color: isFuturistic ? '#e2e8f0' : '#475569' }}>
          {DOMPurify.sanitize(subject || '', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}
        </span>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => (
        <span style={{ color: isFuturistic ? '#e2e8f0' : '#475569' }}>{subject}</span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span style={{ color: '#64748b' }}>{moment(date).format('MMM DD, YYYY')}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/mail-details/${record.id}`)}
          style={{ borderRadius: '8px' }}
        >
          View
        </Button>
      ),
    },
  ];

  // Card view for mobile
  const renderMailCards = () => (
    <Row gutter={[12, 12]} style={{ marginTop: '16px' }}>
      {filteredMails.map((mail) => (
        <Col xs={24} sm={12} md={8} key={mail.id}>
          <Card
            hoverable
            onClick={() => navigate(`/mail-details/${mail.id}`)}
            style={{
              borderRadius: '12px',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <h4
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: isFuturistic ? '#f8fafc' : '#1e293b',
                }}
              >
                {mail.subject}
              </h4>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Tag color="blue" style={{ borderRadius: '6px' }}>
                {mail.email}
              </Tag>
            </div>
            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '12px',
              }}
            >
              {moment(mail.created_at).format('MMM DD, YYYY')}
            </p>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div
      style={{
        padding: isSmallScreen ? '16px' : '24px',
        marginTop: isSmallScreen ? '60px' : '40px',
      }}
    >
      {/* Header Card */}
      <Card
        style={{
          borderRadius: '16px',
          marginBottom: '24px',
          background: isFuturistic ? '#1a1a24' : '#ffffff',
          border: isFuturistic ? '1px solid #2a2a3a' : 'none',
          boxShadow: isFuturistic ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]} style={{ flexWrap: 'wrap' }}>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MailOutlined
                style={{ fontSize: '28px', color: isFuturistic ? '#6366f1' : '#3b82f6' }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 600,
                  color: isFuturistic ? '#f8fafc' : '#1e293b',
                }}
              >
                Emails
              </h2>
              <Tag color="blue" style={{ borderRadius: '20px', padding: '4px 12px' }}>
                {filteredMails.length} messages
              </Tag>
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/new-mail')}
              style={{
                borderRadius: '10px',
                background: isFuturistic ? '#6366f1' : '#3b82f6',
                border: 'none',
                fontWeight: 500,
              }}
            >
              New Email
            </Button>
          </Col>
        </Row>

        {/* Search Bar - Always at top */}
        <div style={{ marginTop: '20px' }}>
          <Input
            placeholder="Search emails by recipient, subject, or content..."
            prefix={<SearchOutlined style={{ color: '#64748b' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="large"
            style={{
              borderRadius: '10px',
              maxWidth: '100%',
              width: '100%',
            }}
          />
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card style={{ borderRadius: '12px', textAlign: 'center', padding: '40px' }}>
          Loading emails...
        </Card>
      ) : filteredMails.length === 0 ? (
        <Card style={{ borderRadius: '12px', textAlign: 'center', padding: '40px' }}>
          <MailOutlined style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
          <h3 style={{ color: '#64748b' }}>No emails found</h3>
          <p style={{ color: '#94a3b8' }}>
            {searchQuery ? 'Try adjusting your search' : 'Send your first email to get started'}
          </p>
        </Card>
      ) : isSmallScreen ? (
        renderMailCards()
      ) : (
        <Card style={{ borderRadius: '16px' }}>
          <Table
            dataSource={filteredMails}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} emails`,
            }}
            style={{ cursor: 'pointer' }}
            onRow={(record) => ({
              onClick: () => navigate(`/mail-details/${record.id}`),
            })}
          />
        </Card>
      )}
    </div>
  );
};

export default MailList;
