import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import React, { lazy, Suspense, useState, useEffect } from 'react';
// import Loading from './components/Loader';
import useAuth from './hooks/useAuth';
import 'antd/dist/reset.css';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/SideBar';
import AppFooter from './components/Layout/Footer';
import { Layout, Skeleton } from 'antd';
import ProtectedRoute, { AccountingRoute, HRRoute } from './utils/ProtectedRoute';
import ReactGA from 'react-ga4';
import ReyaAssistant from './components/Reya/ReyaAssistant';
import { useTheme } from './contexts/ThemeContext.jsx';
import Breadcrumbs from './components/ui/Breadcrumbs';
import ErrorBoundary from './components/ErrorBoundary';

const { Content } = Layout;

const Home = lazy(() => import('./pages/Home'));
const LandingPage = lazy(() => import('./pages/LandingPage2.jsx'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const RegisterSuccess = lazy(() => import('./components/Auth/RegisterSuccess'));
const CaseForm = lazy(() => import('./components/CaseManagement/CaseForm'));
const CaseList = lazy(() => import('./components/CaseManagement/CaseList'));
const Chats = lazy(() => import('./pages/Chats'));
const ChatUsers = lazy(() => import('./pages/ChatUsers'));
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
const FirmsMarketplace = lazy(() => import('./pages/FirmsMarketplace'));
const AccountingDashboard = lazy(() => import('./pages/AccountingDashboard'));
const ExpenseManagement = lazy(() => import('./pages/ExpenseManagement'));
const HRManagement = lazy(() => import('./pages/HRManagement'));
const FinancialReports = lazy(() => import('./pages/FinancialReports'));
const PayrollManagement = lazy(() => import('./pages/PayrollManagement'));

const Settings = lazy(() => import('./pages/Settings'));
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
    ReactGA.send({ hitType: 'pageview', page: location.pathname });
  }, [location]);
};

function AppContent() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isFuturistic } = useTheme();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const { isAuthenticated } = useAuth();

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
    '/register-success',
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

  usePageTracking();

  return (
    <>
      <Layout
        className={`app-layout ${isFuturistic ? 'futuristic' : 'classic'}`}
        style={{ minHeight: '100vh' }}
      >
        <Navbar />
        <Layout>
          {!shouldHideSidebar && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}
          <Layout
            style={{
              marginLeft: !shouldHideSidebar ? (collapsed ? (isMobile ? 0 : 80) : 260) : 0,
              marginTop: isMobile ? '64px' : 0,
              padding: isMobile ? '16px' : '24px',
              flexGrow: 1,
              transition: 'margin-left 0.2s, background 0.3s ease',
              background: '#000000',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            {!shouldHideSidebar && (
              <div className={`mb-6 ${isFuturistic ? '' : ''}`}>
                <Breadcrumbs />
              </div>
            )}
            <Content>
              <ErrorBoundary>
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
                          <Home />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/case-form"
                      element={
                        <ProtectedRoute>
                          <CaseForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/case-list"
                      element={
                        <ProtectedRoute>
                          <CaseList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/case-details/:id"
                      element={
                        <ProtectedRoute>
                          <CaseDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients"
                      element={
                        <ProtectedRoute>
                          <ClientList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients-details/:id"
                      element={
                        <ProtectedRoute>
                          <ClientDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/documents"
                      element={
                        <ProtectedRoute>
                          <DocumentList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/documents-details/:id"
                      element={
                        <ProtectedRoute>
                          <DocumentDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/new-document"
                      element={
                        <ProtectedRoute>
                          <NewDocument />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/calendar-tasks"
                      element={
                        <ProtectedRoute>
                          <CalendarTasks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute>
                          <CaseReports />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/performanceReports"
                      element={
                        <ProtectedRoute>
                          <PerformanceReports />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoices"
                      element={
                        <ProtectedRoute>
                          <InvoiceList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoice-details/:id"
                      element={
                        <ProtectedRoute>
                          <InvoiceDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/new-invoice"
                      element={
                        <ProtectedRoute>
                          <NewInvoice />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chats"
                      element={
                        <ProtectedRoute>
                          <Chats />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chat-users"
                      element={
                        <ProtectedRoute>
                          <ChatUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chat/:roomName"
                      element={
                        <ProtectedRoute>
                          <Chats />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="tasks/"
                      element={
                        <ProtectedRoute>
                          <Tasks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="tasks/create/"
                      element={
                        <ProtectedRoute>
                          <TaskCreate />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mailing"
                      element={
                        <ProtectedRoute>
                          <MailList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/new-mail"
                      element={
                        <ProtectedRoute>
                          <NewMail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mail-details/:id"
                      element={
                        <ProtectedRoute>
                          <MailDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin-dashboard"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/register-success" element={<RegisterSuccess />} />
                    <Route path="/verify-email" element={<EmailVerification />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactUsPage />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/onboarding" element={<OnboardingRequest />} />
                    <Route path="/firms" element={<FirmsMarketplace />} />
                    <Route
                      path="/accounting"
                      element={
                        <AccountingRoute>
                          <AccountingDashboard />
                        </AccountingRoute>
                      }
                    />
                    <Route
                      path="/expenses"
                      element={
                        <AccountingRoute>
                          <ExpenseManagement />
                        </AccountingRoute>
                      }
                    />
                    <Route
                      path="/hr"
                      element={
                        <HRRoute>
                          <HRManagement />
                        </HRRoute>
                      }
                    />
                    <Route
                      path="/reports/financial"
                      element={
                        <AccountingRoute>
                          <FinancialReports />
                        </AccountingRoute>
                      }
                    />
                    <Route
                      path="/payroll"
                      element={
                        <HRRoute>
                          <PayrollManagement />
                        </HRRoute>
                      }
                    />
                    <Route path="*" element={<PageNotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
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
