import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  FolderCopy as ProjectsIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Rocket as DeploymentsIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDateFormatter } from '@/hooks/useDateFormatter';
import type { IDeployment } from '@/types';

interface IStatCard {
  Title: string;
  TitleAr: string;
  Value: string | number;
  Icon: React.ReactNode;
  Color: string;
}

export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { User } = useAuth();
  const { formatDateTime } = useDateFormatter();

  // Use the optimized dashboard stats hook
  const { data, isLoading, error } = useDashboardStats();

  const GetStatusColor = (status: string): 'success' | 'error' | 'default' => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data: {error.message}
        </Alert>
      </Box>
    );
  }

  // No data state (shouldn't happen, but good to handle)
  if (!data) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">{t('dashboard.noData')}</Alert>
      </Box>
    );
  }

  // Build stats cards from API data
  const stats: IStatCard[] = [
    {
      Title: 'totalProjects',
      TitleAr: 'totalProjects',
      Value: data.Stats.TotalProjects,
      Icon: <ProjectsIcon fontSize="large" />,
      Color: '#1976d2',
    },
    {
      Title: 'totalDeployments',
      TitleAr: 'totalDeployments',
      Value: data.Stats.TotalDeployments,
      Icon: <DeploymentsIcon fontSize="large" />,
      Color: '#9c27b0',
    },
    {
      Title: 'successfulDeployments',
      TitleAr: 'successfulDeployments',
      Value: data.Stats.SuccessfulDeployments,
      Icon: <SuccessIcon fontSize="large" />,
      Color: '#4caf50',
    },
    {
      Title: 'failedDeployments',
      TitleAr: 'failedDeployments',
      Value: data.Stats.FailedDeployments,
      Icon: <ErrorIcon fontSize="large" />,
      Color: '#f44336',
    },
  ];

  const recentDeployments: IDeployment[] = data.RecentDeployments;

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.welcome')}, {User?.Username || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.subtitle')}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t(`dashboard.${stat.Title}`)}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.Value}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.Color }}>{stat.Icon}</Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Recent Deployments */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.recentDeployments')}
        </Typography>

        <Box sx={{ mt: 2 }}>
          {recentDeployments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.noRecentDeployments')}
            </Typography>
          ) : (
            recentDeployments.map((deployment) => (
              <Box
                key={deployment.Id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  mb: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {deployment.ProjectName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {deployment.Branch} • {formatDateTime(deployment.CreatedAt)}
                  </Typography>
                </Box>
                <Chip
                  label={deployment.Status}
                  color={GetStatusColor(deployment.Status)}
                  size="small"
                />
              </Box>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
};
