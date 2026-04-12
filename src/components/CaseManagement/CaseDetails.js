import React from 'react';
import { Card, Row, Col, Tag, Button, Typography, Space, Empty } from 'antd';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { UserOutlined, CalendarOutlined, FileOutlined, BankOutlined, FileDoneOutlined, EditOutlined, ArrowLeftOutlined,Tooltip } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';

const { Title, Text } = Typography;

function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [caseDetails, setCaseDetails] = React.useState(state?.case1 || null);

  React.useEffect(() => {
    if (caseDetails) return;
    axiosInstance.get('/case/').then((response) => {
      const found = (response.data.results || []).find((item) => String(item.id) === String(id));
      setCaseDetails(found || null);
    });
  }, [caseDetails, id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate('/case-form/', { state: { case: caseDetails, isEditing: true } });
  };

  const handleBackClick = () => {
    navigate('/case-list')
  };


  const InfoCard = ({ button, title, icon, children }) => (
    <Card
      button={
        <ArrowLeftOutlined  onClick={handleBackClick} style={{ marginBottom: '20px', fontSize:"18px", color:"blue", border:"1px solid grey", borderRadius:"50%", padding:"10px" }} />
      }
      title={
        <Space>
          {icon}
          <Text strong>{title}</Text>
        </Space>
      }
      style={{ marginBottom: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
    >
      {children}
    </Card>
  );

  const InfoItem = ({ label, value }) => (
    <Row style={{ marginBottom: '12px' }}>
      <Col span={10}>
        <Text type="secondary">{label}</Text>
      </Col>
      <Col span={14}>
        <Text strong>{value}</Text>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: '20px', minHeight: '100vh', marginTop: '40px' }}>
      {!caseDetails ? (
        <Card>Case not found.</Card>
      ) : (
      <Card
        title={
          <Space size="middle">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="text"
              style={{ fontSize: '18px' }}
            />
            <Title level={2} style={{ margin: 0 }}>{caseDetails.title}</Title>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleEdit}
          >
            Edit Case
          </Button>
        }
        style={{ borderRadius: '20px', overflow: 'hidden' }}
        bodyStyle={{ padding: '30px' }}
      >
        <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <InfoCard title="Case Details" icon={<FileOutlined />}>
              <InfoItem label="Case Number" value={caseDetails.case_number} />
              <InfoItem label="Status" value={
                <Tag 
                  color={
                    caseDetails.status === 'open' ? '#1890ff' :
                    caseDetails.status === 'pending' ? '#faad14' :
                    caseDetails.status === 'closed' ? '#52c41a' :
                    'default'
                  } 
                  style={{ borderRadius: '20px', padding: '0 10px' }}>
                  {caseDetails.status.toUpperCase()}
                </Tag>
              } />
              <InfoItem label="Start Date" value={caseDetails.start_date} />
              <InfoItem label="End Date" value={caseDetails.end_date} />
            </InfoCard>

            <InfoCard title="Client" icon={<UserOutlined />}>
              <InfoItem label="Name" value={caseDetails.name} />
            </InfoCard>

            <InfoCard title="Advocate" icon={<UserOutlined />}>
              <InfoItem label="Name" value={caseDetails.name} />
            </InfoCard>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <InfoCard title="Court" icon={<BankOutlined />}>
              <InfoItem label="Name" value={caseDetails.court_name} />
            </InfoCard>

            <InfoCard title="Organization" icon={<BankOutlined />}>
              <InfoItem label="Name" value={caseDetails.organization?.name} />
            </InfoCard>

            <InfoCard title="Case Information" icon={<FileOutlined />}>
              <Text>{caseDetails.description}</Text>
            </InfoCard>

            <InfoCard title="Associated Documents" icon={<FileDoneOutlined />}>
              {caseDetails.documents && caseDetails.documents.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {caseDetails.documents.map((doc, index) => (
                    <Button key={index} icon={<FileOutlined />} style={{ borderRadius: '20px', width: '100%', textAlign: 'left' }}>
                      {doc.name}
                    </Button>
                  ))}
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No associated documents available"
                />
              )}
            </InfoCard>
          </Col>
        </Row>
      </Card>
      )}
    </div>
  );
}

export default CaseDetails;
