import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Timeline, Typography, Avatar, Statistic, message } from 'antd';
import { FileTextOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import moment from 'moment';

const { Title, Text } = Typography;

function ClientDashboard() {
  const { user } = useAuth();
  const { isFuturistic } = useTheme();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'client') {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/case/individual-cases/');
        setCases(response.data.results || []);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const activeCases = cases.filter(c => c.status === 'open' || c.status === 'pending');
  const closedCases = cases.filter(c => c.status === 'closed');

  const cardStyle = {
    borderRadius: 12,
    background: isFuturistic ? '#1a1a24' : '#ffffff',
    border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className={isFuturistic ? 'text-aurora-text' : 'text-gray-900'}>
          Welcome, {user?.username}
        </Title>
        <Text type="secondary">Your case portal</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} hoverable>
            <Statistic
              title={<span className={isFuturistic ? 'text-aurora-muted' : 'text-gray-500'}>Active Cases</span>}
              value={activeCases.length}
              prefix={<FileTextOutlined className="text-blue-500" />}
              valueStyle={{ color: isFuturistic ? '#818cf8' : '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} hoverable>
            <Statistic
              title={<span className={isFuturistic ? 'text-aurora-muted' : 'text-gray-500'}>Closed Cases</span>}
              value={closedCases.length}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: isFuturistic ? '#34d399' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} hoverable onClick={() => navigate('/documents')}>
            <Statistic
              title={<span className={isFuturistic ? 'text-aurora-muted' : 'text-gray-500'}>My Documents</span>}
              value={0}
              prefix={<FileTextOutlined className="text-purple-500" />}
              valueStyle={{ color: isFuturistic ? '#a78bfa' : '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} hoverable>
            <Statistic
              title={<span className={isFuturistic ? 'text-aurora-muted' : 'text-gray-500'}>Pending Invoices</span>}
              value={0}
              prefix={<DollarOutlined className="text-yellow-500" />}
              valueStyle={{ color: isFuturistic ? '#fbbf24' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card 
            title="My Cases" 
            style={{ ...cardStyle, borderRadius: 12 }}
            className={isFuturistic ? 'bg-cyber-card' : ''}
          >
            {loading ? (
              <div className="text-center p-8">Loading...</div>
            ) : cases.length === 0 ? (
              <div className="text-center p-8">
                <FileTextOutlined className="text-4xl text-gray-300 mb-4" />
                <Text type="secondary">No cases yet</Text>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.slice(0, 5).map((caseItem) => (
                  <div 
                    key={caseItem.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/case-details/${caseItem.id}`)}
                    style={{ background: isFuturistic ? '#2a2a3a' : '#f8fafc' }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar icon={<FileTextOutlined />} style={{ background: '#3b82f6' }} />
                      <div>
                        <div className="font-medium">{caseItem.title}</div>
                        <Text type="secondary" className="text-sm">Case #{caseItem.case_number}</Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tag color={caseItem.status === 'open' ? 'blue' : caseItem.status === 'closed' ? 'green' : 'orange'}>
                        {caseItem.status}
                      </Tag>
                      <span className="text-sm text-gray-400">
                        {caseItem.end_date ? moment(caseItem.end_date).format('MMM DD') : 'No deadline'}
                      </span>
                    </div>
                  </div>
                ))}
                {cases.length > 5 && (
                  <div className="text-center mt-4">
                    <Text type="secondary">{cases.length - 5} more cases</Text>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Activity Timeline" 
            style={{ ...cardStyle, borderRadius: 12 }}
            className={isFuturistic ? 'bg-cyber-card' : ''}
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="font-medium">Account Created</div>
                      <Text type="secondary" className="text-sm">{moment(user?.created_at).format('MMM DD, YYYY')}</Text>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <div className="font-medium">Email Verified</div>
                      <Text type="secondary" className="text-sm">{moment(user?.verified_at || user?.created_at).format('MMM DD, YYYY')}</Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ClientDashboard;