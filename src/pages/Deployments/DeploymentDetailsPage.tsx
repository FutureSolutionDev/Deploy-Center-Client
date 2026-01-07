import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Button, Tabs, Tab } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DeploymentsService } from '@/services/deploymentsService';
import { useDeploymentUpdates, useDeploymentEvents, useSocket } from '@/hooks/useSocket';
import { useDateFormatter } from '@/hooks/useDateFormatter';
import { socketService } from '@/services/socket';
import type { IDeployment } from '@/types';
import {
    DeploymentHeader,
    DeploymentOverviewTab,
    DeploymentPipelineTab,
    DeploymentVariablesTab,
    DeploymentLogsTab,
} from './components';

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
    useDeploymentEvents(
        // onUpdate callback
        (updatedDeployment) => {
            if (updatedDeployment.Id === Number(id)) {
                setDeployment(updatedDeployment);
            }
        },
        // onComplete callback
        (completedDeployment) => {
            if (completedDeployment.Id === Number(id)) {
                setDeployment(completedDeployment);
                // Refresh logs when deployment completes
                fetchLogs();
            }
        }
    );

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

    const handleRefresh = () => {
        fetchDeployment();
        fetchLogs();
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

    // Loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Error state
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
            <DeploymentHeader
                deployment={deployment}
                onBack={handleBack}
                onRefresh={handleRefresh}
                onDownloadLogs={handleDownloadLogs}
                onRetry={handleRetry}
                t={t}
            />

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
                <DeploymentOverviewTab deployment={deployment} formatDateTime={formatDateTime} />
            )}

            {activeTab === 1 && <DeploymentPipelineTab deployment={deployment} />}

            {activeTab === 2 && <DeploymentVariablesTab deployment={deployment} />}

            {activeTab === 3 && (
                <DeploymentLogsTab deployment={deployment} logs={logs} logsEndRef={logsEndRef} t={t} />
            )}
        </Box>
    );
};
