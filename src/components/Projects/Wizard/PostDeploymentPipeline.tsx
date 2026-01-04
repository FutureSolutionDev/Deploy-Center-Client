import React from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Card,
    CardContent,
    Grid,
    Alert,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, ArrowUpward, ArrowDownward, RocketLaunch } from '@mui/icons-material';
import type { IPipelineStep } from '@/types';

interface IPostDeploymentPipelineProps {
    pipeline: IPipelineStep[];
    enableRollback: boolean;
    onChange: (pipeline: IPipelineStep[]) => void;
    onEnableRollbackChange: (enabled: boolean) => void;
}

export const PostDeploymentPipeline: React.FC<IPostDeploymentPipelineProps> = ({
    pipeline,
    enableRollback,
    onChange,
    onEnableRollbackChange,
}) => {
    const addStep = () => {
        onChange([
            ...pipeline,
            { Name: '', Run: [''], RunIf: '' },
        ]);
    };

    const removeStep = (index: number) => {
        const newPipeline = [...pipeline];
        newPipeline.splice(index, 1);
        onChange(newPipeline);
    };

    const updateStep = (index: number, field: keyof IPipelineStep, value: unknown) => {
        const newPipeline = [...pipeline];
        newPipeline[index] = { ...newPipeline[index], [field]: value };
        onChange(newPipeline);
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === pipeline.length - 1)
        ) {
            return;
        }
        const newPipeline = [...pipeline];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newPipeline[index], newPipeline[targetIndex]] = [newPipeline[targetIndex], newPipeline[index]];
        onChange(newPipeline);
    };

    const addCommand = (stepIndex: number) => {
        const newPipeline = [...pipeline];
        newPipeline[stepIndex].Run.push('');
        onChange(newPipeline);
    };

    const removeCommand = (stepIndex: number, commandIndex: number) => {
        const newPipeline = [...pipeline];
        newPipeline[stepIndex].Run.splice(commandIndex, 1);
        onChange(newPipeline);
    };

    const updateCommand = (stepIndex: number, commandIndex: number, value: string) => {
        const newPipeline = [...pipeline];
        newPipeline[stepIndex].Run[commandIndex] = value;
        onChange(newPipeline);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <RocketLaunch color="primary" />
                    <Typography variant="h6">Post-Deployment Pipeline</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    These steps run in the production path <strong>after rsync</strong>.
                    Use this for restarting services, clearing caches, or running migrations.
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Execution Path:</strong> Production directory (after deployment)<br />
                        <strong>When:</strong> After rsync completes<br />
                        <strong>Examples:</strong> pm2 restart, clear cache, database migrations
                    </Typography>
                </Alert>

                <FormControlLabel
                    control={
                        <Switch
                            checked={enableRollback}
                            onChange={(e) => onEnableRollbackChange(e.target.checked)}
                        />
                    }
                    label={
                        <Box>
                            <Typography variant="body2">Enable Automatic Rollback</Typography>
                            <Typography variant="caption" color="text.secondary">
                                If post-deployment pipeline fails, automatically restore the previous version
                            </Typography>
                        </Box>
                    }
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button startIcon={<AddIcon />} variant="outlined" onClick={addStep}>
                    Add Post-Deployment Step
                </Button>
            </Box>

            {pipeline.length === 0 && (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    No post-deployment steps defined. These steps are optional and run after rsync.
                </Typography>
            )}

            {pipeline.map((step, stepIndex) => (
                <Card key={stepIndex} variant="outlined">
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Step Name"
                                    value={step.Name}
                                    onChange={(e) => updateStep(stepIndex, 'Name', e.target.value)}
                                    size="small"
                                    placeholder="e.g., Restart PM2, Clear Cache"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <IconButton size="small" onClick={() => moveStep(stepIndex, 'up')} disabled={stepIndex === 0}>
                                    <ArrowUpward />
                                </IconButton>
                                <IconButton size="small" onClick={() => moveStep(stepIndex, 'down')} disabled={stepIndex === pipeline.length - 1}>
                                    <ArrowDownward />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => removeStep(stepIndex)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Commands:</Typography>
                                {step.Run.map((command, commandIndex) => (
                                    <Box key={commandIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <TextField
                                            fullWidth
                                            value={command}
                                            onChange={(e) => updateCommand(stepIndex, commandIndex, e.target.value)}
                                            size="small"
                                            placeholder="e.g., pm2 restart app"
                                        />
                                        {step.Run.length > 1 && (
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => removeCommand(stepIndex, commandIndex)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => addCommand(stepIndex)}
                                >
                                    Add Command
                                </Button>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Run If (Condition - Optional)"
                                    value={step.RunIf || ''}
                                    onChange={(e) => updateStep(stepIndex, 'RunIf', e.target.value)}
                                    size="small"
                                    placeholder="e.g., $ENVIRONMENT == 'production'"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};
