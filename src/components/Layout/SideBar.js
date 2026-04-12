import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Menu } from 'antd';
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
  FilePdfOutlined,
  CheckSquareOutlined,
  WechatWorkOutlined,
  MailOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import './nav.css';

const { Sider } = Layout;

const ROUTE_CONFIG = [
  {
    key: '1',
    path: '/home',
    label: 'Dashboard',
    icon: DashboardOutlined,
    routes: ['/home'],
  },
  {
    key: '2',
    path: '/case-list',
    label: 'Cases',
    icon: FileOutlined,
    routes: ['/case-list', '/case-details', '/case-form'],
  },
  {
    key: '3',
    path: '/clients',
    label: 'Clients',
    icon: UserOutlined,
    routes: ['/clients', '/client-details', '/new-client'],
  },
  {
    key: '4',
    path: '/documents',
    label: 'Documents',
    icon: FilePdfOutlined,
    routes: ['/documents', '/document-details', '/new-document'],
  },
  {
    key: '5',
    path: '/invoices',
    label: 'Billings',
    icon: FileOutlined,
    routes: ['/invoices', '/invoice-details', '/new-invoice'],
  },
  {
    key: '6',
    path: '/calendar-tasks',
    label: 'Calendar',
    icon: CalendarOutlined,
    routes: ['/calendar-tasks', '/calendar-tasks-details', '/new-appointment'],
  },
  {
    key: '9',
    path: '/tasks',
    label: 'Tasks',
    icon: CheckSquareOutlined,
    routes: ['/tasks', '/task-details', '/new-task'],
  },
  {
    key: '10',
    path: '/mailing',
    label: 'Mailing',
    icon: MailOutlined,
    routes: ['/mailing', '/mail-details', '/new-mail'],
  },
  {
    key: '11',
    path: '/chat-users',
    label: 'Chats',
    icon: WechatWorkOutlined,
    routes: ['/chat', '/chats', '/new-chat', '/chat-users'],
  },
  {
    key: '12',
    path: '/paralegals',
    label: 'Paralegals',
    icon: UserOutlined,
    routes: ['/paralegals'],
  },
  {
    key: '7',
    path: '/reports',
    label: 'Reports',
    icon: BarChartOutlined,
    routes: ['/reports', '/report-details', '/new-report'],
    marginBottom: true,
  },
  {
    key: '8',
    path: '/settings',
    label: 'Settings',
    icon: SettingOutlined,
    routes: ['/settings', '/user-settings', '/system-settings'],
    marginBottom: true,
  },
];

