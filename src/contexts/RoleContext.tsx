/**
 * Role Context
 * Provides role-based utilities for access control
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

export const UserRole = {
  Admin: 'admin',
  Developer: 'developer',
  Viewer: 'viewer',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

interface IRoleContext {
  role: UserRole | null;
  isAdmin: boolean;
  isDeveloper: boolean;
  isViewer: boolean;
  canManageProjects: boolean;
  canDeploy: boolean;
  canViewReports: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const RoleContext = createContext<IRoleContext | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { User } = useAuth();

  const roleUtils = useMemo(() => {
    const role = User?.Role as UserRole | null;
    const isAdmin = role === UserRole.Admin;
    const isDeveloper = role === UserRole.Developer;
    const isViewer = role === UserRole.Viewer;

    return {
      role,
      isAdmin,
      isDeveloper,
      isViewer,
      canManageProjects: isAdmin || isDeveloper,
      canDeploy: isAdmin || isDeveloper,
      canViewReports: isAdmin,
      hasRole: (roles: UserRole[]) => (role ? roles.includes(role) : false),
    };
  }, [User?.Role]);

  return <RoleContext.Provider value={roleUtils}>{children}</RoleContext.Provider>;
};

export const useRole = (): IRoleContext => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};
