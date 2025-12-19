/**
 * Role Guard Component
 * Conditionally renders children based on user role
 */

import React from 'react';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { Alert, Box } from '@mui/material';

interface IRoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export const RoleGuard: React.FC<IRoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
  showMessage = false,
}) => {
  const { hasRole } = useRole();

  if (!hasRole(allowedRoles)) {
    if (showMessage) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            You do not have permission to access this resource.
          </Alert>
        </Box>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ICanProps {
  do: 'manage' | 'deploy' | 'view_reports' | 'view_sessions';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<ICanProps> = ({ do: action, children, fallback = null }) => {
  const role = useRole();

  let hasPermission = false;

  switch (action) {
    case 'manage':
      hasPermission = role.canManageProjects;
      break;
    case 'deploy':
      hasPermission = role.canDeploy;
      break;
    case 'view_reports':
      hasPermission = role.canViewReports;
      break;
    case 'view_sessions':
      hasPermission = role.isAdmin;
      break;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
