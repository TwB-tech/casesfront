import React from 'react';

const Privacy = () => {
  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: '64px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>
          Privacy Policy
        </h1>
        <div style={{ color: '#9ca3af', lineHeight: 1.8 }}>
          <p style={{ marginBottom: '24px' }}>Last updated: April 2026</p>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#fff',
              marginTop: '32px',
              marginBottom: '16px',
            }}
          >
            Introduction
          </h2>
          <p style={{ marginBottom: '16px' }}>At WakiliWorld, we take your privacy seriously.</p>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#fff',
              marginTop: '32px',
              marginBottom: '16px',
            }}
          >
            Information We Collect
          </h2>
          <p style={{ marginBottom: '16px' }}>We collect information you provide directly to us.</p>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#fff',
              marginTop: '32px',
              marginBottom: '16px',
            }}
          >
            How We Use Your Information
          </h2>
          <p style={{ marginBottom: '16px' }}>
            We use your information to provide and maintain our services.
          </p>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#fff',
              marginTop: '32px',
              marginBottom: '16px',
            }}
          >
            Data Security
          </h2>
          <p style={{ marginBottom: '16px' }}>We implement appropriate security measures.</p>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#fff',
              marginTop: '32px',
              marginBottom: '16px',
            }}
          >
            Contact Us
          </h2>
          <p style={{ marginBottom: '16px' }}>Contact us at admin@techwithbrands.com</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
