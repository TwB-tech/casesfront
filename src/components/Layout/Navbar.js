import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Avatar, Button, Switch } from 'antd';
import { UserOutlined, MenuOutlined, LogoutOutlined, HomeOutlined, NotificationOutlined, MessageOutlined } from '@ant-design/icons';
import Logo from '../../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';


const Navbar = ({ theme, toggleTheme }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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

  const handleNav = (path) => {
    navigate(path);
    setDropdownVisible(false); // Close dropdown after navigation
  };



  const menu = (
    <Menu>
      <Menu.Item key="home" onClick={() => handleNav('/')}>Home</Menu.Item>
      <Menu.Item key="about" onClick={() => handleNav('/about')}>About</Menu.Item>
      <Menu.Item key="contact" onClick={() => handleNav('/contact')}>Contact Us</Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu style={{ padding: '13px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>{user?.username}</h2>
      {isMobile && (
        <>
          <Switch checked={theme === 'dark'} onChange={toggleTheme} checkedChildren="Dark" unCheckedChildren="Light" style={{ marginRight: '10px' }} />
          <Menu.Item key="notifications"><NotificationOutlined /> Notifications</Menu.Item>
          <Menu.Item key="messages"><MessageOutlined /> Messages</Menu.Item>
        </>
      )}
      <Menu.Item key="dashboard" onClick={() => handleNav('/home')}><HomeOutlined /> Dashboard</Menu.Item>
        {user?.role === 'admin' && (
          <Menu.Item key="admin" onClick={() => handleNav('/admin-dashboard')}><UserOutlined /> Admin</Menu.Item>
        )}
      <Menu.Item key="profile" onClick={() => handleNav('/profile')}><UserOutlined /> Profile</Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}><LogoutOutlined /> Logout</Menu.Item>
    </Menu>
  );

  return (
    <div className={`navbar ${theme}`}>
      <div className="navbar-logo">
        <img src={Logo} alt='Logo' style={{ maxHeight: '50px', maxWidth: '50px' }} />
      </div>
      <div className="navbar-company"><span style={{}}>Wakili</span><span>World</span></div>
      <div className="navbar-menus">
        {/* Desktop view */}
        <div className="desktop-menu">
          <Button type="text" className="menu-item" onClick={() => handleNav('/')}>Home</Button>
          <Button type="text" className="menu-item" onClick={() => handleNav('/about')}>About</Button>
          <Button type="text" className="menu-item" onClick={() => handleNav('/contact')}>Contact Us</Button>
        </div>
        {/* Mobile view */}
        <div className="mobile-menu">
          <Dropdown 
            overlay={menu}
            trigger={['click']}
            visible={dropdownVisible}
            onVisibleChange={setDropdownVisible}
          >
            <MenuOutlined onClick={() => setDropdownVisible(!dropdownVisible)} />
          </Dropdown>
        </div>
      </div>
      <div className="navbar-avatar">
        {user ? (
          <>
          {!isMobile && (
            <>
            <Switch checked={theme === 'dark'} onChange={toggleTheme} checkedChildren="Dark" unCheckedChildren="Light" style={{ marginRight: '10px' }} />
            <NotificationOutlined style={{ fontSize: '24px', marginRight: '15px', cursor: 'pointer' }} />
            <MessageOutlined style={{ fontSize: '24px', marginRight: '15px', cursor: 'pointer' }} />
          </>
        )}
          <Dropdown overlay={userMenu} placement="bottomCenter">
            <Avatar icon={user ? user.email[0].toUpperCase() : <UserOutlined />} size={50} style={{ border: '2px solid green' }} />
          </Dropdown>
          </>
       ) : (
          <Button onClick={() => handleNav('/login')} style={{ marginLeft: '10px' }}>Login</Button>
        )} 
      </div>
    </div>
  );
};

export default Navbar;
