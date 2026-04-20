import React from 'react';
import { Link } from 'react-router-dom';

const AppFooter = () => {
  return (
    <footer
      style={{
        backgroundColor: '#000000',
        color: '#6b7280',
        padding: '32px 24px',
        textAlign: 'center',
        width: '100%',
        borderTop: '1px solid #222',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Wakili</span>
            <span style={{ color: '#8b5cf6', fontWeight: 600 }}>World</span>
          </div>
          <div 
            className="footer-links"
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link
              to="/contact"
              style={{ color: '#6b7280', textDecoration: 'none', fontSize: '12px' }}
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              style={{ color: '#6b7280', textDecoration: 'none', fontSize: '12px' }}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              style={{ color: '#6b7280', textDecoration: 'none', fontSize: '12px' }}
            >
              Terms
            </Link>
          </div>
        </div>
        <div style={{ fontSize: '14px' }}>
          {new Date().getFullYear()} WakiliWorld. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
