import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { IProjectStatistics } from '@/types';

interface IProjectStatsCardProps {
  stats: IProjectStatistics | null;
}

export const ProjectStatsCard: React.FC<IProjectStatsCardProps> = ({ stats }) => {
  const { t } = useTranslation();

  if (!stats) {
    return null;
  }

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t('projects.statistics')}
        </Typography>
        <Divider sx={{ mb: 0.5 }} />

        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {stats.TotalDeployments}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('common.total')}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.SuccessRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('projects.successRate')}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {Math.round(stats.AverageDuration)}s
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('projects.avgDuration')}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {stats?.DeploymentsByDay?.length > 0 && (
          <Box sx={{ width: '100%', height: 100, minHeight: 100 }}>
            <ResponsiveContainer aspect={3} width={400} height={400}>
              <BarChart data={stats.DeploymentsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" fontSize={9} />
                <YAxis fontSize={9} />
                <RechartsTooltip />
                <Bar dataKey="Success" stackId="a" fill="#4caf50" />
                <Bar dataKey="Failed" stackId="a" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
