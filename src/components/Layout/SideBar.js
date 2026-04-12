import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { 
  DashboardOutlined, 
  FileOutlined, 
  CalendarOutlined, 
  BarChartOutlined, 
  SettingOutlined, 
  BarsOutlined, 
  TwitterOutlined, 
  FacebookOutlined, 
  InstagramOutlined, 
  LinkedinOutlined, 
  UserOutlined, 
  FilePdfOutlined ,
  CheckSquareOutlined,
  WechatWorkOutlined,
  MailOutlined,
  MessageOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import './nav.css'

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, theme }) => {
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const isMobile = useMediaQuery({ query: '(max-width: 780px)' });

    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }

        if (!isMobile) {
            setCollapsed(false);
        }
    }, [isMobile, setCollapsed]);

    const selectedKey = () => {
        if (location.pathname.startsWith('/case-list') || location.pathname.startsWith('/case-details') || location.pathname.startsWith('/case-form')) {
            return '2';
        }
        if (location.pathname.startsWith('/clients') || location.pathname.startsWith('/client-details') || location.pathname.startsWith('/new-client')) {
            return '3';
        }
        if (location.pathname.startsWith('/documents') || location.pathname.startsWith('/document-details') || location.pathname.startsWith('/new-document')) {
            return '4';
        }
        if (location.pathname.startsWith('/invoices') || location.pathname.startsWith('/invoice-details') || location.pathname.startsWith('/new-invoice')) {
            return '5';
        }
        if (location.pathname.startsWith('/calendar-tasks') || location.pathname.startsWith('/calendar-tasks-details') || location.pathname.startsWith('/new-appointment')) {
            return '6';
        }
        if (location.pathname.startsWith('/reports') || location.pathname.startsWith('/report-details') || location.pathname.startsWith('/new-report')) {
            return '7';
        }
        if (location.pathname.startsWith('/settings') || location.pathname.startsWith('/user-settings') || location.pathname.startsWith('/system-settings')) {
            return '8';
        }
        if (location.pathname.startsWith('/tasks') || location.pathname.startsWith('/task-details') || location.pathname.startsWith('/new-task')) {
            return '9';
        }
        if (location.pathname.startsWith('/mailing') || location.pathname.startsWith('/mail-details') || location.pathname.startsWith('/new-mail')) {
            return '10';
        }

        if(location.pathname.startsWith('/chat') || location.pathname.startsWith('/chats') || location.pathname.startsWith('/new-chat')) {   
            return '11';
        }

        return '1';
    };

    const showDrawer = () => {
        setDrawerVisible(true);
      };
    
      const closeDrawer = () => {
        setDrawerVisible(false);
      };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };


    const sidebarContent = ( 
        <Menu 
        mode="inline" 
        selectedKeys={[selectedKey()]} 
        style={{
            borderRight: 0,
            background: theme === 'dark' ? '#001529' : '#fff',
            color: theme === 'dark' ? '#fff' : '#001529',
            overflowY:"auto"
        }}
    >
        <Menu.Item key="1" icon={<DashboardOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "1" ? '#1890ff' : theme === 'light' && selectedKey() === "1" ? '#4ba2f3c7' : 'transparent',}} onClick={closeDrawer}>
            <Link to="/home" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<FileOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "2" ? '#1890ff' : theme === 'light' && selectedKey() === "2" ? '#4ba2f3c7' : 'transparent',}} onClick={closeDrawer}>
            <Link to="/case-list" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Cases</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<UserOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "3" ? '#1890ff' : theme === 'light' && selectedKey() === "3" ? '#4ba2f3c7' : 'transparent',}} onClick={closeDrawer}>
            <Link to="/clients" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Clients</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<FilePdfOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "4" ? '#1890ff' : theme === 'light' && selectedKey() === "4" ? '#4ba2f3c7' : 'transparent',}}onClick={closeDrawer}>
            <Link to="/documents" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Documents</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<FilePdfOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "5" ? '#1890ff' : theme === 'light' && selectedKey() === "5" ? '#4ba2f3c7' : 'transparent',}} onClick={closeDrawer}>
            <Link to="/invoices" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Billings</Link>
        </Menu.Item>
        <Menu.Item key="9" icon={<CheckSquareOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "9" ? '#1890ff' : theme === 'light' && selectedKey() === "9" ? '#4ba2f3c7' : 'transparent',}} onClick={closeDrawer}>
            <Link to="/tasks" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Tasks</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<CalendarOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "6" ? '#1890ff' : theme === 'light' && selectedKey() === "6" ? '#4ba2f3c7' : 'transparent',}} onClick={closeDrawer}>
            <Link to="/calendar-tasks" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Calendar</Link>
        </Menu.Item>
        <Menu.Item key="10" icon={<MailOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "10" ? '#1890ff' : theme === 'light' && selectedKey() === "10" ? '#4ba2f3c7' : 'transparent',}} onClick={closeDrawer}>
            <Link to="/mailing" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Mailing</Link>
        </Menu.Item>
        <Menu.Item key="11" icon={<WechatWorkOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "11" ? '#1890ff' : theme === 'light' && selectedKey() === "11" ? '#1890ff' : 'transparent', marginBottom:"40px"}} onClick={closeDrawer}>
            <Link to="/chat-users" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Chats</Link>
        </Menu.Item>
        <Menu.Item key="8" icon={<SettingOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "8" ? '#1890ff' : theme === 'light' && selectedKey() === "8" ? '#1890ff' : 'transparent'}} onClick={closeDrawer}>
            <Link to="/settings" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Settings</Link>
        </Menu.Item>
        <Menu.Item key="7" icon={<BarChartOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "7" ? '#1890ff' : theme === 'light' && selectedKey() === "7" ? '#1890ff' : 'transparent',  marginBottom:"40px"}} onClick={closeDrawer}>
            <Link to="/reports" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Reports</Link>
        </Menu.Item>
        {/* <Menu.Item key="11" icon={<MessageOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} style={{background: theme === 'dark' && selectedKey() === "11" ? '#1890ff' : theme === 'light' && selectedKey() === "11" ? '#1890ff' : 'transparent',}}>
            <Link to="/chats" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>Chat</Link>
        </Menu.Item> */}
        
        <div className="bottom-menu-items">
            <div className="social-media-header" style={{ fontSize: collapsed ? '14px' : '16px', marginBottom: "23px", color: theme === 'dark' ? '#fff' : '#001529' }}>
                Follow Us
            </div>
            <div className="social-media-icons" style={{ color: theme === 'dark' ? '#fff' : '#001529' }}>
               <a href='https://x.com/techwithbrands' target="_blank"  rel="noreferrer" className='hover'> <TwitterOutlined  style={{color: theme === 'dark' ? '#fff' : '#001529', cursor: 'pointer'}}/></a>
               <a href='https://www.facebook.com/TwBonFB' target="_blank"  rel="noreferrer" className='hover'><FacebookOutlined  style={ {color: theme === 'dark' ? '#fff' : '#001529', cursor: 'pointer'}}/></a> 
               <a href='https://www.instagram.com/techwithbrands/' target="_blank"  rel="noreferrer" className='hover'> <InstagramOutlined style={ {color: theme === 'dark' ? '#fff' : '#001529', cursor: 'pointer'}}/></a>
               <a href='https://www.linkedin.com/company/techwithbrands/' target="_blank"  rel="noreferrer" className='hover'>  <LinkedinOutlined  style={ {color: theme === 'dark' ? '#fff' : '#001529', cursor: 'pointer'}}/></a>
            </div>
        </div>
    </Menu>
    )

    return (
        <>
        {!isMobile ? (
        <Sider 
            collapsed={collapsed} 
            onCollapse={toggleCollapsed} 
            style={{
                background: theme === 'dark' ? '#001529' : '#fff',
                height: '100vh',
                position: 'fixed',
                top: '70px',
                left: 0,
                overflowY: "auto",
            }}
        >
            <Button 
                type="text" 
                icon={<BarsOutlined style={{ color: theme === 'dark' ? '#fff' : '#001529' }}/>} 
                onClick={toggleCollapsed} 
                style={{
                    margin: '10px',
                    color: theme === 'dark' ? '#fff' : '#001529',
                    fontSize: '18px',
                }} 
                />
                {sidebarContent}
        </Sider>):(
        <>
            <Button 
                type="text" 
                icon={<BarsOutlined style={{ color:'blue', fontSize: '24px', zIndex:3000 }}/>} 
                onClick={showDrawer} 
                style={{
                    margin: '10px',
                    color: 'blue',
                    fontSize: '24px',
                    position: 'fixed'
                }} 
            />
                 <Drawer
                    title={
                        <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                            Menu
                        </span>
                    }
                    placement="left"
                    onClose={closeDrawer}
                    visible={drawerVisible}
                    bodyStyle={{ padding: 0 }}
                    closeIcon={
                        <CloseOutlined
                            style={{ color: theme === 'dark' ? '#fff' : '#000' }}
                        />
                    }
                    style={{
                        background: theme === 'dark' ? '#001529' : '#fff',
                        height: '100vh',
                        marginTop: '70px',
                        left: 0,
                        overflowY: "auto",
                    }}
                >
                    {sidebarContent}
                </Drawer>
            </>
        )}
        </>
    );
};

export default Sidebar;