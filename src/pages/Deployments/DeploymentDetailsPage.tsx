import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Card,
    CardContent,
    Alert,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Schedule as ScheduleIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    PlayArrow as RunningIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DeploymentsService } from '@/services/deploymentsService';
import { useDeploymentUpdates, useDeploymentEvents } from '@/hooks/useSocket';
import type { IDeployment } from '@/types';

export const DeploymentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const logsEndRef = useRef<HTMLDivElement>(null);

    const [deployment, setDeployment] = useState<IDeployment | null>(null);
    const [logs, setLogs] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Connect to socket for this deployment
    useDeploymentUpdates(deployment?.ProjectId);

    // Listen for updates
    useDeploymentEvents((updatedDeployment) => {
        if (updatedDeployment.Id === Number(id)) {
            setDeployment(updatedDeployment);
            // Refresh logs if status changed to completed/failed
            if (updatedDeployment.Status === 'success' || updatedDeployment.Status === 'failed') {
                fetchLogs();
            }
        }
    });

    const fetchDeployment = async () => {
        try {
            if (!id) return;
            const data = await DeploymentsService.getById(Number(id));
            setDeployment(data);
        } catch (err) {
            setError('Failed to load deployment details');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            if (!id) return;
            const logData = await DeploymentsService.getLogs(Number(id));
            setLogs(logData);
        } catch (err) {
            console.error('Failed to load logs');
        }
    };

    useEffect(() => {
        fetchDeployment();
        fetchLogs();
    }, [id]);

    useEffect(() => {
        // Auto-scroll logs
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleBack = () => {
        navigate('/deployments');
    };

    const getStatusChip = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactElement; label: string }> = {
            success: { color: 'success', icon: <SuccessIcon />, label: t('deployments.statuses.success') },
            failed: { color: 'error', icon: <ErrorIcon />, label: t('deployments.statuses.failed') },
            inProgress: { color: 'warning', icon: <RunningIcon />, label: t('deployments.statuses.inProgress') },
            queued: { color: 'default', icon: <ScheduleIcon />, label: t('deployments.statuses.queued') },
            pending: { color: 'default', icon: <ScheduleIcon />, label: t('deployments.statuses.pending') },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Chip label={config.label} color={config.color as any} icon={config.icon} />;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !deployment) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error || 'Deployment not found'}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
                    {t('common.back')}
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
                    {t('common.back')}
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Deployment #{deployment.Id}
                </Typography>
                {getStatusChip(deployment.Status)}
            </Box>

            <Grid container spacing={3}>
                {/* Info Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Project</Typography>
                                    <Typography variant="body1">{deployment.ProjectName}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Branch</Typography>
                                    <Typography variant="body1">{deployment.Branch}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Commit</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {deployment.Commit?.substring(0, 7) || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Triggered By</Typography>
                                    <Typography variant="body1">{deployment.Author || 'System'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                                    <Typography variant="body1">{deployment.Duration ? `${deployment.Duration}s` : '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Date</Typography>
                                    <Typography variant="body1">{new Date(deployment.CreatedAt).toLocaleString()}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Logs Terminal */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper
                        sx={{
                            p: 2,
                            bgcolor: '#1e1e1e',
                            color: '#fff',
                            fontFamily: 'monospace',
                            minHeight: '400px',
                            maxHeight: '600px',
                            overflow: 'auto',
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 1, borderBottom: '1px solid #333', pb: 1 }}>
                            &gt;_ Console Output
                        </Typography>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {logs || 'Waiting for logs...'}
                        </pre>
                        <div ref={logsEndRef} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
