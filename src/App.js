import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import React, { lazy, Suspense, useState, useEffect } from "react";
// import Loading from './components/Loader';
import useAuth from './hooks/useAuth';
import 'antd/dist/reset.css';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/SideBar';
import AppFooter from './components/Layout/Footer';
import { Layout, Skeleton } from 'antd';
import ProtectedRoute from './utils/ProtectedRoute';
import ReactGA from 'react-ga4';
import ReyaAssistant from './components/Reya/ReyaAssistant';

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
const TaskCreate = lazy(() => import("./components/TaskManagement/taskForm"));
const TaskPreview = lazy(() => import("./components/TaskManagement/taskPreview"));
const CalendarTasks = lazy(() => import('./components/Calender/CalendarTasks'));
const Profile = lazy(() => import('./pages/Profile'));

const AboutPage = lazy(() => import('./pages/About'));
const ContactUsPage = lazy(() => import('./pages/ContactUs'));
const Pricing = lazy(() => import('./pages/Pricing'));
const OnboardingRequest = lazy(() => import('./components/OnboardingRequest'));


const Settings = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./Admin/AdminDashboard'));



const Login = lazy(() => import('./components/authentication/SignIn'));
const SignUp = lazy(() => import('./components/authentication/SignUpMultiStep'));
const ForgotPassword = lazy(() => import('./components/authentication/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/authentication/ResetPassword'));
const PasswordResetSuccess = lazy(() => import('./components/authentication/PasswordResetSuccess'));
const ErrorBoundary = lazy(() => import('./utils/ErrorBoundary'));
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

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [theme, setTheme] = useState('light');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Adjust the breakpoint as needed
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Define routes where the sidebar should be hidden
  const hideSidebarRoutes = ['/login', '/signup', '/', '/register-success', '/hero', '/about', '/contact', '/forgot-password' , '/reset-password', '/password-reset-success', '/verify-email', '*'];

  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname) || location.pathname === '*';

  usePageTracking();

  return (
    <>
     <Layout className={`app-layout ${theme}`} style={{ minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Layout>
          {!shouldHideSidebar && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} theme={theme} />}
           <Layout
             style={{
               marginLeft: !shouldHideSidebar && (collapsed ? (isMobile ? 0 : 80) : 200),
               marginTop: 0,
               padding: '24px',
               flexGrow: 1,
               transition: 'margin-left 0.2s',
               background: theme === 'light' 
                 ? 'linear-gradient(106.5deg, #f8fafc 0%, #f1f5f9 100%)' 
                 : 'linear-gradient(106.5deg, #0f172a 0%, #1e293b 100%)',
             }}
           >
            <Content>
              <Suspense fallback={<div><Skeleton active avatar paragraph={{ rows: 4 }} /></div>}>
                <Routes>

                  <Route path='/' element={<LandingPage />} />
                  <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  {/* <Route path='/home' element={<Home />} /> */}
                  <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  {/* <Route path='/profile' element={<Profile />} /> */}
                 
                  <Route path='/case-form' element={<ProtectedRoute><CaseForm /></ProtectedRoute>} />
                  {/* <Route path='/case-form' element={<CaseForm />} /> */}

                  <Route path='/case-list' element={<ProtectedRoute><CaseList/></ProtectedRoute>} />
                  {/* <Route path='/case-list' element={<CaseList/>} /> */}

                  <Route path='/case-details/:id' element={<ProtectedRoute><CaseDetails/></ProtectedRoute>} />
                  {/* <Route path='/case-details/:id' element={<CaseDetails/>} /> */}

                  <Route path='/clients' element={<ProtectedRoute><ClientList/></ProtectedRoute>} />
                  {/* <Route path='/clients' element={<ClientList/>} /> */}

                  <Route path='/clients-details/:id' element={<ProtectedRoute><ClientDetails/></ProtectedRoute>} />
                  {/* <Route path='/clients-details/:id' element={<ClientDetails/>} /> */}

                  <Route path='/documents' element={<ProtectedRoute><DocumentList/></ProtectedRoute>} />
                  {/* <Route path='/documents' element={<DocumentList/>} /> */}

                  <Route path='/documents-details/:id' element={<ProtectedRoute><DocumentDetails/></ProtectedRoute>} />
                  {/* <Route path='/documents-details/:id' element={<DocumentDetails/>} /> */}

                  <Route path='/new-document' element={<ProtectedRoute><NewDocument/></ProtectedRoute>}/>
                  {/* <Route path='/new-document' element={<NewDocument/>}/> */}

                  <Route path='/calendar-tasks' element={<ProtectedRoute><CalendarTasks/></ProtectedRoute>}/>
                  {/* <Route path='/calendar-tasks' element={<CalendarTasks/>}/> */}

                  <Route path='/reports' element={<ProtectedRoute><CaseReports/></ProtectedRoute>} /> 
                  {/* <Route path='/reports' element={<CaseReports/>} />  */}

                  <Route path='/performanceReports' element={<ProtectedRoute><PerformanceReports/></ProtectedRoute>} />
                  {/* <Route path='/performanceReports' element={<PerformanceReports/>} /> */}

                  <Route path='/invoices' element={<ProtectedRoute><InvoiceList/></ProtectedRoute>}/>
                  {/* <Route path='/invoices' element={<InvoiceList/>}/> */}

                  <Route path='/invoice-details/:id' element={<ProtectedRoute><InvoiceDetails/></ProtectedRoute>}/>
                  {/* <Route path='/invoice-details/:id' element={<InvoiceDetails/>}/> */}

                  <Route path='/new-invoice' element={<ProtectedRoute><NewInvoice/></ProtectedRoute>}/>
                  {/* <Route path='/new-invoice' element={<NewInvoice/>}/> */}

                  <Route path='/chats' element={<ProtectedRoute><Chats/></ProtectedRoute>}/>
                  {/* <Route path='/chats' element={<Chats/>}/> */}

                  <Route path='/chat-users' element={<ProtectedRoute><ChatUsers/></ProtectedRoute>}/>
                  {/* <Route path='/chat-users' element={<ChatUsers/>}/> */}

                  <Route 
                    path="/chat/:roomName" 
                    element={<ProtectedRoute><Chats /></ProtectedRoute>} 
                  />
                  {/* <Route 
                    path="/chat/:roomName" 
                    element={<Chats />} 
                  /> */}

                  {/* <Route path='/task-list/' element={<TaskList/>}/> */}
                  <Route path='tasks/' element={<ProtectedRoute><Tasks/></ProtectedRoute>}/>
                  {/* <Route path='tasks/' element={<Tasks/>}/> */}

                  <Route path='tasks/create/' element={<ProtectedRoute><TaskCreate/></ProtectedRoute>}/>
                  {/* <Route path='tasks/create/' element={<TaskCreate/>}/> */}

                  <Route path='/mailing' element={<ProtectedRoute><MailList/></ProtectedRoute>}/>
                  {/* <Route path='/mailing' element={<MailList/>}/> */}

                  <Route path='/new-mail' element={<ProtectedRoute><NewMail/></ProtectedRoute>}/>
                  {/* <Route path='/new-mail' element={<NewMail/>}/> */}

                  <Route path='/mail-details/:id' element={<ProtectedRoute><MailDetails/></ProtectedRoute>}/>
                  {/* <Route path='/mail-details/:id' element={<MailDetails/>}/> */}

                  {/* SETTINGS */}
                  <Route path='/settings' element={<ProtectedRoute><Settings/></ProtectedRoute>} />
                  {/* <Route path='/settings' element={<Settings/>} /> */}

                  <Route path='/admin-dashboard' element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>} />

                  {/* AUTHENTICATION */}
                  <Route path='/login' element={<Login />} />
                  <Route path='/signup' element={<SignUp />} />
                  <Route path='/register-success' element={<RegisterSuccess />} />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactUsPage />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/onboarding" element={<OnboardingRequest />} />

                  
                  <Route path='*' element={<ErrorBoundary />} />
                </Routes>
              </Suspense>
            </Content>
            <AppFooter theme={theme}/>
          </Layout>
        </Layout>
      </Layout>
      
      {/* Reya AI Assistant - Only show for authenticated users */}
      {isAuthenticated && <ReyaAssistant />}
    </>
  );
}

export default App;
