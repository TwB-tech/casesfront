import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Avatar, Button } from 'antd';
import { UserOutlined, MenuOutlined, LogoutOutlined, HomeOutlined, BellOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import Logo from '../../assets/LogoNoBg.png';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme, isFuturistic, themeConfig } = useTheme();

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

  const handleNav = (path) => {
    navigate(path);
    setDropdownVisible(false);
  };

  const menu = (
    <Menu className={isFuturistic ? 'futuristic-dropdown' : ''}>
      <Menu.Item key="home" onClick={() => handleNav('/')}>Home</Menu.Item>
      <Menu.Item key="features" onClick={() => handleNav('/#features')}>Features</Menu.Item>
      <Menu.Item key="pricing" onClick={() => handleNav('/pricing')}>Pricing</Menu.Item>
       <Menu.Item key="firms" onClick={() => handleNav('/firms')}>Law Firms</Menu.Item>
      <Menu.Item key="about" onClick={() => handleNav('/about')}>About</Menu.Item>
      <Menu.Item key="contact" onClick={() => handleNav('/contact')}>Contact Us</Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu style={{ padding: '13px' }} className={isFuturistic ? 'futuristic-dropdown' : ''}>
      <div className="text-center mb-4">
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: isFuturistic ? '#f8fafc' : '#1a1a1a' }}>
          {user?.username}
        </h2>
        <p style={{ color: isFuturistic ? '#94a3b8' : '#757575', fontSize: '12px', margin: 0 }}>
          {user?.email}
        </p>
      </div>
      <div className={`border-t border-b py-3 mb-3 ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>Theme:</span>
          <Button 
            size="small"
            type={theme === THEMES.CLASSIC ? 'primary' : 'default'}
            onClick={() => theme !== THEMES.CLASSIC && toggleTheme()}
            className={theme === THEMES.CLASSIC ? '' : (isFuturistic ? 'bg-cyber-surface' : '')}
          >
            Classic
          </Button>
          <Button 
            size="small"
            type={theme === THEMES.FUTURISTIC ? 'primary' : 'default'}
            onClick={() => theme !== THEMES.FUTURISTIC && toggleTheme()}
            className={theme === THEMES.FUTURISTIC ? 'futuristic-btn' : (isFuturistic ? 'bg-cyber-surface' : '')}
          >
            Futuristic
          </Button>
        </div>
      </div>
      {isMobile && (
        <>
          <Menu.Item key="notifications"><BellOutlined /> Notifications</Menu.Item>
          <Menu.Item key="messages"><MessageOutlined /> Messages</Menu.Item>
        </>
      )}
      <Menu.Item key="dashboard" onClick={() => handleNav('/home')}><HomeOutlined /> Dashboard</Menu.Item>
        {user?.role === 'admin' && (
          <Menu.Item key="admin" onClick={() => handleNav('/admin-dashboard')}><SettingOutlined /> Admin</Menu.Item>
        )}
      <Menu.Item key="profile" onClick={() => handleNav('/profile')}><UserOutlined /> Profile</Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}><LogoutOutlined /> Logout</Menu.Item>
    </Menu>
  );

  return (
    <div 
      className={`navbar ${isFuturistic ? 'navbar-futuristic' : 'navbar-classic'}`}
      style={{
        background: themeConfig.navbar.bg,
        borderBottom: `1px solid ${isFuturistic ? themeConfig.navbar.border : '#e0e0e0'}`,
      }}
    >
      {/* Clickable Logo */}
      <div 
        className="navbar-logo cursor-pointer flex items-center gap-3"
        onClick={() => navigate('/')}
        role="link"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && navigate('/')}
      >
        <img src={Logo} alt='WakiliWorld Logo' style={{ maxHeight: '44px', maxWidth: '44px', cursor: 'pointer' }} />
        <div className="navbar-company hidden sm:flex" style={{ color: isFuturistic ? '#f8fafc' : '#102a43' }}>
          <span>Wakili</span><span style={{ color: isFuturistic ? '#6366f1' : '#1890ff' }}>World</span>
        </div>
      </div>
      
      {/* Navigation Menu - Desktop */}
      <div className="navbar-menus">
        <div className="desktop-menu">
          <Button 
            type="link" 
            className={`menu-item ${isFuturistic ? 'menu-item-futuristic' : ''}`} 
            onClick={() => handleNav('/')}
            style={{ color: isFuturistic ? '#f8fafc' : '#102a43' }}
          >
            Home
          </Button>
          <Button 
            type="link" 
            className={`menu-item ${isFuturistic ? 'menu-item-futuristic' : ''}`} 
            onClick={() => handleNav('/pricing')}
            style={{ color: isFuturistic ? '#f8fafc' : '#102a43' }}
          >
            Pricing
          </Button>
           <Button 
             type="link" 
             className={`menu-item ${isFuturistic ? 'menu-item-futuristic' : ''}`} 
             onClick={() => handleNav('/firms')}
             style={{ color: isFuturistic ? '#f8fafc' : '#102a43' }}
           >
             Law Firms
           </Button>
          <Button 
            type="link" 
            className={`menu-item ${isFuturistic ? 'menu-item-futuristic' : ''}`} 
            onClick={() => handleNav('/about')}
            style={{ color: isFuturistic ? '#f8fafc' : '#102a43' }}
          >
            About
          </Button>
          <Button 
            type="link" 
            className={`menu-item ${isFuturistic ? 'menu-item-futuristic' : ''}`} 
            onClick={() => handleNav('/contact')}
            style={{ color: isFuturistic ? '#f8fafc' : '#102a43' }}
          >
            Contact
          </Button>
        </div>
        
        {/* Mobile Menu */}
        <div className="mobile-menu">
          <Dropdown 
            overlay={menu}
            trigger={['click']}
            visible={dropdownVisible}
            onVisibleChange={setDropdownVisible}
          >
            <MenuOutlined 
              onClick={() => setDropdownVisible(!dropdownVisible)} 
              style={{ color: isFuturistic ? '#f8fafc' : '#102a43', fontSize: '20px', cursor: 'pointer' }}
            />
          </Dropdown>
        </div>
      </div>
      
      {/* Auth Buttons */}
      <div className="navbar-avatar">
        {user ? (
          <>
          {!isMobile && (
            <>
              <BellOutlined 
                style={{ 
                  fontSize: '18px', 
                  marginRight: '12px', 
                  cursor: 'pointer',
                  color: isFuturistic ? '#94a3b8' : '#757575',
                  transition: 'color 0.2s'
                }} 
                className="hover:opacity-80"
                onClick={() => {}}
              />
              <MessageOutlined 
                style={{ 
                  fontSize: '18px', 
                  marginRight: '12px', 
                  cursor: 'pointer',
                  color: isFuturistic ? '#94a3b8' : '#757575',
                  transition: 'color 0.2s'
                }} 
                className="hover:opacity-80"
                onClick={() => handleNav('/mailing')}
              />
            </>
          )}
          <Dropdown overlay={userMenu} placement="bottomCenter" trigger={['click']}>
            <Avatar 
              icon={user ? user.email[0].toUpperCase() : <UserOutlined />} 
              size={36} 
              style={{ 
                border: isFuturistic ? '2px solid #6366f1' : '2px solid #22a85a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isFuturistic ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1890ff',
              }}
              className="hover:scale-105 transition-transform"
            />
          </Dropdown>
          </>
       ) : (
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleNav('/login')}
              className={isFuturistic ? 'border-cyber-border text-aurora-text' : ''}
              style={{
                borderColor: isFuturistic ? '#2a2a3a' : undefined,
                color: isFuturistic ? '#f8fafc' : undefined,
              }}
            >
              Login
            </Button>
            <Button 
              type="primary"
              onClick={() => handleNav('/signup')}
              className={isFuturistic ? 'futuristic-btn' : ''}
            >
              Get Started
            </Button>
          </div>
        )} 
      </div>
    </div>
  );
};

export default Navbar;
