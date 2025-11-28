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
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { IPipelineStep } from '@/types';

interface Step3Props {
    pipeline: IPipelineStep[];
    onChange: (pipeline: IPipelineStep[]) => void;
}

export const Step3Pipeline: React.FC<Step3Props> = ({ pipeline, onChange }) => {
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

    const updateStep = (index: number, field: keyof IPipelineStep, value: any) => {
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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Pipeline Steps</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" onClick={addStep}>
                    Add Step
                </Button>
            </Box>

            {pipeline.length === 0 && (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    No pipeline steps defined. Add a step to define your deployment process.
                </Typography>
            )}

            {pipeline.map((step, index) => (
                <Card key={index} variant="outlined">
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Step Name"
                                    value={step.Name}
                                    onChange={(e) => updateStep(index, 'Name', e.target.value)}
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <IconButton size="small" onClick={() => moveStep(index, 'up')} disabled={index === 0}>
                                    <ArrowUpward />
                                </IconButton>
                                <IconButton size="small" onClick={() => moveStep(index, 'down')} disabled={index === pipeline.length - 1}>
                                    <ArrowDownward />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => removeStep(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Command(s)"
                                    value={step.Run.join('\n')}
                                    onChange={(e) => updateStep(index, 'Run', e.target.value.split('\n'))}
                                    multiline
                                    rows={2}
                                    size="small"
                                    helperText="Enter one command per line"
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Run Condition (Optional)"
                                    value={step.RunIf || ''}
                                    onChange={(e) => updateStep(index, 'RunIf', e.target.value)}
                                    size="small"
                                    placeholder="e.g., {{Environment}} === 'production'"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};
