import React from 'react';
import { Layout } from 'antd';
import moment from 'moment';

const { Footer } = Layout;

const AppFooter = ({ theme }) => {
  const currentYear = moment().format('YYYY');
  return (
    <Footer
      style={{
        backgroundColor: theme === 'dark' ? '#001529' : '#485057',
        color: '#fff',
        padding: '10px 5px',
        textAlign: 'center',
        width: '100%',
        position: 'relative',
        bottom: '0',
        borderRadius:"10px"
      }}
    >
      © {currentYear} Casefile. All Rights reserved.
    </Footer>
  );
};

export default AppFooter;