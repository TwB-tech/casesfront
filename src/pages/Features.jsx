import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    category: 'Case Management',
    items: [
      { name: 'Case Tracking', desc: 'Track case progress from intake to resolution.' },
      { name: 'Deadline Reminders', desc: 'Never miss a filing deadline.' },
      { name: 'Case Notes', desc: 'Secure case notes with timestamps.' },
      { name: 'Court Dates', desc: 'Integrated court date tracking.' },
    ],
  },
  {
    category: 'Client Management',
    items: [
      { name: 'Client Portal', desc: 'Give clients secure access to their case status.' },
      { name: 'Contact Management', desc: 'Full client contact history.' },
      { name: 'Document Sharing', desc: 'Share documents securely.' },
      { name: 'Billing Integration', desc: 'Link clients to invoices.' },
    ],
  },
  {
    category: 'Document Management',
    items: [
      { name: 'Cloud Storage', desc: 'Secure document storage.' },
      { name: 'Version Control', desc: 'Track document versions.' },
      { name: 'E-Signatures', desc: 'Request electronic signatures.' },
      { name: 'Templates', desc: 'Document templates.' },
    ],
  },
  {
    category: 'Team Collaboration',
    items: [
      { name: 'Task Assignment', desc: 'Assign tasks to team members.' },
      { name: 'Chat', desc: 'Team messaging.' },
      { name: 'Activity Feed', desc: 'Track team activity.' },
      { name: 'Permissions', desc: 'Role-based access control.' },
    ],
  },
  {
    category: 'AI Assistant (Reya)',
    items: [
      { name: 'Document Drafting', desc: 'AI-powered document generation.' },
      { name: 'Legal Research', desc: 'Case law research assistance.' },
      { name: 'Contract Review', desc: 'AI-assisted contract review.' },
      { name: 'Meeting Notes', desc: 'Auto-generate summaries.' },
    ],
  },
  {
    category: 'Billing & Invoicing',
    items: [
      { name: 'Time Tracking', desc: 'Track billable hours.' },
      { name: 'Invoice Generation', desc: 'Create invoices.' },
      { name: 'Payments', desc: 'M-Pesa and card payments.' },
      { name: 'Reports', desc: 'Revenue tracking.' },
    ],
  },
];

const Features = () => {
  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: '64px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Powerful Features for Modern Legal Practice
        </h1>
        <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '48px' }}>
          Everything you need to run your practice efficiently, all in one platform.
        </p>

        {features.map((category, idx) => (
          <div key={idx} style={{ marginBottom: '48px' }}>
            <h2
              style={{ fontSize: '24px', fontWeight: 600, color: '#8b5cf6', marginBottom: '20px' }}
            >
              {category.category}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
              }}
            >
              {category.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '20px',
                    background: '#0d0d0d',
                    borderRadius: '12px',
                    border: '1px solid #222',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#fff',
                      marginBottom: '8px',
                    }}
                  >
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          style={{
            textAlign: 'center',
            padding: '48px',
            background: '#0d0d0d',
            borderRadius: '16px',
            marginTop: '32px',
          }}
        >
          <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Ready to Transform Your Practice?
          </h2>
          <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '24px' }}>
            Join hundreds of legal professionals already using WakiliWorld.
          </p>
          <Link
            to="/signup"
            style={{
              background: '#8b5cf6',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
