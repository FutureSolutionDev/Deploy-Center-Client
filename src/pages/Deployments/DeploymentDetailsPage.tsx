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
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
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
    RemoveCircle as SkippedIcon,
    HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DeploymentsService } from '@/services/deploymentsService';
import { useDeploymentUpdates, useDeploymentEvents, useSocket } from '@/hooks/useSocket';
import { useDateFormatter } from '@/hooks/useDateFormatter';
import { socketService } from '@/services/socket';
import type { IDeployment } from '@/types';

export const DeploymentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { formatDateTime } = useDateFormatter();
    const logsEndRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocket();

    const [deployment, setDeployment] = useState<IDeployment | null>(null);
    const [logs, setLogs] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    // Connect to socket for this deployment
    useDeploymentUpdates(deployment?.ProjectId);

    // Listen for deployment updates
    useDeploymentEvents((updatedDeployment) => {
        if (updatedDeployment.Id === Number(id)) {
            setDeployment(updatedDeployment);
            // Refresh logs if status changed to completed/failed
            if (updatedDeployment.Status === 'success' || updatedDeployment.Status === 'failed') {
                fetchLogs();
            }
        }
    });

    // Listen for real-time logs
    useEffect(() => {
        if (!socket || !id) return;

        // Join deployment room
        socketService.joinDeployment(Number(id));

        const handleLogUpdate = (data: { DeploymentId: number; Log: string; Timestamp: string }) => {
            if (data.DeploymentId === Number(id)) {
                setLogs((prevLogs) => prevLogs + '\n' + data.Log);
            }
        };

        socket.on('deployment:log', handleLogUpdate);

        return () => {
            socket.off('deployment:log', handleLogUpdate);
        };
    }, [socket, id]);

    const fetchDeployment = async () => {
        try {
            if (!id) return;
            const data = await DeploymentsService.getById(Number(id));
            setDeployment(data);
        } catch (_err) {
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
        } catch (_err) {
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
        // Error patterns - Red
        if (log.includes('[ERROR]') || log.includes('ERROR') || log.includes('Failed') || log.includes('failed') ||
            log.includes('Error:') || log.includes('Exception') || log.includes('✗')) {
            return '#ff6b6b';
        }
        // Success patterns - Green
        if (log.includes('[SUCCESS]') || log.includes('SUCCESS') || log.includes('✅') || log.includes('✓') ||
            log.includes('completed successfully') || log.includes('Done')) {
            return '#51cf66';
        }
        // Warning patterns - Yellow
        if (log.includes('[WARNING]') || log.includes('WARNING') || log.includes('⚠️') || log.includes('WARN') ||
            log.includes('deprecated')) {
            return '#ffd43b';
        }
        // Info patterns - Blue
        if (log.includes('[INFO]') || log.includes('INFO') || log.includes('ℹ️')) {
            return '#74c0fc';
        }
        // Debug patterns - Purple
        if (log.includes('[DEBUG]') || log.includes('DEBUG')) {
            return '#b197fc';
        }
        // Step/Pipeline patterns - Cyan
        if (log.includes('🚀') || log.includes('Step') || log.includes('Running:') || log.includes('Executing')) {
            return '#66d9ef';
        }
        // Timestamp patterns - Gray
        if (log.match(/^\[?\d{4}-\d{2}-\d{2}/)) {
            return '#8b949e';
        }
        // Default - Light gray
        return '#c9d1d9';
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

    const getStepIcon = (status: string) => {
        const iconProps = { fontSize: 'small' as const };
        switch (status) {
            case 'success':
                return <SuccessIcon {...iconProps} sx={{ color: '#51cf66' }} />;
            case 'failed':
                return <ErrorIcon {...iconProps} sx={{ color: '#ff6b6b' }} />;
            case 'running':
                return <RunningIcon {...iconProps} sx={{ color: '#ffd43b' }} />;
            case 'skipped':
                return <SkippedIcon {...iconProps} sx={{ color: '#868e96' }} />;
            case 'pending':
            default:
                return <PendingIcon {...iconProps} sx={{ color: '#adb5bd' }} />;
        }
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

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Overview" />
                    <Tab label="Pipeline Steps" />
                    <Tab label="Variables" />
                    <Tab label="Logs" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {/* Info Card */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Deployment Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Project</Typography>
                                        <Typography variant="body1">{deployment.Project?.Name}</Typography>
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
                                    {deployment.CommitMessage && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Commit Message</Typography>
                                            <Typography variant="body2">{deployment.CommitMessage}</Typography>
                                        </Box>
                                    )}
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Triggered By</Typography>
                                        <Typography variant="body1">{deployment.Author || 'System'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Trigger Type</Typography>
                                        <Chip label={deployment.TriggerType} size="small" variant="outlined" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                                        <Typography variant="body1">{deployment.Duration ? `${deployment.Duration}s` : '-'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Started At</Typography>
                                        <Typography variant="body1">
                                            {deployment.StartedAt ? formatDateTime(deployment.StartedAt) : '-'}
                                        </Typography>
                                    </Box>
                                    {deployment.CompletedAt && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Completed At</Typography>
                                            <Typography variant="body1">{formatDateTime(deployment.CompletedAt)}</Typography>
                                        </Box>
                                    )}
                                    {deployment.ErrorMessage && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Error Message</Typography>
                                            <Alert severity="error" sx={{ mt: 1 }}>
                                                {deployment.ErrorMessage}
                                            </Alert>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Pipeline Steps Tab */}
            {activeTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Pipeline Execution
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        {deployment.Project?.Config?.Pipeline && deployment.Project.Config.Pipeline.length > 0 ? (
                            <Stepper orientation="vertical" activeStep={-1}>
                                {deployment.Project.Config.Pipeline.map((step, index) => (
                                    <Step key={index} expanded active completed={false}>
                                        <StepLabel
                                            icon={getStepIcon('pending')}
                                            sx={{
                                                '& .MuiStepLabel-label': {
                                                    fontSize: '1rem',
                                                    fontWeight: 500,
                                                },
                                            }}
                                        >
                                            {step.Name}
                                        </StepLabel>
                                        <StepContent>
                                            {step.RunIf && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                    <strong>Condition:</strong> {step.RunIf}
                                                </Typography>
                                            )}
                                            <Paper sx={{ p: 2, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                {step.Run.map((cmd, cmdIndex) => (
                                                    <Box key={cmdIndex} sx={{ mb: cmdIndex < step.Run.length - 1 ? 0.5 : 0 }}>
                                                        {cmd}
                                                    </Box>
                                                ))}
                                            </Paper>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                        ) : (
                            <Alert severity="info">No pipeline steps configured for this project</Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Variables Tab */}
            {activeTab === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Deployment Variables
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        {deployment.Project?.Config?.Variables && Object.keys(deployment.Project.Config.Variables).length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Variable</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(deployment.Project.Config.Variables).map(([key, value]) => (
                                            <TableRow key={key}>
                                                <TableCell sx={{ fontFamily: 'monospace', color: '#1976d2' }}>{key}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert severity="info">No variables configured for this deployment</Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Logs Tab */}
            {activeTab === 3 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Paper
                            sx={{
                                bgcolor: '#0d1117',
                                color: '#c9d1d9',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                height: '600px',
                                borderRadius: 2,
                                boxShadow: 3,
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Terminal Header - Sticky */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    pb: 1.5,
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    bgcolor: '#161b22',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                        deployment-{id}.log
                                    </Typography>
                                </Box>

                                {/* Live indicator for in-progress deployments */}
                                {deployment.Status === 'inProgress' && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            bgcolor: 'rgba(0,0,0,0.3)',
                                            px: 2,
                                            py: 0.5,
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
                                        <Typography variant="caption" sx={{ color: '#27c93f', fontWeight: 600 }}>
                                            {t('deployments.liveIndicator') || 'LIVE'}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Logs Content - Scrollable */}
                            <Box
                                sx={{
                                    p: 2,
                                    flex: 1,
                                    overflow: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        bgcolor: '#0d1117',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        bgcolor: '#30363d',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            bgcolor: '#484f58',
                                        },
                                    },
                                }}
                            >
                                {!logs || logs.trim().length === 0 ? (
                                    <Typography sx={{ color: 'rgba(201,209,217,0.6)', fontStyle: 'italic' }}>
                                        {t('deployments.noLogsAvailable') || 'Waiting for logs...'}
                                    </Typography>
                                ) : (
                                    logs.split('\n').map((log, index) => (
                                        log.trim().length > 0 && (
                                            <Box
                                                key={index}
                                                sx={{
                                                    mb: 0.25,
                                                    color: getLogColor(log),
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    lineHeight: 1.6,
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255,255,255,0.03)',
                                                    },
                                                }}
                                            >
                                                {log}
                                            </Box>
                                        )
                                    ))
                                )}
                                <div ref={logsEndRef} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};
