import React, { useState, useEffect } from 'react';
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
  /**
   * v3.0 F-008 (T084): when set (and Project is NOT set), pre-fills the
   * Create form with these defaults. Typically supplied by
   * ProjectTemplateWizard's selected template's `DefaultConfig`.
   * Ignored in edit mode.
   */
  PrefillConfig?: Partial<import('@/types').IProjectConfig>;
  OnClose: (updated: boolean) => void;
}

const steps = ['Basic Info', 'Configuration', 'Pipeline', 'Post-Deployment', 'Notifications'];

export const ProjectFormModal: React.FC<IProjectFormModalProps> = ({
  Open,
  Project,
  PrefillConfig,
  OnClose,
}) => {
  const { showSuccess, showError } = useToast();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const isEditMode = !!Project;
  const loading = createProject.isPending || updateProject.isPending;

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getDefaultFormData = (): Partial<IProject> => ({
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
  });

  const [formData, setFormData] = useState<Partial<IProject>>(getDefaultFormData());

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (Open) {
      if (Project) {
        setFormData(Project);
      } else if (PrefillConfig) {
        // v3.0 F-008 — merge template DefaultConfig over the create defaults,
        // user can still edit every field in subsequent steps.
        const defaults = getDefaultFormData();
        setFormData({
          ...defaults,
          Config: { ...defaults.Config!, ...PrefillConfig },
        });
      } else {
        setFormData(getDefaultFormData());
      }
      setActiveStep(0);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Open, Project?.Id, PrefillConfig]);

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
      key={Project?.Id || 'new'}
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
        {isEditMode ? 'Edit Project' : 'Create New Project'} - ( Click on <span style={{ fontWeight: 'bold', color: 'red' }}>step</span> to Jump to that step)
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
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  cursor: 'pointer', '&:hover': {
                    opacity: 0.8, color: 'primary.main', fontWeight: 'bold',
                  },
                  '& .MuiStepLabel-label.MuiStepLabel-alternativeLabel': {
                    opacity: 0.8, color: 'primary.main', fontWeight: 'bold',
                  }
                }}
                onClick={() => setActiveStep(index)}
              >
                {label}
              </StepLabel>
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
