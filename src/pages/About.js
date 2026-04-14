import React from 'react';
import { Row, Col, Card } from 'antd';
import { TeamOutlined, EyeOutlined, AimOutlined, RocketOutlined, SafetyOutlined, HeartOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const teamMembers = [
  { name: 'Sarah Mitchell', role: 'CEO & Co-Founder', avatar: 'SM', specialty: 'Legal Tech' },
  { name: 'Michael Chen', role: 'CTO & Co-Founder', avatar: 'MC', specialty: 'Product Development' },
  { name: 'Amanda Rodriguez', role: 'Head of Operations', avatar: 'AR', specialty: 'Client Success' },
  { name: 'David Thompson', role: 'Lead Developer', avatar: 'DT', specialty: 'Engineering' },
  { name: 'Jennifer Walsh', role: 'UX Designer', avatar: 'JW', specialty: 'Product Design' },
  { name: 'Robert Kim', role: 'Legal Advisor', avatar: 'RK', specialty: 'Compliance' },
];

const stats = [
  { value: '10,000+', label: 'Hours saved by legal professionals' },
  { value: '500+', label: 'Law firms using WakiliWorld' },
  { value: '50,000+', label: 'Cases managed on platform' },
  { value: '99.9%', label: 'Platform uptime' },
];

const values = [
  {
    icon: AimOutlined,
    title: 'Our Mission',
    description: 'To eliminate the administrative burden that stops lawyers from doing their best work.',
  },
  {
    icon: EyeOutlined,
    title: 'Our Vision',
    description: 'A world where legal professionals spend their time practicing law, not managing it.',
  },
  {
    icon: HeartOutlined,
    title: 'Our Values',
    description: 'Integrity first. Practical solutions. Respect for the profession.',
  },
];

const About = () => {
  const { isFuturistic, themeConfig } = useTheme();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      
      {/* Hero Section */}
      <div className="text-center mb-16 pt-8">
        <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
          isFuturistic ? 'text-aurora-text' : 'text-primary-900'
        }`}>
          About 
          <span className={isFuturistic ? 'gradient-text' : 'text-accent-500'}> WakiliWorld</span>
        </h1>
        <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
          isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
        }`}>
          We build tools that give legal professionals their time back. Because the best lawyers 
          should be practicing law, not doing paperwork.
        </p>
      </div>

      {/* Stats Section */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 p-8 rounded-2xl ${
        isFuturistic 
          ? 'bg-gradient-to-r from-aurora-primary/10 to-aurora-secondary/10 border border-aurora-primary/20' 
          : 'bg-gradient-to-r from-primary-50 to-accent-50'
      }`}>
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className={`text-3xl md:text-4xl font-bold mb-2 ${
              isFuturistic ? 'text-aurora-primary' : 'text-primary-700'
            }`}>
              {stat.value}
            </div>
            <div className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Introduction Section */}
      <Row gutter={[48, 48]} style={{ marginBottom: '80px' }} align="middle">
        <Col xs={24} md={12}>
          <div>
            <h2 className={`text-3xl font-bold mb-6 ${
              isFuturistic ? 'text-aurora-text' : 'text-primary-900'
            }`}>
              Built for the way you actually work
            </h2>
            <p className={`text-lg leading-relaxed mb-6 ${
              isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
            }`}>
              WakiliWorld was created by lawyers who understood a fundamental truth: the administrative 
              burden of modern practice is killing what made us go into law in the first place.
            </p>
            <p className={`text-lg leading-relaxed ${
              isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
            }`}>
              Our platform does not just organize your work - it eliminates it. With intelligent 
               automation, on-demand law firm and advocate support, and tools built exclusively for legal professionals.
            </p>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className={`rounded-2xl p-8 md:p-12 text-center ${
            isFuturistic 
              ? 'bg-gradient-to-br from-aurora-primary/20 to-aurora-secondary/20 border border-aurora-primary/30' 
              : 'bg-gradient-to-br from-primary-800 to-primary-900'
          }`}>
            <RocketOutlined className={`text-6xl mb-4 ${isFuturistic ? 'text-aurora-primary' : 'text-white'}`} />
            <h3 className={`text-5xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-white'}`}>
              10,000+
            </h3>
            <p className={`text-lg ${isFuturistic ? 'text-aurora-muted' : 'text-white/80'}`}>
              Hours saved by legal professionals
            </p>
          </div>
        </Col>
      </Row>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className={`text-3xl font-bold mb-8 text-center ${
          isFuturistic ? 'text-aurora-text' : 'text-primary-900'
        }`}>
          What We Stand For
        </h2>
        
        <Row gutter={[24, 24]}>
          {values.map((value, idx) => (
            <Col xs={24} md={8} key={idx}>
              <Card 
                className={`h-full transition-all duration-300 hover:-translate-y-2 ${
                  isFuturistic 
                    ? 'bg-cyber-card border-cyber-border hover:border-aurora-primary/50' 
                    : 'hover:shadow-lg'
                }`}
                style={{
                  borderRadius: '16px',
                  minHeight: '280px',
                }}
                styles={{
                  body: {
                    padding: '32px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }
                }}
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                  isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-100'
                }`}>
                  <value.icon className={`text-3xl ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
                  {value.title}
                </h3>
                <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                  {value.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features Section */}
      <div className={`mb-16 p-8 rounded-2xl ${
        isFuturistic ? 'bg-cyber-card border border-cyber-border' : 'bg-white border border-neutral-200 shadow-sm'
      }`}>
        <h2 className={`text-3xl font-bold mb-8 text-center ${
          isFuturistic ? 'text-aurora-text' : 'text-primary-900'
        }`}>
          Why WakiliWorld?
        </h2>
        
        <Row gutter={[24, 24]}>
          {[
            { icon: RocketOutlined, title: 'AI-Powered', desc: 'Intelligent automation that handles routine tasks' },
            { icon: SafetyOutlined, title: 'Secure', desc: 'Bank-grade encryption and compliance features' },
             { icon: TeamOutlined, title: 'Scalable Support', desc: 'On-demand law firms and advocates when you need them' },
            { icon: HeartOutlined, title: 'Built by Lawyers', desc: 'Created by legal professionals who understand your needs' },
          ].map((feature, idx) => (
            <Col xs={24} sm={12} md={6} key={idx}>
              <div className="text-center p-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-50'
                }`}>
                  <feature.icon className={`text-2xl ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`} />
                </div>
                <h3 className={`font-semibold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                  {feature.desc}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className={`text-3xl font-bold mb-8 text-center ${
          isFuturistic ? 'text-aurora-text' : 'text-primary-900'
        }`}>
          Meet Our Team
        </h2>
        
        <Row gutter={[24, 24]}>
          {teamMembers.map((member, index) => (
            <Col xs={12} sm={8} md={4} key={index}>
              <Card 
                className={`text-center transition-all duration-300 hover:-translate-y-2 ${
                  isFuturistic 
                    ? 'bg-cyber-card border-cyber-border hover:border-aurora-primary/50' 
                    : 'hover:shadow-lg'
                }`}
                style={{ borderRadius: '12px' }}
                styles={{ body: { padding: '24px' } }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-xl font-bold ${
                  isFuturistic 
                    ? 'bg-gradient-to-br from-aurora-primary to-aurora-secondary text-white' 
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {member.avatar}
                </div>
                <h3 className={`font-semibold mb-1 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
                  {member.name}
                </h3>
                <p className={`text-sm mb-1 ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}>
                  {member.role}
                </p>
                <p className={`text-xs ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                  {member.specialty}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA */}
      <div className={`text-center p-12 rounded-2xl ${
        isFuturistic 
          ? 'bg-gradient-to-r from-aurora-primary/20 to-aurora-secondary/20 border border-aurora-primary/30' 
          : 'bg-gradient-to-r from-primary-800 to-primary-900 text-white'
      }`}>
        <h2 className={`text-3xl font-bold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-white'}`}>
          Ready to Transform Your Practice?
        </h2>
        <p className={`text-lg mb-8 max-w-2xl mx-auto ${
          isFuturistic ? 'text-aurora-muted' : 'text-white/80'
        }`}>
          Join thousands of legal professionals who have reclaimed their time with WakiliWorld.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all ${
              isFuturistic
                ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white shadow-aurora-primary/30 hover:shadow-aurora-primary/50'
                : 'bg-white text-primary-900 hover:bg-neutral-100'
            }`}
          >
            Start Free Trial
          </a>
          <a
            href="/contact"
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all ${
              isFuturistic
                ? 'border border-cyber-border text-aurora-text hover:bg-cyber-hover'
                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
            }`}
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
