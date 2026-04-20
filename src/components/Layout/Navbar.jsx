import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Avatar, Button, Badge, Space, Tooltip } from 'antd';
import {
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  HomeOutlined,
  SettingOutlined,
  KeyOutlined,
  LockOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import Logo from '../../assets/LogoNoBg.png';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useLicense } from '../../contexts/LicenseContext';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const navigate = useNavigate();
  const { isFuturistic } = useTheme();
  const { logout, user } = useAuth();
  const { activation, trial } = useLicense();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { key: 'features', label: 'Features', path: '/features' },
    { key: 'firms', label: 'Find Firms', path: '/firms' },
    { key: 'pricing', label: 'Pricing', path: '/pricing' },
    { key: 'about', label: 'About', path: '/about' },
    { key: 'contact', label: 'Contact', path: '/contact' },
  ];

  const userMenu = (
    <Menu
      theme="dark"
      style={{
        background: isFuturistic ? '#0f0f18' : '#1f1f1f',
        border: '1px solid',
        borderColor: isFuturistic ? '#2a2a3a' : '#333',
      }}
      className="user-dropdown-menu"
    >
      <div className="text-center mb-4" style={{ padding: '13px' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '10px', fontWeight: 600 }}>
          {user?.username}
        </h2>
        <p style={{ color: '#aaaaaa', fontSize: '13px' }}>{user?.email}</p>
        {activation?.activated ? (
          <div style={{ marginTop: 8 }}>
            <Tooltip title="Licensed Software">
              <Badge
                status="success"
                text={
                  <span style={{ color: '#52c41a', fontSize: '12px' }}>
                    Licensed –{' '}
                    {activation.daysRemaining > 0 ? `${activation.daysRemaining}d left` : 'Expired'}
                  </span>
                }
              />
            </Tooltip>
          </div>
        ) : trial?.inTrial ? (
          <div style={{ marginTop: 8 }}>
            <Tooltip title="Trial Period">
              <Badge
                status="processing"
                text={
                  <span style={{ color: '#faad14', fontSize: '12px' }}>
                    Trial – {trial.daysRemaining}d remaining
                  </span>
                }
              />
            </Tooltip>
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <Tooltip title="Action Required">
              <Badge
                status="error"
                text={<span style={{ color: '#f5222d', fontSize: '12px' }}>Unlicensed</span>}
              />
            </Tooltip>
          </div>
        )}
      </div>
      <Menu.Item onClick={() => navigate('/home')} style={{ color: '#8b5cf6' }}>
        Dashboard
      </Menu.Item>
      <Menu.Item onClick={() => navigate('/profile')} style={{ color: '#8b5cf6' }}>
        Profile
      </Menu.Item>
      <Menu.Item onClick={() => navigate('/settings')} style={{ color: '#8b5cf6' }}>
        Settings
      </Menu.Item>
      {(user?.role === 'admin' || user?.role === 'administrator') && (
        <Menu.Item onClick={() => navigate('/admin-dashboard')} style={{ color: '#8b5cf6' }}>
          Admin Dashboard
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item onClick={handleLogout} style={{ color: '#8b5cf6' }}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const navStyle = {
    background: '#000000',
    borderBottom: '1px solid #222',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  };

  const linkStyle = {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.2s',
  };

  const buttonStyle = {
    background: '#8b5cf6',
    border: 'none',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  };

  return (
    <nav style={navStyle}>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={Logo} alt="WakiliWorld" style={{ height: '36px' }} />
          <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>
            Wakili<span style={{ color: '#8b5cf6' }}>World</span>
          </span>
        </div>

        {!isMobile && (
          <div className="flex items-center gap-6">
            {menuItems.map((item) => (
              <Link key={item.key} to={item.path} style={linkStyle}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Badge
              dot
              color={activation?.activated ? '#52c41a' : trial?.inTrial ? '#faad14' : '#f5222d'}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{
                  background: '#8b5cf6',
                  cursor: 'pointer',
                  border: activation?.activated
                    ? '2px solid #52c41a'
                    : trial?.inTrial
                      ? '2px solid #faad14'
                      : '2px solid #f5222d',
                }}
              />
            </Badge>
          </Dropdown>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" style={{ ...linkStyle, color: '#fff' }}>
              Sign In
            </Link>
            <Link to="/signup" style={buttonStyle}>
              Get Started
            </Link>
          </div>
        )}

        {isMobile && (
          <Dropdown
            overlay={
              <Menu 
                style={{ 
                  background: '#1a1a1a', 
                  border: '1px solid #333',
                  minWidth: '200px'
                }}
                selectedKeys={[]}
              >
                {menuItems.map((item) => (
                  <Menu.Item 
                    key={item.key} 
                    onClick={() => navigate(item.path)}
                    style={{ color: '#fff' }}
                  >
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu>
            }
            trigger={['click']}
            placement="bottomRight"
          >
            <MenuOutlined style={{ color: '#fff', fontSize: '20px', cursor: 'pointer' }} />
          </Dropdown>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
