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
import { useLanguage } from '@/contexts/LanguageContext';
import { IProject, IProjectConfig } from '@/types';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Configuration } from './Step2Configuration';
import { Step3Pipeline } from './Step3Pipeline';
import { Step4Notifications } from './Step4Notifications';

interface ProjectWizardProps {
    initialData?: Partial<IProject>;
    onClose: () => void;
    onSubmit: (data: Partial<IProject>) => Promise<void>;
}

const steps = ['Basic Info', 'Configuration', 'Pipeline', 'Notifications'];

export const ProjectWizard: React.FC<ProjectWizardProps> = ({
    initialData,
    onClose,
    onSubmit,
}) => {
    const { t } = useLanguage();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<IProject>>({
        Name: '',
        Description: '',
        RepoUrl: '',
        ProjectType: 'nodejs',
        Config: {
            Branch: 'main',
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
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save project');
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
