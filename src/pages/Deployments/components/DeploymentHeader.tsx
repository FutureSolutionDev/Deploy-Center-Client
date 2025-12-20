import React from 'react';
import { Box, Typography, Button, Chip, Tooltip, IconButton } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Replay as RetryIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    PlayArrow as RunningIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { IDeployment } from '@/types';

interface IDeploymentHeaderProps {
    deployment: IDeployment;
    onBack: () => void;
    onRefresh: () => void;
    onDownloadLogs: () => void;
    onRetry: () => void;
    t: (key: string) => string;
}

export const DeploymentHeader: React.FC<IDeploymentHeaderProps> = ({
    deployment,
    onBack,
    onRefresh,
    onDownloadLogs,
    onRetry,
    t,
}) => {
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

    return (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
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
                    <IconButton onClick={onRefresh}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={onDownloadLogs}
                    size="small"
                >
                    {t('logs.downloadLogs') || 'Download Logs'}
                </Button>
                {deployment.Status === 'failed' && (
                    <Button
                        variant="contained"
                        startIcon={<RetryIcon />}
                        onClick={onRetry}
                        size="small"
                    >
                        {t('deployments.retryDeployment') || 'Retry'}
                    </Button>
                )}
            </Box>
        </Box>
    );
};
