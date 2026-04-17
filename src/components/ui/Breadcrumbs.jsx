import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const routeNames = {
  '': 'Dashboard',
  home: 'Dashboard',
  'case-list': 'Cases',
  'case-details': 'Case Details',
  'case-form': 'New Case',
  clients: 'Clients',
  'client-details': 'Client Details',
  'new-client': 'New Client',
  documents: 'Documents',
  'document-details': 'Document Details',
  'new-document': 'New Document',
  invoices: 'Invoices',
  'invoice-details': 'Invoice Details',
  'new-invoice': 'New Invoice',
  'calendar-tasks': 'Calendar',
  'calendar-tasks-details': 'Event Details',
  'new-appointment': 'New Appointment',
  reports: 'Reports',
  'report-details': 'Report Details',
  'new-report': 'New Report',
  settings: 'Settings',
  'user-settings': 'User Settings',
  'system-settings': 'System Settings',
  tasks: 'Tasks',
  'task-details': 'Task Details',
  'new-task': 'New Task',
  mailing: 'Mail',
  'mail-details': 'Mail Details',
  'new-mail': 'Compose',
  chat: 'Chat',
  chats: 'Chats',
  'new-chat': 'New Chat',
  login: 'Login',
  signup: 'Sign Up',
  'forgot-password': 'Forgot Password',
};

const Breadcrumbs = ({ customRoutes }) => {
  const location = useLocation();
  const { isFuturistic } = useTheme();

  const pathSnippets = location.pathname.split('/').filter((i) => i);

  const routes =
    customRoutes ||
    pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const name = routeNames[snippet] || routeNames[url] || snippet.replace(/-/g, ' ');
      return {
        path: url,
        breadcrumbName: name.charAt(0).toUpperCase() + name.slice(1),
      };
    });

  return (
    <div className={`breadcrumbs-container ${isFuturistic ? 'dark' : ''}`}>
      <Breadcrumb
        separator={
          <RightOutlined
            className={`text-xs ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}`}
          />
        }
        items={[
          {
            title: (
              <Link to="/home" className="flex items-center gap-1">
                <HomeOutlined className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'} />
                <span
                  className={
                    isFuturistic
                      ? 'text-aurora-muted hover:text-aurora-text'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }
                >
                  Home
                </span>
              </Link>
            ),
          },
          ...routes.map((route, index) => ({
            title:
              index === routes.length - 1 ? (
                <span
                  key={route.path}
                  className={`font-medium ${
                    isFuturistic ? 'text-aurora-text' : 'text-neutral-800'
                  }`}
                >
                  {route.breadcrumbName}
                </span>
              ) : (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`transition-colors ${
                    isFuturistic
                      ? 'text-aurora-muted hover:text-aurora-primary'
                      : 'text-neutral-500 hover:text-accent-600'
                  }`}
                >
                  {route.breadcrumbName}
                </Link>
              ),
          })),
        ]}
      />
    </div>
  );
};

export default Breadcrumbs;
