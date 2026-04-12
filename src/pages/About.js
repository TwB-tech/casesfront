import React from 'react';
import { Row, Col, Card, Carousel } from 'antd';
import { TeamOutlined, EyeOutlined, AimOutlined } from '@ant-design/icons';

const teamMembers = [
  { name: 'John Doe', role: 'Lead Developer' },
  { name: 'Jane Smith', role: 'Project Manager' },
  { name: 'Alice Johnson', role: 'UX Designer' },
];

const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const About = () => {
  return (
    <div style={{ padding: '20px' }}>
      {/* Introduction Section */}
      <Row gutter={16} style={{ marginBottom: '40px' }}>
        <Col xs={24} sm={24} md={14}>
          <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '30px', marginBottom: '20px', textAlign: 'center' }}>About Wakilihub</h1>
            <p style={{fontSize:"32px"}}>Wakilihub is a comprehensive solution designed to help lawyers manage their caseloads efficiently. Our platform provides all the necessary tools for case management, client interaction, document handling, and more.</p>
          </div>
        </Col>
        <Col xs={24} sm={24} md={10}>
          <img
            src="https://images.moneycontrol.com/static-mcnews/2022/05/Court.png?impolicy=website&width=770&height=431"
            alt="About Wakilihub"
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </Col>
      </Row>

      {/* Mission, Vision, etc. Carousel */}
      <Carousel {...carouselSettings}>
        <Card style={{ margin: '20px', minHeight:"300px", marginBottom:"30px" }}>
          <AimOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <h2>Our Mission</h2>
          <p>To empower lawyers with the tools they need to deliver excellent legal services and manage their practices effectively.</p>
        </Card>
        <Card style={{ margin: '20px', minHeight:"300px", marginBottom:"30px" }}>
          <EyeOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <h2>Our Vision</h2>
          <p>To be the leading provider of legal management solutions, helping law firms around the world streamline their operations.</p>
        </Card>
        <Card style={{ margin: '20px', minHeight:"300px", marginBottom:"30px" }}>
          <TeamOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <h2>Our Values</h2>
          <p>Integrity, innovation, and a commitment to client success are at the core of everything we do.</p>
        </Card>
      </Carousel>

      {/* Team Members Section */}
      <div style={{ marginTop: '40px' }}>
        <h2>Meet Our Team</h2>
        <Row gutter={16}>
          {teamMembers.map((member, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card title={member.name} bordered={false} style={{ textAlign: 'center' }}>
                <p>{member.role}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default About;
