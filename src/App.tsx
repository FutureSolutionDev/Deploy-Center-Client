/**
 * Main App Component
 * Root component with routing and context providers
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeContextProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MainLayout } from '@/components/Layout/MainLayout';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { ProjectsPage } from '@/pages/Projects/ProjectsPage';
import { ProjectDetailsPage } from '@/pages/Projects/ProjectDetailsPage';
import { DeploymentsPage } from '@/pages/Deployments/DeploymentsPage';
import { DeploymentLogsPage } from '@/pages/Deployments/DeploymentLogsPage';
import { ReportsPage } from '@/pages/Reports/ReportsPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { QueuePage } from '@/pages/Queue/QueuePage';
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

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
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
        <Route path="deployments/:id" element={<DeploymentLogsPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="reports" element={<ReportsPage />} />
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
        <LanguageProvider>
          <AuthProvider>
            <ThemeContextProvider>
              <CssBaseline />
              <AppRoutes />
            </ThemeContextProvider>
          </AuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
