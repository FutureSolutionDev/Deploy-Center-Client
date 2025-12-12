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
    IconButton,
    Tooltip,
    alpha,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Schedule as ScheduleIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    PlayArrow as RunningIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Replay as RetryIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DeploymentsService } from '@/services/deploymentsService';
import { useDeploymentUpdates, useDeploymentEvents } from '@/hooks/useSocket';
import { useDateFormatter } from '@/hooks/useDateFormatter';
import type { IDeployment } from '@/types';

export const DeploymentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { formatDateTime } = useDateFormatter();
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

    const handleDownloadLogs = () => {
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deployment-${id}-logs.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRetry = async () => {
        try {
            await DeploymentsService.retry(Number(id));
            fetchDeployment();
            fetchLogs();
        } catch (err) {
            console.error('Failed to retry deployment:', err);
        }
    };

    const getLogColor = (log: string) => {
        if (log.includes('[ERROR]') || log.includes('ERROR') || log.includes('Failed')) return '#ff6b6b';
        if (log.includes('[SUCCESS]') || log.includes('SUCCESS') || log.includes('✅')) return '#51cf66';
        if (log.includes('[WARNING]') || log.includes('WARNING') || log.includes('⚠️')) return '#ffd43b';
        if (log.includes('[INFO]') || log.includes('INFO')) return '#74c0fc';
        return '#d4d4d4';
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
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
                        {t('common.back')}
                    </Button>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Deployment #{deployment.Id}
                    </Typography>
                    {getStatusChip(deployment.Status)}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={t('common.refresh') || 'Refresh'}>
                        <IconButton onClick={() => { fetchDeployment(); fetchLogs(); }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadLogs}
                        size="small"
                    >
                        {t('logs.downloadLogs') || 'Download Logs'}
                    </Button>
                    {deployment.Status === 'failed' && (
                        <Button
                            variant="contained"
                            startIcon={<RetryIcon />}
                            onClick={handleRetry}
                            size="small"
                        >
                            {t('deployments.retryDeployment') || 'Retry'}
                        </Button>
                    )}
                </Box>
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
                                    <Typography variant="body1">{formatDateTime(deployment.CreatedAt)}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Logs Terminal */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper
                        sx={{
                            bgcolor: '#1e1e1e',
                            color: '#d4d4d4',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            minHeight: '400px',
                            maxHeight: '600px',
                            overflow: 'auto',
                            borderRadius: 2,
                            boxShadow: 3,
                            position: 'relative',
                        }}
                    >
                        {/* Terminal Header */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 2,
                                pb: 1.5,
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                            </Box>
                            <Typography variant="caption" sx={{ ml: 2, color: 'rgba(255,255,255,0.6)' }}>
                                deployment-{id}.log
                            </Typography>
                        </Box>

                        {/* Logs Content */}
                        <Box sx={{ p: 2 }}>
                            {!logs || logs.trim().length === 0 ? (
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                                    {t('deployments.noLogsAvailable') || 'Waiting for logs...'}
                                </Typography>
                            ) : (
                                logs.split('\n').map((log, index) => (
                                    log.trim().length > 0 && (
                                        <Box
                                            key={index}
                                            sx={{
                                                mb: 0.5,
                                                color: getLogColor(log),
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {log}
                                        </Box>
                                    )
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </Box>

                        {/* Live indicator for in-progress deployments */}
                        {deployment.Status === 'inProgress' && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: '#27c93f',
                                        animation: 'pulse 2s infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': { opacity: 1 },
                                            '50%': { opacity: 0.3 },
                                        },
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: '#27c93f' }}>
                                    {t('deployments.liveIndicator') || 'LIVE'}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
