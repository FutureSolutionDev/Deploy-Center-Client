/**
 * Deployment Logs Page
 * Detailed view of deployment with real-time logs
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Grid,
  Button,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Replay as RetryIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { DeploymentsService, type IDeployment } from '@/services/deploymentsService';
import { useLanguage } from '@/contexts/LanguageContext';

export const DeploymentLogsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { Language } = useLanguage();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [deployment, setDeployment] = useState<IDeployment | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDeploymentData(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const fetchDeploymentData = async (deploymentId: number) => {
    setLoading(true);
    try {
      const [deploymentData, logsData] = await Promise.all([
        DeploymentsService.getById(deploymentId),
        DeploymentsService.getLogs(deploymentId),
      ]);
      setDeployment(deploymentData);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to fetch deployment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchDeploymentData(parseInt(id));
    }
  };

  const handleCancel = async () => {
    if (!id || !window.confirm('Are you sure you want to cancel this deployment?')) return;

    try {
      await DeploymentsService.cancel(parseInt(id));
      handleRefresh();
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  const handleRetry = async () => {
    if (!id || !window.confirm('Are you sure you want to retry this deployment?')) return;

    try {
      await DeploymentsService.retry(parseInt(id));
      handleRefresh();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-${id}-logs.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'warning';
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

  if (!deployment) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Deployment not found</Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/deployments')} sx={{ mt: 2 }}>
          Back to Deployments
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/deployments')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Deployment #{deployment.id}</Typography>
          <Chip
            label={deployment.status}
            color={getStatusColor(deployment.status) as any}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<RefreshIcon />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button startIcon={<DownloadIcon />} onClick={handleDownloadLogs}>
            Download
          </Button>
          {deployment.status === 'in_progress' && (
            <Button startIcon={<CancelIcon />} color="error" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          {deployment.status === 'failed' && (
            <Button startIcon={<RetryIcon />} color="primary" onClick={handleRetry}>
              Retry
            </Button>
          )}
        </Box>
      </Box>

      {/* Deployment Info */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Project
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {deployment.projectName}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Branch
                  </Typography>
                  <Typography variant="body1">{deployment.branch}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Commit
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {deployment.commitHash}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Trigger
                  </Typography>
                  <Typography variant="body1">{deployment.triggerType}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Started
                  </Typography>
                  <Typography variant="body1">{deployment.timestamp}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">{deployment.duration || '-'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Logs */}
      <Paper sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">Deployment Logs</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Auto-scroll
            </Typography>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
          </Box>
        </Box>
        <Box
          sx={{
            height: '500px',
            overflow: 'auto',
            bgcolor: 'background.default',
            p: 2,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {logs || 'No logs available'}
          <div ref={logsEndRef} />
        </Box>
      </Paper>
    </Box>
  );
};
