import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Avatar, Button } from 'antd';
import {
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Logo from '../../assets/LogoNoBg.png';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
    <Menu style={{ background: '#000000', border: '1px solid #333' }}>
      <div className="text-center mb-4" style={{ padding: '13px' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '10px' }}>{user?.username}</h2>
        <p style={{ color: '#888' }}>{user?.email}</p>
      </div>
      <Menu.Item onClick={() => navigate('/home')}>Dashboard</Menu.Item>
      <Menu.Item onClick={() => navigate('/profile')}>Profile</Menu.Item>
      <Menu.Item onClick={() => navigate('/settings')}>Settings</Menu.Item>
      <Menu.Divider />
      <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
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
            <Avatar icon={<UserOutlined />} style={{ background: '#8b5cf6', cursor: 'pointer' }} />
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
              <Menu style={{ background: '#000', border: '1px solid #333' }}>
                {menuItems.map((item) => (
                  <Menu.Item key={item.key} onClick={() => navigate(item.path)}>
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu>
            }
            trigger={['click']}
          >
            <MenuOutlined style={{ color: '#fff', fontSize: '20px', cursor: 'pointer' }} />
          </Dropdown>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
