/**
 * WakiliWorld CRM - Main Application Component
 * Copyright (c) 2024-2025 Anthony Kerige (Tony Kamau), Tech with Brands (TwB)
 * Version 2.0 - All Rights Reserved
 */

import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import useAuth from './hooks/useAuth';
import 'antd/dist/reset.css';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/SideBar';
import AppFooter from './components/Layout/Footer';
import { Layout, Skeleton } from 'antd';
import ProtectedRoute, { AdminRoute, AccountingRoute, HRRoute } from './utils/ProtectedRoute';
import ReactGA from 'react-ga4';
import ReyaAssistant from './components/Reya/ReyaAssistant';

const isGAAvailable =
  typeof ReactGA !== 'undefined' && ReactGA.send && typeof ReactGA.send === 'function';
import { useTheme } from './contexts/ThemeContext.jsx';
import Breadcrumbs from './components/ui/Breadcrumbs';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollManager from './components/ui/ScrollManager';

const { Content } = Layout;

 const Home = lazy(() => import('./pages/Home'));
 const LandingPage = lazy(() => import('./pages/LandingPage2.jsx'));
 const EmailVerification = lazy(() => import('./pages/EmailVerification'));
 const AcceptInvite = lazy(() => import('./pages/AcceptInvite'));
const CaseForm = lazy(() => import('./components/CaseManagement/CaseForm'));
const CaseList = lazy(() => import('./components/CaseManagement/CaseList'));
const Chat = lazy(() => import('./pages/Chat'));
const Messages = lazy(() => import('./pages/Messages'));
const CaseDetails = lazy(() => import('./components/CaseManagement/CaseDetails'));
const ClientList = lazy(() => import('./components/ClientManagement/ClientList'));
const ClientDetails = lazy(() => import('./components/ClientManagement/ClientDetails'));
const DocumentList = lazy(() => import('./components/Documents/DocumentList'));
const DocumentDetails = lazy(() => import('./components/Documents/DocumentDetails'));
const NewDocument = lazy(() => import('./components/Documents/NewDocument'));
const CaseReports = lazy(() => import('./components/Reports/CaseReports'));
const PerformanceReports = lazy(() => import('./components/Reports/PerformanceReports'));
const InvoiceList = lazy(() => import('./components/Billings/InvoiceList'));
const InvoiceDetails = lazy(() => import('./components/Billings/InvoiceDetails'));
const NewInvoice = lazy(() => import('./components/Billings/NewInvoice'));
const Tasks = lazy(() => import('./components/TaskManagement/tasks'));
const TaskCreate = lazy(() => import('./components/TaskManagement/taskForm'));
// const TaskPreview = lazy(() => import('./components/TaskManagement/taskPreview'));
const CalendarTasks = lazy(() => import('./components/Calender/CalendarTasks'));
const Profile = lazy(() => import('./pages/Profile'));

const AboutPage = lazy(() => import('./pages/About'));
const ContactUsPage = lazy(() => import('./pages/ContactUs'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Features = lazy(() => import('./pages/Features'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const OnboardingRequest = lazy(() => import('./components/OnboardingRequest'));
const AddClient = lazy(() => import('./components/AddClient'));
const ClientRegister = lazy(() => import('./pages/ClientRegister'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const LawFirmDirectory = lazy(() => import('./pages/FirmsMarketplace'));
const AccountingDashboard = lazy(() => import('./pages/AccountingDashboard'));
const ExpenseManagement = lazy(() => import('./pages/ExpenseManagement'));
const HRManagement = lazy(() => import('./pages/HRManagement'));
const FinancialReports = lazy(() => import('./pages/FinancialReports'));
const PayrollManagement = lazy(() => import('./pages/PayrollManagement'));

const Settings = lazy(() => import('./pages/Settings'));
const Notes = lazy(() => import('./pages/Notes'));
const AdminDashboard = lazy(() => import('./Admin/AdminDashboard'));

const Login = lazy(() => import('./components/authentication/SignIn'));
const SignUp = lazy(() => import('./components/authentication/SignUpMultiStep'));
const ForgotPassword = lazy(() => import('./components/authentication/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/authentication/ResetPassword'));
const PasswordResetSuccess = lazy(() => import('./components/authentication/PasswordResetSuccess'));
const PageNotFound = lazy(() => import('./utils/ErrorBoundary'));
const MailList = lazy(() => import('./components/Mailing/MailList'));
const NewMail = lazy(() => import('./components/Mailing/NewMail'));
const MailDetails = lazy(() => import('./components/Mailing/MailDetails'));

// Tracking page views with Google Analytics
const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (isGAAvailable && ReactGA.send) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname });
    }
  }, [location]);
};

