import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Menu, Drawer } from 'antd';
import {
  DashboardOutlined,
  FileOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  BarsOutlined,
  UserOutlined,
  FilePdfOutlined,
  CheckSquareOutlined,
  WechatWorkOutlined,
  MailOutlined,
  CloseOutlined,
  DollarOutlined,
  TeamOutlined,
  FileSearchOutlined,
  ProfileOutlined,
  SolutionOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import './nav.css';

const { Sider } = Layout;

const ROUTE_CONFIG = [
  {
    key: 'dashboard',
    path: '/home',
    label: 'Dashboard',
    icon: DashboardOutlined,
    routes: ['/home'],
  },
  {
    key: 'cases',
    path: '/case-list',
    label: 'Cases',
    icon: FileOutlined,
    routes: ['/case-list', '/case-details', '/case-form'],
  },
  {
    key: 'clients',
    path: '/clients',
    label: 'Clients',
    icon: UserOutlined,
    routes: ['/clients', '/client-details', '/new-client'],
  },
  {
    key: 'documents',
    path: '/documents',
    label: 'Documents',
    icon: FilePdfOutlined,
    routes: ['/documents', '/document-details', '/new-document'],
  },
  {
    key: 'calendar',
    path: '/calendar-tasks',
    label: 'Calendar',
    icon: CalendarOutlined,
    routes: ['/calendar-tasks', '/calendar-tasks-details', '/new-appointment'],
  },
  {
    key: 'tasks',
    path: '/tasks',
    label: 'Tasks',
    icon: CheckSquareOutlined,
    routes: ['/tasks', '/task-details', '/new-task'],
  },
  {
    key: 'firms',
    path: '/firms',
    label: 'Law Firms',
    icon: ShopOutlined,
    routes: ['/firms'],
    dividerAfter: true,
  },
  {
    key: 'accounting',
    path: '/accounting',
    label: 'Accounting',
    icon: DollarOutlined,
    routes: ['/accounting', '/invoices', '/expenses'],
  },
  {
    key: 'billing',
    path: '/invoices',
    label: 'Invoices',
    icon: FileSearchOutlined,
    routes: ['/invoices', '/invoice-details', '/new-invoice'],
  },
  {
    key: 'hr',
    path: '/hr',
    label: 'HR & Payroll',
    icon: TeamOutlined,
    routes: ['/hr', '/payroll'],
    dividerAfter: true,
  },
  {
    key: 'mailing',
    path: '/mailing',
    label: 'Mailing',
    icon: MailOutlined,
    routes: ['/mailing', '/mail-details', '/new-mail'],
  },
  {
    key: 'chats',
    path: '/chat-users',
    label: 'Chats',
    icon: WechatWorkOutlined,
    routes: ['/chat', '/chats', '/new-chat', '/chat-users'],
    dividerAfter: true,
  },
  {
    key: 'financial_reports',
    path: '/reports/financial',
    label: 'Financial Reports',
    icon: BarChartOutlined,
    routes: ['/reports/financial'],
  },
  {
    key: 'case_reports',
    path: '/reports',
    label: 'Case Reports',
    icon: SolutionOutlined,
    routes: ['/reports', '/report-details', '/new-report'],
    dividerAfter: true,
  },
  {
    key: 'features',
    path: '/features',
    label: 'Features',
    icon: SolutionOutlined,
    routes: ['/features'],
  },
  {
    key: 'pricing',
    path: '/pricing',
    label: 'Pricing',
    icon: DollarOutlined,
    routes: ['/pricing'],
  },
  {
    key: 'about',
    path: '/about',
    label: 'About',
    icon: UserOutlined,
    routes: ['/about'],
  },
  {
    key: 'contact',
    path: '/contact',
    label: 'Contact',
    icon: MailOutlined,
    routes: ['/contact'],
  },
  {
    key: 'privacy',
    path: '/privacy',
    label: 'Privacy',
    icon: FileOutlined,
    routes: ['/privacy'],
  },
  {
    key: 'terms',
    path: '/terms',
    label: 'Terms',
    icon: FileOutlined,
    routes: ['/terms'],
  },
  {
    key: 'profile',
    path: '/profile',
    label: 'Profile',
    icon: ProfileOutlined,
    routes: ['/profile'],
  },
  {
    key: 'settings',
    path: '/settings',
    label: 'Settings',
    icon: SettingOutlined,
    routes: ['/settings', '/user-settings', '/system-settings'],
  },
  {
    key: 'profile',
    path: '/profile',
    label: 'Profile',
    icon: ProfileOutlined,
    routes: ['/profile'],
  },
  {
    key: 'features',
    path: '/features',
    label: 'Features',
    icon: SolutionOutlined,
    routes: ['/features'],
  },
  {
    key: 'pricing',
    path: '/pricing',
    label: 'Pricing',
    icon: DollarOutlined,
    routes: ['/pricing'],
  },
  {
    key: 'about',
    path: '/about',
    label: 'About',
    icon: UserOutlined,
    routes: ['/about'],
  },
  {
    key: 'contact',
    path: '/contact',
    label: 'Contact',
    icon: MailOutlined,
    routes: ['/contact'],
  },
  {
    key: 'privacy',
    path: '/privacy',
    label: 'Privacy',
    icon: FileOutlined,
    routes: ['/privacy'],
  },
  {
    key: 'terms',
    path: '/terms',
    label: 'Terms',
    icon: FileOutlined,
    routes: ['/terms'],
  },
];

// Social links removed from navigation menu - not appropriate for dashboard

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeConfig, isFuturistic } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 780px)' });

  useEffect(() => {
    let timer;
    if (isMobile) {
      timer = setTimeout(() => setCollapsed(true), 0);
    } else {
      timer = setTimeout(() => setDrawerVisible(false), 0);
    }
    return () => clearTimeout(timer);
  }, [isMobile, setCollapsed]);

  const selectedKey = useMemo(() => {
    const currentPath = location.pathname;
    for (const route of ROUTE_CONFIG) {
      if (route.routes.some((r) => currentPath.startsWith(r))) {
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
      background: isSelected ? themeConfig.sidebar.active + '15' : 'transparent',
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
          padding: '8px 0',
        }}
      >
        {ROUTE_CONFIG.map((item) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.key}>
              <Menu.Item
                key={item.key}
                icon={<Icon className={isFuturistic ? 'text-aurora-muted' : ''} />}
                style={{
                  ...getMenuItemStyle(item.key),
                  marginBottom: '4px',
                  color: isFuturistic
                    ? selectedKey === item.key
                      ? themeConfig.accent
                      : themeConfig.sidebar.text
                    : themeConfig.sidebar.text,
                  height: '44px',
                  lineHeight: '44px',
                }}
                className={`menu-item-custom ${isFuturistic ? 'futuristic-menu-item' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  onItemClick();
                }}
              >
                {item.label}
              </Menu.Item>
              {item.dividerAfter && (
                <div
                  style={{
                    height: '1px',
                    background: isFuturistic ? '#2a2a3a' : '#e5e7eb',
                    margin: '8px 16px',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Menu>

      {!collapsed && (
        <div className="p-4 border-t border-neutral-200 dark:border-cyber-border">
          <ThemeSwitcher compact />
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
                            ${
                              isFuturistic
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
                             fixed top-[72px] left-4 z-[3000] p-3 rounded-xl shadow-lg
                             ${
                               isFuturistic
                                 ? 'bg-cyber-surface text-aurora-text border border-cyber-border'
                                 : 'bg-white text-primary-900 shadow-md border border-neutral-200'
                             }
                         `}
            style={{ touchAction: 'manipulation' }}
          >
            <BarsOutlined className="text-xl" />
          </button>

          <Drawer
            open={drawerVisible}
            onClose={closeDrawer}
            placement="left"
            width={280}
            style={{
              background: isFuturistic ? themeConfig.sidebar.bg : '#fff',
              height: '100vh',
            }}
            drawerStyle={{
              background: isFuturistic ? themeConfig.sidebar.bg : '#fff',
            }}
            className={isFuturistic ? 'mobile-drawer-futuristic' : ''}
            closeIcon={null}
            maskClosable={true}
          >
            <div
              className={`
                             flex items-center justify-between p-4 border-b
                             ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}
                         `}
            >
              <span
                className={`font-semibold text-lg ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
              >
                Navigation
              </span>
              <button
                onClick={closeDrawer}
                className={`p-2 rounded-lg ${isFuturistic ? 'text-aurora-muted hover:text-aurora-text hover:bg-cyber-hover' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'}`}
              >
                <CloseOutlined />
              </button>
            </div>
            <div style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
              {renderMenuItems(closeDrawer)}
            </div>
          </Drawer>
        </>
      )}
    </>
  );
};

export default Sidebar;
