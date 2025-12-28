/**
 * Main App Component
 * Root component with routing and context providers
 */
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeContextProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserSettingsProvider } from '@/contexts/UserSettingsContext';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { setToastHandlers, setupResponseInterceptor } from '@/utils/apiInterceptors';
import ApiInstance from '@/services/api';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1, // Retry failed requests once
    },
  },
});
import { MainLayout } from '@/components/Layout/MainLayout';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { ProjectsPage } from '@/pages/Projects/ProjectsPage';
import { ProjectDetailsPage } from '@/pages/Projects/ProjectDetailsPage';
import { DeploymentsPage } from '@/pages/Deployments/DeploymentsPage';
import { DeploymentDetailsPage } from '@/pages/Deployments/DeploymentDetailsPage';
import { ReportsPage } from '@/pages/Reports/ReportsPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { QueuePage } from '@/pages/Queue/QueuePage';
import { UsersManagementPage } from '@/pages/Users/UsersManagementPage';
import { Loader } from './components/Common';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
interface IProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children }) => {
  const { IsAuthenticated, IsLoading } = useAuth();

  if (IsLoading) {
    return <Loader />
  }

  if (!IsAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
interface IPublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<IPublicRouteProps> = ({ children }) => {
  const { IsAuthenticated, IsLoading } = useAuth();

  if (IsLoading) {
    return <Loader />
  }

  if (IsAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * App Routes Component with Toast Integration
 * Defines all application routes
 */
const AppRoutesWithToast: React.FC = () => {
  const toast = useToast();
  const { User, CurrentSessionId, Logout } = useAuth();

  useEffect(() => {
    // Setup toast handlers for API interceptor
    setToastHandlers({
      showSuccess: toast.showSuccess,
      showError: toast.showError,
      showWarning: toast.showWarning,
    });

    // Setup API response interceptor (only once on mount)
    setupResponseInterceptor(ApiInstance);
  }, [toast.showSuccess, toast.showError, toast.showWarning]);

  // Listen for session revoked event
  useEffect(() => {
    if (!User || !CurrentSessionId) return;

    // Import socket service
    import('@/services/socket').then(({ socketService }) => {
      const socket = socketService.connect();

      // Join user room for session management
      socket.emit('join:user', User.Id);

      // Listen for session revoked event
      const handleSessionRevoked = (payload: { SessionId: number }) => {
        // Only logout if the revoked session is THIS session
        if (payload.SessionId === CurrentSessionId) {
          toast.showWarning('Your session has been revoked. Logging out...');
          setTimeout(() => {
            Logout();
          }, 1500);
        }
      };

      socket.on('session:revoked', handleSessionRevoked);

      return () => {
        socket.off('session:revoked', handleSessionRevoked);
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [User, CurrentSessionId, Logout, toast.showWarning]);

  return <AppRoutes />;
};

/**
 * App Routes Component
 * Defines all application routes
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="deployments" element={<DeploymentsPage />} />
        <Route path="deployments/:id" element={<DeploymentDetailsPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};


/**
 * Main App Component
 * Wraps everything with providers
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <RoleProvider>
                <UserSettingsProvider>
                  <ThemeContextProvider>
                    <ToastProvider>
                      <CssBaseline />
                      <AppRoutesWithToast />
                      <ReactQueryDevtools initialIsOpen={false} />
                    </ToastProvider>
                  </ThemeContextProvider>
                </UserSettingsProvider>
              </RoleProvider>
            </AuthProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
