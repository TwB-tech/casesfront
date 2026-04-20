import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Button,
  Tooltip,
  Card,
  Input,
  Row,
  Col,
  Tag,
  Avatar,
  Skeleton,
  Pagination,
  message,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileOutlined,
  SearchOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Popconfirm } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../../contexts/ThemeContext';
import moment from 'moment';
import eventBus from '../../utils/eventBus';

function DocumentList() {
  const navigate = useNavigate();
  const { isFuturistic } = useTheme();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/document_management/api/documents/');
        const data = response.data.results || response.data || [];

        // Validate that we received document data, not user data
        if (data.length > 0 && data[0]) {
          const firstItem = data[0];
          // Check if this looks like user data (has username, email, etc.)
          if (firstItem.username || firstItem.email || firstItem.password) {
            console.error('API returned user data instead of documents!', firstItem);
            throw new Error('API returned invalid data - user data instead of documents');
          }
          // Check if this looks like document data (has title, owner, etc.)
          if (!firstItem.title && !firstItem.description) {
            console.warn('API returned data that does not look like documents', firstItem);
          }
        }

        setDocuments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching documents:', error);
        message.error('Failed to load documents. Please try again.');
        setDocuments([]);
        setLoading(false);
      }
    };

    fetchDocuments();

    const handleDocumentChange = () => {
      fetchDocuments();
    };

    const unsub = [
      eventBus.on('documentCreated', handleDocumentChange),
      eventBus.on('documentUpdated', handleDocumentChange),
      eventBus.on('documentDeleted', handleDocumentChange),
    ];

    return () => {
      unsub.forEach((fn) => fn());
    };
  }, []);

  const handleUploadClick = () => {
    navigate('/new-document');
  };

  // Filter documents by search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery) {
      return documents;
    }

    return documents.filter(
      (doc) =>
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.owner?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  // Paginated documents
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredDocuments.slice(start, end);
  }, [filteredDocuments, currentPage, entriesPerPage]);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title, _record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            icon={<FileTextOutlined />}
            style={{
              background: isFuturistic ? '#6366f1' : '#3b82f6',
              borderRadius: '8px',
            }}
            size={36}
          />
          <span
            style={{
              fontWeight: 500,
              color: isFuturistic ? '#f8fafc' : '#1e293b',
            }}
          >
            {title}
          </span>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => <span style={{ color: '#64748b' }}>{desc}</span>,
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner) => <Tag color="blue">{owner}</Tag>,
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploaded_at',
      key: 'uploaded_at',
      render: (date) => (
        <span style={{ color: '#64748b' }}>{moment(date).format('MMM DD, YYYY')}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="View">
            <Link to={`/documents-details/${record.id}`}>
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const response = await axiosInstance.get(`/api/documents/${record.id}/file/`);
                  const fileData = response.data;
                  if (fileData.data) {
                    const link = document.createElement('a');
                    link.href = fileData.data;
                    link.download = fileData.name || 'document';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    message.error('File data not available');
                  }
                } catch (error) {
                  message.error('Failed to download file');
                }
              }}
              icon={<DownloadOutlined />}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this document?"
            description="This action cannot be undone."
            onConfirm={async () => {
              try {
                await axiosInstance.delete(`/api/documents/${record.id}/`);
                message.success('Document deleted successfully');
                eventBus.emit('documentDeleted', { id: record.id });
                setDocuments(documents.filter((d) => d.id !== record.id));
              } catch (error) {
                message.error('Failed to delete document');
              }
            }}
            onCancel={() => {}}
            okText="Delete"
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Card view for mobile
  const renderDocumentCards = () => (
    <Row gutter={[12, 12]} style={{ marginTop: '16px' }}>
      {paginatedDocuments.map((doc) => (
        <Col xs={24} sm={12} md={8} lg={6} key={doc.id}>
          <Card
            hoverable
            onClick={() => navigate(`/documents-details/${doc.id}`)}
            style={{
              borderRadius: '12px',
              background: isFuturistic ? '#1a1a24' : '#ffffff',
              border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
              cursor: 'pointer',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}
            >
              <Avatar
                icon={<FileTextOutlined />}
                style={{
                  background: isFuturistic ? '#6366f1' : '#3b82f6',
                  borderRadius: '8px',
                }}
                size={40}
              />
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: isFuturistic ? '#f8fafc' : '#1e293b',
                  }}
                >
                  {doc.title}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{doc.owner}</p>
              </div>
            </div>

            {doc.description && (
              <p
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '13px',
                  color: '#64748b',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {doc.description}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {moment(doc.uploaded_at).format('MMM DD')}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button type="text" size="small" icon={<EyeOutlined />} />
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  href={doc.file}
                  download
                  target="_blank"
                />
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div
      style={{
        padding: isSmallScreen ? '16px' : '24px',
        marginTop: isSmallScreen ? '60px' : '0',
        background: isFuturistic ? '#12121a' : '#f8fafc',
        minHeight: '100vh',
      }}
    >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileOutlined
                style={{ fontSize: '28px', color: isFuturistic ? '#6366f1' : '#3b82f6' }}
              />
              <div>
                <h1
                  style={{
                    fontSize: isSmallScreen ? '20px' : '24px',
                    fontWeight: 700,
                    margin: 0,
                    color: isFuturistic ? '#f8fafc' : '#1e293b',
                  }}
                >
                  DOCUMENTS
                </h1>
                <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
                  {filteredDocuments.length} documents
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              size="large"
              onClick={handleUploadClick}
              style={{
                borderRadius: '10px',
                background: isFuturistic ? '#6366f1' : '#3b82f6',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Upload Document
            </Button>
          </Col>
        </Row>

        {/* Search Bar - Always at top */}
        <div style={{ marginBottom: '24px' }}>
          <Input
            placeholder="Search documents by title, description, or owner..."
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
        </div>

        {/* Reya AI Document Assistant */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '12px',
            background: isFuturistic ? '#1a1a24' : '#ffffff',
            border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row align="middle" gutter={12}>
            <Col>
              <Avatar
                style={{
                  background: isFuturistic ? '#6366f1' : '#3b82f6',
                  borderRadius: '50%',
                }}
                size={40}
              >
                <span style={{ color: 'white', fontWeight: 'bold' }}>R</span>
              </Avatar>
            </Col>
            <Col flex="auto">
              <h4
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: isFuturistic ? '#f8fafc' : '#1e293b',
                }}
              >
                Need Help with Documents?
              </h4>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                Ask Reya to draft contracts, generate legal documents, or help with document
                management. All content is AI-generated with built-in safety and compliance checks.
              </p>
            </Col>
            <Col>
              <Button
                type="primary"
                ghost
                style={{
                  borderRadius: '8px',
                  borderColor: isFuturistic ? '#6366f1' : '#3b82f6',
                  color: isFuturistic ? '#6366f1' : '#3b82f6',
                }}
                onClick={() => {
                  // Trigger Reya assistant with document context
                  if (window.reyaAssistant) {
                    window.reyaAssistant.openWithPrompt(
                      'I need help with legal documents. Can you assist me?'
                    );
                  } else {
                    message.info(
                      'Reya assistant will help you create and manage documents safely.'
                    );
                  }
                }}
              >
                Ask Reya
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FileTextOutlined
              style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }}
            />
            <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No documents found</h3>
            <p style={{ color: '#94a3b8' }}>
              {searchQuery
                ? 'Try adjusting your search'
                : 'Upload your first document to get started'}
            </p>
          </div>
        ) : isSmallScreen ? (
          renderDocumentCards()
        ) : (
          <Table
            dataSource={paginatedDocuments}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => navigate(`/documents-details/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        )}

        {/* Pagination */}
        {filteredDocuments.length > 0 && (
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
              total={filteredDocuments.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={!isSmallScreen}
              showTotal={(total) => `Total ${total} documents`}
              size={isSmallScreen ? 'small' : 'default'}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default DocumentList;
