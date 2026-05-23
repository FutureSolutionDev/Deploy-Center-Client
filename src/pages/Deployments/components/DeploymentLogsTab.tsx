import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import type { IDeployment } from '@/types';
import DownloadLogButton from './DownloadLogButton';      // v3.0 F-004
import CopyLogButton from './CopyLogButton';              // v3.0 F-004
import AutoScrollToggle from './AutoScrollToggle';        // v3.0 F-004

interface IDeploymentLogsTabProps {
    deployment: IDeployment;
    logs: string;
    logsEndRef: React.RefObject<HTMLDivElement | null>;
    /** v3.0 F-004 — parent owns the toggle so its scrollIntoView effect can honor it. */
    autoScroll: boolean;
    onAutoScrollChange: (next: boolean) => void;
    t: (key: string) => string;
}

export const DeploymentLogsTab: React.FC<IDeploymentLogsTabProps> = ({
    deployment,
    logs,
    logsEndRef,
    autoScroll,
    onAutoScrollChange,
    t,
}) => {
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

    return (
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
                                deployment-{deployment.Id}.log
                            </Typography>
                        </Box>

                        {/* Right-side controls: LIVE indicator + F-004 controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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

                            {/* v3.0 F-004 (T038/T039) — auto-scroll, copy, download */}
                            {deployment.Status === 'inProgress' && (
                                <AutoScrollToggle enabled={autoScroll} onChange={onAutoScrollChange} />
                            )}
                            <CopyLogButton text={logs} />
                            <DownloadLogButton deploymentId={deployment.Id} />
                        </Box>
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
    );
};
