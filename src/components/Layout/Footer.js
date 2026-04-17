import React from 'react';
import { Layout } from 'antd';
import moment from 'moment';
import { useTheme } from '../../contexts/ThemeContext';

const { Footer } = Layout;

const AppFooter = () => {
  const currentYear = moment().format('YYYY');
  const { isFuturistic } = useTheme();

  return (
    <Footer
      style={{
        backgroundColor: isFuturistic ? '#0a0a0f' : '#f8fafc',
        color: isFuturistic ? '#94a3b8' : '#6b7280',
        padding: '16px 5px',
        textAlign: 'center',
        width: '100%',
        position: 'relative',
        bottom: '0',
        borderTop: isFuturistic ? '1px solid #2a2a3a' : '1px solid #e5e7eb',
        marginTop: 'auto',
        fontSize: '13px',
      }}
      className="mt-auto"
    >
      <div className="flex items-center justify-center gap-2">
        <span>&copy; {currentYear} WakiliWorld</span>
        <span className="mx-2">|</span>
        <span>Legal Practice Management</span>
        <span className="mx-2">|</span>
        <span>All Rights Reserved</span>
      </div>
    </Footer>
  );
};

export default AppFooter;
