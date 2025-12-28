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
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { useToast } from '@/contexts/ToastContext';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Configuration } from './Step2Configuration';
import { Step3Pipeline } from './Step3Pipeline';
import { Step4Notifications } from './Step4Notifications';

interface IProjectWizardProps {
    initialData?: Partial<IProject>;
    onClose: () => void;
}

const steps = ['Basic Info', 'Configuration', 'Pipeline', 'Notifications'];

export const ProjectWizard: React.FC<IProjectWizardProps> = ({
    initialData,
    onClose,
}) => {
    const { showSuccess, showError } = useToast();
    const createProject = useCreateProject();
    const updateProject = useUpdateProject();

    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!initialData?.Id;
    const loading = createProject.isPending || updateProject.isPending;

    const [formData, setFormData] = useState<Partial<IProject>>({
        Name: '',
        Description: '',
        RepoUrl: '',
        Branch: 'master',
        ProjectPath: '',
        DeploymentPaths: [],
        ProjectType: 'node',  // Must match server enum: 'node', 'static', or 'docker'
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

            if (isEditMode) {
                // Update existing project
                await updateProject.mutateAsync({
                    id: initialData.Id!,
                    data: dataToSubmit,
                });
                showSuccess('Project updated successfully');
            } else {
                // Create new project
                await createProject.mutateAsync(dataToSubmit);
                showSuccess('Project created successfully');
            }

            onClose();
        } catch (err: unknown) {
            const errorMessage = (err as any).message || 'Failed to save project';
            setError(errorMessage);
            showError(errorMessage);
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
                        notifications={formData.Config?.Notifications || {
                            OnSuccess: true,
                            OnFailure: true,
                            OnStart: false,
                        }}
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
