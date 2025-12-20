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
    return (
        <Grid container spacing={3}>
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
    );
};
