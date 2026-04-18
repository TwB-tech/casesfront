import { Route, Routes } from 'react-router-dom';
import './App.css';
import React from 'react';

const { Content } = Layout;

// const Home = lazy(() => import('./pages/Home'));
// const LandingPage = lazy(() => import('./pages/LandingPage2.jsx'));
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
              background: isFuturistic
                ? 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0f0f18 100%)'
                : 'linear-gradient(106.5deg, #f8fafc 0%, #f1f5f9 100%)',
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
                <div>Hello World</div>
              </ErrorBoundary>
            </Content>
            {!shouldHideSidebar && <AppFooter />}
          </Layout>
        </Layout>
      </Layout>

      {/* Reya AI Assistant - Only show for authenticated users */}
      {isAuthenticated && <ReyaAssistant />}
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
