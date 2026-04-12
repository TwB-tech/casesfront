import React from 'react';
import { Card, Tag, Typography, Avatar, Space, Row, Col } from 'antd';
import {
  UserOutlined, MailOutlined, ManOutlined, PhoneOutlined,
  IdcardOutlined, HomeOutlined, FlagOutlined, ReadOutlined,
  HeartOutlined, CalendarOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function ClientCard({ clientInfo, onClick }) {
  const borderColor = clientInfo.status === 'Active' ? 'green' : 'red';

  return (
    <Card
      hoverable
      style={{
        margin: '10px 0',
        borderRadius: '15px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderBottom: `4px solid ${borderColor}`,
      }}
      bodyStyle={{ padding: '20px' }}
      onClick={onClick}
    >
      <Space align="center" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <Avatar src={clientInfo.avatar} icon={<UserOutlined />} />
        <Title level={4} style={{ marginBottom: 0, textAlign: 'center' }}>{clientInfo.name}</Title>
      </Space>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <Tag color={borderColor}>{clientInfo.status}</Tag>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            <Paragraph style={{ margin: 0 }}>{clientInfo.email}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ManOutlined style={{ marginRight: '8px', color: '#faad14' }} />
            <Paragraph style={{ margin: 0 }}>{clientInfo.gender}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            <Paragraph style={{ margin: 0 }}>{clientInfo.phone_number}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IdcardOutlined style={{ marginRight: '8px', color: '#eb2f96' }} />
            <Paragraph style={{ margin: 0 }}>ID: {clientInfo.id_number}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IdcardOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
            <Paragraph style={{ margin: 0 }}>Passport: {clientInfo.passport_number}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: '8px', color: '#f5222d' }} />
            <Paragraph style={{ margin: 0 }}>{clientInfo.date_of_birth}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HomeOutlined style={{ marginRight: '8px', color: '#fa541c' }} />
            <Paragraph style={{ margin: 0 }}>{clientInfo.residential_address}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FlagOutlined style={{ marginRight: '8px', color: '#13c2c2' }} />
            <Paragraph style={{ margin: 0 }}>{clientInfo.nationality}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ReadOutlined style={{ marginRight: '8px', color: '#2f54eb' }} />
            <Paragraph style={{ margin: 0 }}>{clientInfo.occupation}</Paragraph>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeartOutlined style={{ marginRight: '8px', color: '#eb2f96' }} />
            <Paragraph style={{ margin: 0 }}>{clientInfo.marital_status}</Paragraph>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default ClientCard;
