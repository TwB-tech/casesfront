import { Link } from 'react-router-dom';

const Process = () => {
  const features = [
    {
      title: 'Case Management',
      desc: 'Track case progress, manage deadlines, and organize all files in one secure location',
    },
    {
      title: 'Client Portal',
      desc: 'Give clients secure access to view case status, documents, and communicate with you',
    },
    {
      title: 'Document Automation',
      desc: 'Generate contracts, letters, and legal documents templates with AI assistance',
    },
    {
      title: 'Team Collaboration',
      desc: 'Assign tasks, track progress, and work together seamlessly across matters',
    },
  ];

  const benefits = [
    { title: 'Secure Storage', desc: 'Bank-grade encryption' },
    { title: 'Analytics', desc: 'Performance insights' },
    { title: 'Task Tracking', desc: 'Never miss deadlines' },
    { title: 'Calendar', desc: 'Smart scheduling' },
    { title: 'Video Calls', desc: 'Client meetings' },
  ];

  return (
    <section style={{ background: '#000000', padding: '80px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
            Everything You Need to Run Your Practice
          </h2>
          <p style={{ fontSize: '16px', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
            Powerful tools designed specifically for legal professionals
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d0d 100%)',
                border: '1px solid #2a2a3e',
                borderRadius: '12px',
                padding: '32px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '12px',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {benefits.map((benefit, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}
              />
              <span style={{ color: '#d1d5db', fontSize: '14px' }}>{benefit.title}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <Link
            to="/signup"
            style={{
              background: '#8b5cf6',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
              display: 'inline-block',
            }}
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Process;
