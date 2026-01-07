import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Divider,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Paper,
    Box,
    Alert,
} from '@mui/material';
import {
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    PlayArrow as RunningIcon,
    RemoveCircle as SkippedIcon,
    HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import type { IDeployment } from '@/types';

interface IDeploymentPipelineTabProps {
    deployment: IDeployment;
}

export const DeploymentPipelineTab: React.FC<IDeploymentPipelineTabProps> = ({ deployment }) => {
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

    const hasPipeline = deployment.Project?.Config?.Pipeline && deployment.Project.Config.Pipeline.length > 0;
    const hasPostPipeline = deployment.Project?.Config?.PostDeploymentPipeline && deployment.Project.Config.PostDeploymentPipeline.length > 0;

    return (
        <Box>
            {/* Pre-Deployment Pipeline */}
            {hasPipeline && (
                <Card sx={{ mb: hasPostPipeline ? 3 : 0 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Pre-Deployment Pipeline
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="caption">
                                Runs in temporary directory before rsync
                            </Typography>
                        </Alert>
                        <Divider sx={{ mb: 3 }} />

                        <Stepper orientation="vertical" activeStep={-1}>
                            {deployment.Project!.Config.Pipeline.map((step, index) => (
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
                                        <Paper sx={{ p: 2, fontFamily: 'monospace', fontSize: '0.875rem', bgcolor: 'grey.900', color: 'common.white' }}>
                                            {step.Run.map((cmd, cmdIndex) => (
                                                <Box key={cmdIndex} sx={{ mb: cmdIndex < step.Run.length - 1 ? 0.5 : 0 }}>
                                                    <Typography component="span" sx={{ color: 'success.light', mr: 1 }}>$</Typography>
                                                    {cmd}
                                                </Box>
                                            ))}
                                        </Paper>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    </CardContent>
                </Card>
            )}

            {/* Post-Deployment Pipeline */}
            {hasPostPipeline && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Post-Deployment Pipeline
                        </Typography>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="caption">
                                Runs in production directory after rsync
                                {deployment.Project!.Config.EnableRollbackOnPostDeployFailure !== false && ' • Rollback enabled'}
                            </Typography>
                        </Alert>
                        <Divider sx={{ mb: 3 }} />

                        <Stepper orientation="vertical" activeStep={-1}>
                            {deployment.Project!.Config.PostDeploymentPipeline!.map((step, index) => (
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
                                        <Paper sx={{ p: 2, fontFamily: 'monospace', fontSize: '0.875rem', bgcolor: 'grey.900', color: 'common.white' }}>
                                            {step.Run.map((cmd, cmdIndex) => (
                                                <Box key={cmdIndex} sx={{ mb: cmdIndex < step.Run.length - 1 ? 0.5 : 0 }}>
                                                    <Typography component="span" sx={{ color: 'success.light', mr: 1 }}>$</Typography>
                                                    {cmd}
                                                </Box>
                                            ))}
                                        </Paper>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    </CardContent>
                </Card>
            )}

            {/* No Pipeline */}
            {!hasPipeline && !hasPostPipeline && (
                <Card>
                    <CardContent>
                        <Alert severity="info">No pipeline steps configured for this project</Alert>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};
