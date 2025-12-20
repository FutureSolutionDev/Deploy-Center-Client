import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Rocket as DeployIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { IDeployment } from '@/types';

interface IProjectDeploymentsTableProps {
  deployments: IDeployment[];
  formatDateTime: (date: string | Date) => string;
}

export const ProjectDeploymentsTable: React.FC<IProjectDeploymentsTableProps> = ({
  deployments,
  formatDateTime,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: any; icon: React.ReactElement }> = {
      success: { color: 'success', icon: <SuccessIcon fontSize="small" /> },
      failed: { color: 'error', icon: <ErrorIcon fontSize="small" /> },
      inProgress: { color: 'warning', icon: <ScheduleIcon fontSize="small" /> },
      pending: { color: 'default', icon: <ScheduleIcon fontSize="small" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        label={status}
        color={config.color}
        size="small"
        icon={config.icon || undefined}
      />
    );
  };

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t('dashboard.recentDeployments')}
        </Typography>
        <Divider sx={{ mb: 0.5 }} />

        {deployments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DeployIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {t('deployments.noDeployments')}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 340 }}>
            <Table size="small">
              <TableHead
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  backgroundColor: 'background.paper',
                }}
              >
                <TableRow>
                  <TableCell>{t('deployments.status')}</TableCell>
                  <TableCell>{t('deployments.branch')}</TableCell>
                  <TableCell>{t('common.date')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deployments.slice(0, 50).map((deployment) => (
                  <TableRow
                    key={deployment.Id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{getStatusChip(deployment.Status)}</TableCell>
                    <TableCell>{deployment.Branch}</TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDateTime(deployment.CreatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => navigate(`/deployments/${deployment.Id}`)}
                      >
                        {t('deployments.viewLogs')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
