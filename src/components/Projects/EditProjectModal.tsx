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
import { useUpdateProject } from '@/hooks/useProjects';
import { useToast } from '@/contexts/ToastContext';
import { Step1BasicInfo } from './Wizard/Step1BasicInfo';
import { Step2Configuration } from './Wizard/Step2Configuration';
import { Step3Pipeline } from './Wizard/Step3Pipeline';
import { PostDeploymentPipeline } from './Wizard/PostDeploymentPipeline';
import { Step4Notifications } from './Wizard/Step4Notifications';

interface IEditProjectModalProps {
  Open: boolean;
  Project: IProject;
  OnClose: (updated: boolean) => void;
}

const steps = ['Basic Info', 'Configuration', 'Pipeline', 'Post-Deployment', 'Notifications'];

export const EditProjectModal: React.FC<IEditProjectModalProps> = ({
  Open,
  Project,
  OnClose,
}) => {
  const { showSuccess, showError } = useToast();
  const updateProject = useUpdateProject();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<IProject>>(Project);

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

      await updateProject.mutateAsync({
        id: Project.Id,
        data: dataToSubmit,
      });
      showSuccess('Project updated successfully');
      OnClose(true); // Pass true to indicate update happened
    } catch (err: unknown) {
      const errorMessage = (err as any).message || 'Failed to update project';
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
        Edit Project
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
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
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
          py: 2,
          px: 3,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
          py: 1.5,
          px: 3,
        }}
      >
        <Button disabled={activeStep === 0 || updateProject.isPending} onClick={handleBack}>
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={updateProject.isPending}
          >
            {updateProject.isPending ? 'Saving...' : 'Finish'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={updateProject.isPending}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
