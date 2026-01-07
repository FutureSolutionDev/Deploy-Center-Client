import React from 'react';
import { Box, Card, CardContent, Typography, Divider, Chip, Alert, Grid } from '@mui/material';
import type { IDeployment } from '@/types';

interface IDeploymentOverviewTabProps {
    deployment: IDeployment;
    formatDateTime: (date: string | Date) => string;
}

export const DeploymentOverviewTab: React.FC<IDeploymentOverviewTabProps> = ({
    deployment,
    formatDateTime,
}) => {
    // Get deployment paths (backward compatibility)
    const deploymentPaths = deployment.Project?.DeploymentPaths && deployment.Project.DeploymentPaths.length > 0
        ? deployment.Project.DeploymentPaths
        : deployment.Project?.ProjectPath
        ? [deployment.Project.ProjectPath]
        : [];

    return (
        <Grid container spacing={3}>
            {/* Left Column - Deployment Details */}
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

            {/* Right Column - Project Configuration & Deployment Paths */}
            <Grid size={{ xs: 12, md: 6 }}>
                {/* Deployment Paths */}
                {deploymentPaths.length > 0 && (
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Deployment Paths
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {deploymentPaths.map((path, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {deploymentPaths.length > 1 && (
                                            <Chip
                                                label={index === 0 ? 'Primary' : `#${index + 1}`}
                                                size="small"
                                                color={index === 0 ? 'primary' : 'default'}
                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                            />
                                        )}
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {path}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Project Configuration */}
                {deployment.Project?.Config && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Project Configuration
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Environment</Typography>
                                    <Typography variant="body1">
                                        {deployment.Project.Config.Environment || 'production'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Auto Deploy</Typography>
                                    <Chip
                                        label={deployment.Project.Config.AutoDeploy ? 'Enabled' : 'Disabled'}
                                        size="small"
                                        color={deployment.Project.Config.AutoDeploy ? 'success' : 'default'}
                                    />
                                </Box>
                                {deployment.Project.Config.BuildOutput && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Build Output</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {deployment.Project.Config.BuildOutput}
                                        </Typography>
                                    </Box>
                                )}
                                {deployment.Project.Config.DeployOnPaths && deployment.Project.Config.DeployOnPaths.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                            Deploy On Paths
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {deployment.Project.Config.DeployOnPaths.map((path, index) => (
                                                <Chip
                                                    key={index}
                                                    label={path}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                {deployment.Project.Config.SyncIgnorePatterns && deployment.Project.Config.SyncIgnorePatterns.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                            Sync Ignore Patterns
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {deployment.Project.Config.SyncIgnorePatterns.map((pattern, index) => (
                                                <Chip
                                                    key={index}
                                                    label={pattern}
                                                    size="small"
                                                    variant="outlined"
                                                    color="warning"
                                                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Grid>
        </Grid>
    );
};
