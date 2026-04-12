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
import { Card, Tag, Typography, Avatar, Space } from 'antd';
import { UserOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function CaseCard({ caseInfo, onClick }) {
  const borderColor = caseInfo.status === 'open' ? 'green' : caseInfo.status === 'closed' ? 'red' : 'grey';

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
      <Space align="center" style={{ marginBottom: '16px' }}>
      <Avatar 
          src={caseInfo.profile} 
          icon={!caseInfo.profile && <UserOutlined />} 
          alt={caseInfo.name}
        />
        <Title level={4} style={{ marginBottom: 0 }}>{caseInfo.title}</Title>
      </Space>
      <div style={{ marginBottom: '16px' }}>
        <Tag color={borderColor}>{caseInfo.status}</Tag>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> {/* Blue for Client Name */}
        <Paragraph style={{ margin: 0 }}>{caseInfo.name}</Paragraph>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <CalendarOutlined style={{ marginRight: '8px', color: '#faad14' }} /> {/* Gold for Deadline */}
        <Paragraph style={{ margin: 0 }}>Deadline: {caseInfo.end_date}</Paragraph>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <InfoCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} /> {/* Green for Description */}
        <Paragraph style={{ margin: 0 }}>{caseInfo.description}</Paragraph>
      </div>
    </Card>
  );
}

export default CaseCard;