const SOCIAL_LINKS = [
  { icon: TwitterOutlined, href: 'https://x.com/techwithbrands', label: 'Twitter' },
  { icon: FacebookOutlined, href: 'https://www.facebook.com/TwBonFB', label: 'Facebook' },
  { icon: InstagramOutlined, href: 'https://www.instagram.com/techwithbrands/', label: 'Instagram' },
  { icon: LinkedinOutlined, href: 'https://www.linkedin.com/company/techwithbrands/', label: 'LinkedIn' },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
    const location = useLocation();
    const { themeConfig, isFuturistic } = useTheme();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const isMobile = useMediaQuery({ query: '(max-width: 780px)' });

    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }
        if (!isMobile) {
            setDrawerVisible(false);
        }
    }, [isMobile, setCollapsed]);

    const selectedKey = useMemo(() => {
        const currentPath = location.pathname;
        for (const route of ROUTE_CONFIG) {
            if (route.routes.some(r => currentPath.startsWith(r))) {
                return route.key;
            }
        }
        return '1';
    }, [location.pathname]);

    const showDrawer = () => setDrawerVisible(true);
    const closeDrawer = () => setDrawerVisible(false);
    const toggleCollapsed = () => setCollapsed(!collapsed);

    const getMenuItemStyle = (itemKey) => {
        const isSelected = selectedKey === itemKey;
        
        if (isFuturistic) {
            return {
                background: isSelected ? `${themeConfig.accent}20` : 'transparent',
                borderLeft: isSelected ? `3px solid ${themeConfig.accent}` : '3px solid transparent',
                marginLeft: isSelected ? '-3px' : '0',
                borderRadius: '0 8px 8px 0',
            };
        }
        
        return {
            background: isSelected ? (themeConfig.sidebar.active + '15') : 'transparent',
        };
    };

    const renderMenuItems = (onItemClick = closeDrawer) => (
        <div className="flex flex-col h-full">
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                style={{
                    borderRight: 0,
                    background: 'transparent',
                    overflowY: 'auto',
                    flex: 1,
                }}
            >
                {ROUTE_CONFIG.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Menu.Item
                            key={item.key}
                            icon={<Icon className={isFuturistic ? 'text-aurora-muted' : ''} />}
                            style={{
                                ...getMenuItemStyle(item.key),
                                marginBottom: item.marginBottom ? '40px' : '4px',
                                color: isFuturistic 
                                    ? (selectedKey === item.key ? themeConfig.accent : themeConfig.sidebar.text)
                                    : themeConfig.sidebar.text,
                            }}
                            className={`menu-item-custom ${isFuturistic ? 'futuristic-menu-item' : ''}`}
                            onClick={onItemClick}
                        >
                            <Link to={item.path}>{item.label}</Link>
                        </Menu.Item>
                    );
                })}
            </Menu>

            {isFuturistic && !collapsed && (
                <div className="p-4 border-t border-cyber-border">
                    <ThemeSwitcher compact />
                </div>
            )}

            {!collapsed && (
                <div className="p-4 border-t border-neutral-200 dark:border-cyber-border">
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
                        isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'
                    }`}>
                        Follow Us
                    </div>
                    <div className={`flex gap-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
                        {SOCIAL_LINKS.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                className={`transition-colors hover:scale-110 ${
                                    isFuturistic ? 'hover:text-aurora-primary' : 'hover:text-accent-600'
                                }`}
                            >
                                <social.icon />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const sidebarStyles = {
        background: isFuturistic ? themeConfig.sidebar.bg : '#fff',
        height: '100vh',
        position: 'fixed',
        top: '64px',
        left: 0,
        overflowY: 'auto',
        borderRight: isFuturistic ? `1px solid ${themeConfig.sidebar.border}` : '1px solid #e0e0e0',
        ...(isFuturistic && {
            background: `
                linear-gradient(180deg, ${themeConfig.sidebar.bg} 0%, #0f0f18 100%)
            `,
        }),
    };

    return (
        <>
            {!isMobile ? (
                <Sider 
                    collapsed={collapsed} 
                    onCollapse={toggleCollapsed}
                    width={260}
                    collapsedWidth={80}
                    style={sidebarStyles}
                    className={isFuturistic ? 'sidebar-futuristic' : ''}
                >
                    <button 
                        type="button"
                        onClick={toggleCollapsed} 
                        className={`
                            w-full flex items-center justify-center p-3
                            transition-colors duration-200
                            ${isFuturistic 
                                ? 'text-aurora-muted hover:text-aurora-text hover:bg-cyber-hover' 
                                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                            }
                        `}
                    >
                        <BarsOutlined className="text-lg" />
                    </button>
                    {renderMenuItems()}
                </Sider>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={showDrawer} 
                        className={`
                            fixed top-4 left-4 z-[3000] p-2 rounded-lg
                            ${isFuturistic 
                                ? 'bg-cyber-surface text-aurora-text' 
                                : 'bg-white text-primary-900 shadow-md'
                            }
                        `}
                    >
                        <BarsOutlined className="text-xl" />
                    </button>
                    
                    <Layout.Sider
                        open={drawerVisible}
                        onClose={closeDrawer}
                        placement="left"
                        width={280}
                        style={{
                            background: isFuturistic ? themeConfig.sidebar.bg : '#fff',
                            height: '100vh',
                            marginTop: '64px',
                        }}
                        drawerStyle={{
                            background: 'transparent',
                        }}
                        className={isFuturistic ? 'mobile-drawer-futuristic' : ''}
                    >
                        <div className={`
                            flex items-center justify-between p-4 border-b
                            ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}
                        `}>
                            <span className={`font-semibold ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}>
                                Menu
                            </span>
                            <button
                                onClick={closeDrawer}
                                className={`p-1 rounded ${isFuturistic ? 'text-aurora-muted hover:text-aurora-text' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                <CloseOutlined />
                            </button>
                        </div>
                        {renderMenuItems()}
                    </Layout.Sider>
                </>
            )}
        </>
    );
};

export default Sidebar;
