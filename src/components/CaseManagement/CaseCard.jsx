// import React from 'react';
// import { Card, Tag, Typography, Avatar, Space } from 'antd';
// import { UserOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';

// const { Title, Paragraph } = Typography;

// function CaseCard({ caseInfo, onClick }) {
//   const borderColor = caseInfo.status === 'open' ? 'green' : caseInfo.status === 'closed' ? 'red' : 'grey';

//   return (
//     <Card
//       hoverable
//       style={{
//         margin: '10px 0',
//         borderRadius: '15px',
//         boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//         borderBottom: `4px solid ${borderColor}`,
//       }}
//       bodyStyle={{ padding: '20px' }}
//       onClick={onClick}
//     >
//       <Space align="center" style={{ marginBottom: '16px' }}>
//         <Avatar src={caseInfo.client?.avatar} icon={<UserOutlined />} />
//         <Title level={4} style={{ marginBottom: 0 }}>{caseInfo.title}</Title>
//       </Space>
//       <div style={{ marginBottom: '16px' }}>
//         <Tag color={borderColor}>{caseInfo.status}</Tag>
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
//         <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> {/* Blue for Client Name */}
//         <Paragraph style={{ margin: 0 }}>{caseInfo.client?.name}</Paragraph>
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
//         <CalendarOutlined style={{ marginRight: '8px', color: '#faad14' }} /> {/* Gold for Deadline */}
//         <Paragraph style={{ margin: 0 }}>Deadline: {caseInfo.end_date}</Paragraph>
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
//         <InfoCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} /> {/* Green for Description */}
//         <Paragraph style={{ margin: 0 }}>{caseInfo.description}</Paragraph>
//       </div>
//     </Card>
//   );
// }

// export default CaseCard;
import React from 'react';
import { Card, Tag, Avatar, Space } from 'antd';
import { UserOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import moment from 'moment';

function CaseCard({ caseInfo, onClick }) {
  const { isFuturistic } = useTheme();

  const statusColors = {
    open: 'blue',
    closed: 'green',
    pending: 'gold',
    default: 'red',
  };

  const statusColor = statusColors[caseInfo.status] || statusColors.default;

  // Calculate urgency
  const daysLeft = moment(caseInfo.end_date).diff(moment(), 'days');
  const isUrgent = daysLeft <= 7 && daysLeft >= 0;
  const isOverdue = daysLeft < 0;

  return (
    <Card
      hoverable
      className={isFuturistic ? 'hover-glow' : ''}
      style={{
        borderRadius: '12px',
        boxShadow: isFuturistic ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
        background: isFuturistic ? '#1a1a24' : '#ffffff',
        border: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e2e8f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{ padding: '16px', flex: 1 }}
      onClick={onClick}
    >
      {/* Header with Avatar and Title */}
      <Space align="start" style={{ marginBottom: '12px', width: '100%' }}>
        <Avatar
          src={caseInfo.profile}
          icon={!caseInfo.profile && <UserOutlined />}
          alt={caseInfo.name}
          size={40}
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: '15px',
              color: isFuturistic ? '#f8fafc' : '#1e293b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {caseInfo.title}
          </h4>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '12px',
              color: '#64748b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            #{caseInfo.case_number}
          </p>
        </div>
      </Space>

      {/* Status Tag */}
      <div style={{ marginBottom: '12px' }}>
        <Tag
          color={statusColor}
          style={{
            borderRadius: '20px',
            padding: '4px 12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '11px',
          }}
        >
          {caseInfo.status}
        </Tag>
      </div>

      {/* Client */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          gap: '8px',
        }}
      >
        <UserOutlined style={{ color: '#3b82f6', fontSize: '14px' }} />
        <span
          style={{
            fontSize: '13px',
            color: isFuturistic ? '#e2e8f0' : '#475569',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {caseInfo.name}
        </span>
      </div>

      {/* Deadline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          gap: '8px',
        }}
      >
        <CalendarOutlined
          style={{
            color: isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#fbbf24',
            fontSize: '14px',
          }}
        />
        <span
          style={{
            fontSize: '13px',
            color: isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#64748b',
            fontWeight: isUrgent || isOverdue ? 600 : 400,
          }}
        >
          {moment(caseInfo.end_date).format('MMM DD, YYYY')}
          {isOverdue && ' • Overdue'}
          {isUrgent && !isOverdue && ' • Urgent'}
        </span>
      </div>

      {/* Description */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginTop: 'auto',
          paddingTop: '8px',
        }}
      >
        <InfoCircleOutlined style={{ color: '#22c55e', fontSize: '14px', marginTop: '2px' }} />
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: '#64748b',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {caseInfo.description}
        </p>
      </div>
    </Card>
  );
}

export default CaseCard;
