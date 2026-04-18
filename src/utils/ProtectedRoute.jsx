import { Navigate } from "react-router-dom";
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !localStorage.getItem("userInfo")) {
    return <Navigate to={"/login"} replace />;
  }

  // If roles are specified, check user has required role
  if (roles.length > 0 && user) {
    const userRole = (user.role || '').toLowerCase();
    const hasPermission = roles.some(role =>
      role.toLowerCase() === userRole ||
      // Admin has all permissions
      userRole === 'admin' ||
      userRole === 'administrator'
    );

    if (!hasPermission) {
      console.warn(`Access denied: User role ${userRole} cannot access this route`);
      return <Navigate to={"/home"} replace />;
    }
  }

  return children;
}

// Role-based route wrapper components
export const AdminRoute = ({ children }) => (
  <ProtectedRoute roles={['admin', 'administrator']}>{children}</ProtectedRoute>
);

export const AccountingRoute = ({ children }) => (
  <ProtectedRoute roles={['admin', 'partner', 'accountant', 'manager', 'advocate', 'firm']}>{children}</ProtectedRoute>
);

export const HRRoute = ({ children }) => (
  <ProtectedRoute roles={['admin', 'partner', 'hr', 'manager', 'advocate', 'firm']}>{children}</ProtectedRoute>
);

export const AdvocateRoute = ({ children }) => (
  <ProtectedRoute roles={['admin', 'partner', 'advocate', 'lawyer', 'firm']}>{children}</ProtectedRoute>
);
