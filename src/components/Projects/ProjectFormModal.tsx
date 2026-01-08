import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { IProject, IProjectConfig } from '@/types';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { useToast } from '@/contexts/ToastContext';
import { Step1BasicInfo } from './Wizard/Step1BasicInfo';
import { Step2Configuration } from './Wizard/Step2Configuration';
import { Step3Pipeline } from './Wizard/Step3Pipeline';
import { PostDeploymentPipeline } from './Wizard/PostDeploymentPipeline';
import { Step4Notifications } from './Wizard/Step4Notifications';

interface IProjectFormModalProps {
  Open: boolean;
  Project?: IProject; // Optional - if provided, it's edit mode
  OnClose: (updated: boolean) => void;
}

const steps = ['Basic Info', 'Configuration', 'Pipeline', 'Post-Deployment', 'Notifications'];

export const ProjectFormModal: React.FC<IProjectFormModalProps> = ({
  Open,
  Project,
  OnClose,
}) => {
  const { showSuccess, showError } = useToast();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const isEditMode = !!Project;
  const loading = createProject.isPending || updateProject.isPending;

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<IProject>>(
    Project || {
      Name: '',
      Description: '',
      RepoUrl: '',
      Branch: 'master',
      ProjectPath: '',
      DeploymentPaths: [],
      ProjectType: 'node',
      Config: {
        Branch: 'master',
        AutoDeploy: true,
        Environment: 'production',
        DeployOnPaths: [],
        Pipeline: [],
        PostDeploymentPipeline: [],
        Notifications: {
          OnSuccess: true,
          OnFailure: true,
          OnStart: false,
        },
        Variables: {},
        EnableRollbackOnPostDeployFailure: true,
      } as IProjectConfig,
    }
  );

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
          id: Project.Id,
          data: dataToSubmit,
        });
        showSuccess('Project updated successfully');
      } else {
        // Create new project
        await createProject.mutateAsync(dataToSubmit);
        showSuccess('Project created successfully');
      }

      OnClose(true); // Pass true to indicate update/create happened
    } catch (err: unknown) {
      const errorMessage = (err as any).message || 'Failed to save project';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleClose = () => {
    OnClose(false); // Pass false to indicate no update
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
        return <Step1BasicInfo data={formData} onChange={updateFormData} />;
      case 1:
        return <Step2Configuration config={formData.Config!} onChange={updateConfig} />;
      case 2:
        return (
          <Step3Pipeline
            pipeline={formData.Config!.Pipeline || []}
            onChange={(pipeline) => updateConfig({ Pipeline: pipeline })}
          />
        );
      case 3:
        return (
          <PostDeploymentPipeline
            pipeline={formData.Config!.PostDeploymentPipeline || []}
            enableRollback={formData.Config?.EnableRollbackOnPostDeployFailure !== false}
            onChange={(pipeline) => updateConfig({ PostDeploymentPipeline: pipeline })}
            onEnableRollbackChange={(enabled) =>
              updateConfig({ EnableRollbackOnPostDeployFailure: enabled })
            }
          />
        );
      case 4:
        return (
          <Step4Notifications
            notifications={
              formData.Config?.Notifications || {
                OnSuccess: true,
                OnFailure: true,
                OnStart: false,
              }
            }
            onChange={(notifications) => updateConfig({ Notifications: notifications })}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog
      open={Open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '85vh',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Sticky Header */}
      <DialogTitle
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          borderBottom: 1,
          borderColor: 'divider',
          py: 1.5,
        }}
      >
        {isEditMode ? 'Edit Project' : 'Create New Project'}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mt: 0.5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      {/* Scrollable Content */}
      <DialogContent
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 1,
          px: 2,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 0.5 }}>
            {error}
          </Alert>
        )}

        <Box>{getStepContent(activeStep)}</Box>
      </DialogContent>

      {/* Sticky Footer */}
      <DialogActions
        sx={{
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          py: 1,
          px: 2,
        }}
      >
        <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Finish'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
