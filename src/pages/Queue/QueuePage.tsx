import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    alpha,
} from '@mui/material';
import {
    Cancel as CancelIcon,
    Refresh as RefreshIcon,
    ClearAll as CancelAllIcon,
    Schedule as PendingIcon,
    PlayArrow as RunningIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DeploymentsService } from '@/services/deploymentsService';
import type { IDeployment } from '@/types';

export const QueuePage: React.FC = () => {
    const { t } = useTranslation();

    const [queue, setQueue] = useState<IDeployment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelAllDialogOpen, setCancelAllDialogOpen] = useState(false);
    const [selectedDeployment, setSelectedDeployment] = useState<IDeployment | null>(null);
    const [canceling, setCanceling] = useState(false);

    const fetchQueue = async () => {
        try {
            setError(null);
            const queueData = await DeploymentsService.getAll();
            // Filter only pending and in-progress deployments
            const queuedItems = queueData.filter(
                (d) => d.Status === 'pending' || d.Status === 'queued' || d.Status === 'inProgress');
            setQueue(queuedItems);
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'message' in err
                    ? String(err.message)
                    : 'Failed to load queue';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();

        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchQueue, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleCancelOne = (deployment: IDeployment) => {
        setSelectedDeployment(deployment);
        setCancelDialogOpen(true);
    };

    const confirmCancelOne = async () => {
        if (!selectedDeployment) return;

        try {
            setCanceling(true);
            await DeploymentsService.cancelDeployment(selectedDeployment.Id);
            setSuccess(`${t('deployments.cancel')} succeeded`);
            setCancelDialogOpen(false);
            setSelectedDeployment(null);
            fetchQueue();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'message' in err
                    ? String(err.message)
                    : 'Failed to cancel deployment';
            setError(errorMessage);
            setTimeout(() => setError(null), 3000);
        } finally {
            setCanceling(false);
        }
    };

    const handleCancelAll = () => {
        setCancelAllDialogOpen(true);
    };

    const confirmCancelAll = async () => {
        try {
            setCanceling(true);
            // Cancel all pending deployments
            await Promise.all(
                queue
                    .filter((d) => d.Status === 'pending' || d.Status === 'queued')
                    .map((d) => DeploymentsService.cancelDeployment(d.Id))
            );
            setSuccess(`${t('deployments.cancelAll')} succeeded`);
            setCancelAllDialogOpen(false);
            fetchQueue();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'message' in err
                    ? String(err.message)
                    : 'Failed to cancel all deployments';
            setError(errorMessage);
            setTimeout(() => setError(null), 3000);
        } finally {
            setCanceling(false);
        }
    };

    const getStatusChip = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactElement; label: string }> = {
            pending: {
                color: 'default',
                icon: <PendingIcon fontSize="small" />,
                label: t('deployments.statuses.pending'),
            },
            queued: {
                color: 'default',
                icon: <PendingIcon fontSize="small" />,
                label: t('deployments.statuses.queued'),
            },
            inProgress: {
                color: 'warning',
                icon: <RunningIcon fontSize="small" />,
                label: t('deployments.statuses.in_progress'),
            },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <Chip
                label={config.label}
                color={config.color as 'default' | 'warning'}
                size="small"
                icon={config.icon}
            />
        );
    };

    // Helper for rendering loading state
    const renderLoadingState = () => (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );

    // Helper for rendering empty state
    const renderEmptyState = () => (
        <Paper sx={{ textAlign: 'center', py: 8 }}>
            <PendingIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
                {t('deployments.noDeployments')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                All deployments are completed or there are no pending items
            </Typography>
        </Paper>
    );

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                        {t('deployments.title')} - Queue
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitor and manage deployment queue
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchQueue}
                        disabled={loading}
                    >
                        {t('deployments.refresh')}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelAllIcon />}
                        onClick={handleCancelAll}
                        disabled={queue.length === 0 || canceling}
                    >
                        {t('deployments.cancelAll')}
                    </Button>
                </Box>
            </Box>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {/* Queue Table */}
            {loading && queue.length === 0 ? renderLoadingState() : null}
            {!loading && queue.length === 0 ? renderEmptyState() : null}

            {queue.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{t('deployments.project')}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{t('deployments.branch')}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{t('deployments.createdAt')}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{t('common.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {queue.map((deployment, index) => (
                                <TableRow key={deployment.Id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {deployment.ProjectName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{deployment.Branch}</Typography>
                                    </TableCell>
                                    <TableCell>{getStatusChip(deployment.Status)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(deployment.CreatedAt).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={t('deployments.cancel')}>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleCancelOne(deployment)}
                                                disabled={deployment.Status === 'inProgress' || canceling}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Queue Stats */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {t('deployments.showing')} {queue.length} items in queue
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Auto-refreshes every 5 seconds
                        </Typography>
                    </Box>
                </TableContainer>
            ) : null}

            {/* Cancel One Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>{t('deployments.cancel')} Deployment</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel deployment for{' '}
                        <strong>{selectedDeployment?.ProjectName}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)} disabled={canceling}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={confirmCancelOne} color="error" variant="contained" disabled={canceling}>
                        {canceling ? <CircularProgress size={20} /> : t('deployments.cancel')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancel All Dialog */}
            <Dialog open={cancelAllDialogOpen} onClose={() => setCancelAllDialogOpen(false)}>
                <DialogTitle>{t('deployments.cancelAll')} Pending Deployments</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel all {queue.filter((d) => d.Status === 'pending' || d.Status === 'queued').length} pending deployments?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelAllDialogOpen(false)} disabled={canceling}>
                        {t('common.no')}
                    </Button>
                    <Button onClick={confirmCancelAll} color="error" variant="contained" disabled={canceling}>
                        {canceling ? <CircularProgress size={20} /> : t('common.yes')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
