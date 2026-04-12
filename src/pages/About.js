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
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 700, 
          color: '#102a43',
          marginBottom: '16px'
        }}>About WakiliWorld</h1>
        <p style={{ 
          fontSize: '20px', 
          color: '#486581',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          We build tools that give legal professionals their time back. Because the best lawyers should be practicing law, not doing paperwork.
        </p>
      </div>

      {/* Introduction Section */}
      <Row gutter={[32, 32]} style={{ marginBottom: '80px' }} align="middle">
        <Col xs={24} md={12}>
          <div>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              color: '#102a43',
              marginBottom: '24px'
            }}>Built for the way you actually work</h2>
            <p style={{ 
              fontSize: '18px', 
              color: '#486581',
              lineHeight: '1.8',
              marginBottom: '16px'
            }}>
              WakiliWorld was created by lawyers who understood a fundamental truth: the administrative burden of modern practice is killing what made us go into law in the first place.
            </p>
            <p style={{ 
              fontSize: '18px', 
              color: '#486581',
              lineHeight: '1.8'
            }}>
              Our platform doesn't just organize your work—it eliminates it. With intelligent automation, on-demand paralegal support, and tools built exclusively for legal professionals.
            </p>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ 
            background: 'linear-gradient(135deg, #102a43 0%, #243b53 100%)',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'white', fontSize: '64px', fontWeight: 700, marginBottom: '8px' }}>10,000+</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>Hours saved by legal professionals</p>
          </div>
        </Col>
      </Row>

      {/* Values Section */}
      <div style={{ marginBottom: '80px' }}>
        <h2 style={{ 
          textAlign: 'center',
          fontSize: '36px', 
          fontWeight: 600, 
          color: '#102a43',
          marginBottom: '48px'
        }}>What We Stand For</h2>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card style={{ 
              minHeight: '280px', 
              textAlign: 'center',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <AimOutlined style={{ fontSize: '48px', color: '#102a43' }} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#102a43', marginBottom: '16px' }}>Our Mission</h3>
              <p style={{ color: '#486581', lineHeight: '1.6' }}>
                To eliminate the administrative burden that stops lawyers from doing their best work.
              </p>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card style={{ 
              minHeight: '280px', 
              textAlign: 'center',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <EyeOutlined style={{ fontSize: '48px', color: '#102a43' }} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#102a43', marginBottom: '16px' }}>Our Vision</h3>
              <p style={{ color: '#486581', lineHeight: '1.6' }}>
                A world where legal professionals spend their time practicing law, not managing it.
              </p>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card style={{ 
              minHeight: '280px', 
              textAlign: 'center',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <TeamOutlined style={{ fontSize: '48px', color: '#102a43' }} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#102a43', marginBottom: '16px' }}>Our Values</h3>
              <p style={{ color: '#486581', lineHeight: '1.6' }}>
                Integrity first. Practical solutions. Respect for the profession.
              </p>
            </Card>
          </Col>
        </Row>
      </div>

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
