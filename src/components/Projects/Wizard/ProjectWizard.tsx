import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Paper,
    Container,
    Alert,
} from '@mui/material';

import type { IProject, IProjectConfig } from '@/types';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Configuration } from './Step2Configuration';
import { Step3Pipeline } from './Step3Pipeline';
import { Step4Notifications } from './Step4Notifications';

interface IProjectWizardProps {
    initialData?: Partial<IProject>;
    onClose: () => void;
    onSubmit: (data: Partial<IProject>) => Promise<void>;
}

const steps = ['Basic Info', 'Configuration', 'Pipeline', 'Notifications'];

export const ProjectWizard: React.FC<IProjectWizardProps> = ({
    initialData,
    onClose,
    onSubmit,
}) => {

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<IProject>>({
        Name: '',
        Description: '',
        RepoUrl: '',
        Branch: 'master',
        ProjectPath: '',
        ProjectType: 'nodejs',
        Config: {
            Branch: 'master',
            AutoDeploy: true,
            Environment: 'production',
            DeployOnPaths: [],
            Pipeline: [],
            Notifications: {
                OnSuccess: true,
                OnFailure: true,
                OnStart: false,
            },
            Variables: {},
        } as IProjectConfig,
        ...initialData,
    });

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            // Ensure Branch is synced between root and Config
            const dataToSubmit = {
                ...formData,
                Config: {
                    ...formData.Config!,
                    Branch: formData.Branch || 'master',
                },
            };
            await onSubmit(dataToSubmit);
            onClose();
        } catch (err: unknown) {
            setError((err as any).message || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (data: Partial<IProject>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const updateConfig = (config: Partial<IProjectConfig>) => {
        setFormData((prev) => ({
            ...prev,
            Config: { ...prev.Config!, ...config },
        }));
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Step1BasicInfo
                        data={formData}
                        onChange={updateFormData}
                    />
                );
            case 1:
                return (
                    <Step2Configuration
                        config={formData.Config!}
                        onChange={updateConfig}
                    />
                );
            case 2:
                return (
                    <Step3Pipeline
                        pipeline={formData.Config!.Pipeline || []}
                        onChange={(pipeline) => updateConfig({ Pipeline: pipeline })}
                    />
                );
            case 3:
                return (
                    <Step4Notifications
                        notifications={formData.Config!.Notifications!}
                        onChange={(notifications) => updateConfig({ Notifications: notifications })}
                    />
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {initialData ? 'Edit Project' : 'Create New Project'}
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ minHeight: 400 }}>
                    {getStepContent(activeStep)}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                    <Button
                        disabled={activeStep === 0 || loading}
                        onClick={handleBack}
                    >
                        Back
                    </Button>

                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Finish'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};
