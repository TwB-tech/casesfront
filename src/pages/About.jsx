import React from 'react';

const leadership = [
  {
    name: 'Tony Kamau',
    role: 'Execution Partner',
    bio: 'Leading overall execution and business strategy with 15 years in African legal tech.',
  },
  {
    name: 'Frank Mwaura',
    role: 'Chief Technology Officer',
    bio: 'Former litigation lawyer now driving technical innovation.',
  },
  {
    name: 'Elvis Mwangi',
    role: 'Chief Financial Officer',
    bio: 'Managing financial strategy and growth across East Africa.',
  },
];

const engineers = [
  {
    name: 'James Omare',
    role: 'Senior Engineer',
    bio: 'Full-stack developer with expertise in legal software.',
  },
  { name: 'Meshak Okello', role: 'Engineer', bio: 'Backend systems and database architecture.' },
  { name: 'Beverlyne Langat', role: 'Engineer', bio: 'Frontend specialist and UI/UX developer.' },
  { name: 'Robin Ochieng', role: 'Engineer', bio: 'Mobile and responsive development.' },
  { name: 'Ridge Benson', role: 'Engineer', bio: 'API development and integrations.' },
];

const stats = [
  { value: '500+', label: 'Law Firms' },
  { value: '50,000+', label: 'Cases Managed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

const values = [
  {
    title: 'Our Mission',
    description:
      'To eliminate administrative burden that stops lawyers from doing their best work.',
  },
  {
    title: 'Our Vision',
    description: 'To be the leading legal practice management platform across Africa.',
  },
  {
    title: 'Our Values',
    description: 'Innovation, integrity, and client success drive everything we do.',
  },
];

const About = () => {
  return (
    <div style={{ background: '#000000', minHeight: '100vh', paddingTop: '64px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          About WakiliWorld
        </h1>
        <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '48px', maxWidth: '700px' }}>
          We are building the modern platform that African legal professionals deserve.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '64px',
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '24px',
                background: '#0d0d0d',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>
          Leadership
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {leadership.map((member, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                background: '#0d0d0d',
                borderRadius: '12px',
                border: '1px solid #222',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                {member.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#8b5cf6', marginBottom: '12px' }}>
                {member.role}
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>{member.bio}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>
          Engineering Team
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {engineers.map((member, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                background: '#0d0d0d',
                borderRadius: '12px',
                border: '1px solid #222',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                {member.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#8b5cf6', marginBottom: '12px' }}>
                {member.role}
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>{member.bio}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>
          What We Believe
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
          }}
        >
          {values.map((value, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                background: '#0d0d0d',
                borderRadius: '12px',
                border: '1px solid #222',
              }}
            >
              <h3
                style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}
              >
                {value.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