function AppContent() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isFuturistic } = useTheme();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hideSidebarRoutes = [
    '/login',
    '/signup',
    '/',
    '/hero',
    '/about',
    '/contact',
    '/forgot-password',
    '/reset-password',
    '/password-reset-success',
    '/verify-email',
    '/pricing',
    '/features',
    '/privacy',
    '/terms',
    '/firms',
    '*',
  ];

  const shouldHideSidebar =
    hideSidebarRoutes.includes(location.pathname) || location.pathname === '*';
  const isPublicRoute = shouldHideSidebar;

  const getLayoutBackground = () => {
    if (isPublicRoute) {
      return '#000000';
    }
    return isFuturistic ? '#0a0a0f' : '#f0f2f5';
  };

  const getContentBackground = () => {
    if (isPublicRoute) {
      return '#000000';
    }
    return isFuturistic ? '#0a0a0f' : '#ffffff';
  };

  usePageTracking();

  return (
    <>
      <ScrollManager />
      <Layout
        className={`app-layout ${isFuturistic ? 'futuristic' : 'classic'}`}
        style={{
          minHeight: '100vh',
          background: getLayoutBackground(),
        }}
      >
        <Navbar />
        <Layout style={{ background: getLayoutBackground() }}>
          {!shouldHideSidebar && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}
          <Layout
            style={{
              marginLeft: !shouldHideSidebar ? (collapsed ? (isMobile ? 0 : 80) : 260) : 0,
              marginTop: '64px',
              padding: isPublicRoute ? 0 : isMobile ? '16px' : '24px',
              flexGrow: 1,
              transition: 'margin-left 0.2s, background 0.3s ease',
              minHeight: 'calc(100vh - 64px)',
              background: getLayoutBackground(),
              overflowX: 'hidden',
            }}
          >
            {!shouldHideSidebar && (
              <div className={`mb-6 ${isFuturistic ? '' : ''}`}>
                <Breadcrumbs />
              </div>
            )}
             <Content style={{ background: getContentBackground() }}>
                 <Suspense
                   fallback={
                     <div>
                       <Skeleton active avatar paragraph={{ rows: 4 }} />
                     </div>
                   }
                 >
                   <Routes>
                     <Route path="/" element={<LandingPage />} />
                     <Route
                       path="/home"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><Home /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/client-home"
                       element={
                         <ProtectedRoute roles={['client']}>
                           <ErrorBoundary><ClientDashboard /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/profile"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><Profile /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/case-form"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><CaseForm /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/case-list"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><CaseList /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/case-details/:id"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><CaseDetails /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                      <Route
                        path="/clients"
                        element={
                          <ProtectedRoute roles={['admin', 'administrator', 'advocate', 'firm']}>
                            <ErrorBoundary><ClientList /></ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clients-details/:id"
                        element={
                          <ProtectedRoute roles={['admin', 'administrator', 'advocate', 'firm']}>
                            <ErrorBoundary><ClientDetails /></ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/client-form"
                        element={
                          <ProtectedRoute roles={['admin', 'administrator', 'advocate', 'firm']}>
                            <ErrorBoundary><AddClient /></ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/new-client"
                        element={
                          <ProtectedRoute roles={['admin', 'administrator', 'advocate', 'firm']}>
                            <ErrorBoundary><AddClient /></ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                     <Route
                       path="/documents"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><DocumentList /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/documents-details/:id"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><DocumentDetails /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/new-document"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><NewDocument /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/calendar-tasks"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><CalendarTasks /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/reports"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><CaseReports /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/performanceReports"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><PerformanceReports /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/invoices"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><InvoiceList /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/invoice-details/:id"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><InvoiceDetails /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/new-invoice"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><NewInvoice /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                      <Route
                        path="/chat"
                        element={
                          <ProtectedRoute>
                            <ErrorBoundary><Chat /></ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/messages"
                        element={
                          <ProtectedRoute>
                            <ErrorBoundary><Messages /></ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tasks/"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><Tasks /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/tasks/create/"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><TaskCreate /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/mailing"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><MailList /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/new-mail"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><NewMail /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/mail-details/:id"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><MailDetails /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/settings"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><Settings /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/notes"
                       element={
                         <ProtectedRoute>
                           <ErrorBoundary><Notes /></ErrorBoundary>
                         </ProtectedRoute>
                       }
                     />
                     <Route
                       path="/admin-dashboard"
                       element={
                         <AdminRoute>
                           <ErrorBoundary><AdminDashboard /></ErrorBoundary>
                         </AdminRoute>
                       }
                     />
                      <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
                      <Route path="/signup" element={<ErrorBoundary><SignUp /></ErrorBoundary>} />
                      <Route path="/verify-email" element={<ErrorBoundary><EmailVerification /></ErrorBoundary>} />
                     <Route path="/auth/accept-invite" element={<ErrorBoundary><AcceptInvite /></ErrorBoundary>} />
                     <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
                     <Route path="/reset-password/:token" element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />
                     <Route path="/password-reset-success" element={<ErrorBoundary><PasswordResetSuccess /></ErrorBoundary>} />
                     <Route path="/about" element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />
                     <Route path="/contact" element={<ErrorBoundary><ContactUsPage /></ErrorBoundary>} />
                     <Route path="/pricing" element={<ErrorBoundary><Pricing /></ErrorBoundary>} />
                     <Route path="/features" element={<ErrorBoundary><Features /></ErrorBoundary>} />
                     <Route path="/privacy" element={<ErrorBoundary><Privacy /></ErrorBoundary>} />
                     <Route path="/terms" element={<ErrorBoundary><Terms /></ErrorBoundary>} />
                     <Route path="/onboarding" element={<ErrorBoundary><OnboardingRequest /></ErrorBoundary>} />
                     <Route path="/client-register" element={<ErrorBoundary><ClientRegister /></ErrorBoundary>} />
                      <Route path="/firms" element={<ErrorBoundary><LawFirmDirectory /></ErrorBoundary>} />
                     <Route
                       path="/accounting"
                       element={
                         <AccountingRoute>
                           <ErrorBoundary><AccountingDashboard /></ErrorBoundary>
                         </AccountingRoute>
                       }
                     />
                     <Route
                       path="/expenses"
                       element={
                         <AccountingRoute>
                           <ErrorBoundary><ExpenseManagement /></ErrorBoundary>
                         </AccountingRoute>
                       }
                     />
                     <Route
                       path="/hr"
                       element={
                         <HRRoute>
                           <ErrorBoundary><HRManagement /></ErrorBoundary>
                         </HRRoute>
                       }
                     />
                     <Route
                       path="/reports/financial"
                       element={
                         <AccountingRoute>
                           <ErrorBoundary><FinancialReports /></ErrorBoundary>
                         </AccountingRoute>
                       }
                     />
                     <Route
                       path="/payroll"
                       element={
                         <HRRoute>
                           <ErrorBoundary><PayrollManagement /></ErrorBoundary>
                         </HRRoute>
                       }
                     />
                     <Route path="*" element={<ErrorBoundary><PageNotFound /></ErrorBoundary>} />
                   </Routes>
                 </Suspense>
             </Content>
            {!shouldHideSidebar && <AppFooter />}
          </Layout>
        </Layout>
      </Layout>

      {/* Reya AI Assistant - Show for all users (limited for guests) */}
      <ReyaAssistant />
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
