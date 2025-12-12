import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  FolderCopy as ProjectsIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Rocket as DeploymentsIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectsService } from '@/services/projectsService';
import { DeploymentsService } from '@/services/deploymentsService';
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<IStatCard[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<IDeployment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projects, deployments] = await Promise.all([
          ProjectsService.getAll(),
          DeploymentsService.getAll(),
        ]);

        const totalProjects = projects.length;
        const totalDeployments = deployments.length;
        const successDeployments = deployments.filter(d => d.Status === 'success').length;
        const failedDeployments = deployments.filter(d => d.Status === 'failed').length;

        setStats([
          {
            Title: 'totalProjects',
            TitleAr: 'totalProjects',
            Value: totalProjects,
            Icon: <ProjectsIcon fontSize="large" />,
            Color: '#1976d2',
          },
          {
            Title: 'totalDeployments',
            TitleAr: 'totalDeployments',
            Value: totalDeployments,
            Icon: <DeploymentsIcon fontSize="large" />,
            Color: '#9c27b0',
          },
          {
            Title: 'successfulDeployments',
            TitleAr: 'successfulDeployments',
            Value: successDeployments,
            Icon: <SuccessIcon fontSize="large" />,
            Color: '#4caf50',
          },
          {
            Title: 'failedDeployments',
            TitleAr: 'failedDeployments',
            Value: failedDeployments,
            Icon: <ErrorIcon fontSize="large" />,
            Color: '#f44336',
          },
        ]);

        setRecentDeployments(deployments.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
          {recentDeployments.map((deployment) => (
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
          ))}
        </Box>
      </Paper>
    </Box>
  );
};
