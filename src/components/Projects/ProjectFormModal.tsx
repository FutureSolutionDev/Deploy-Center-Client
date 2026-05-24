import React, { useState, useEffect, useRef } from 'react';
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
// v3.0 F-006: replaces the legacy in-Config notifications form with the
// Provider/Channel/Subscription model. The legacy step is no longer mounted.
import {
  Step4NotificationSubscriptions,
  type ISubscriptionSelection,
} from './Wizard/Step4NotificationSubscriptions';
import {
  ProjectNotificationSubscriptionService,
  type TNotificationEvent,
} from '@/services/projectNotificationSubscriptionService';

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

  // v3.0 F-006 — desired subscription set; reconciled in handleSubmit.
  // Seeded at the PARENT level (not inside the step) so that the seed runs
  // unconditionally when the modal opens in edit mode — even if the user
  // never navigates to the Notifications step. Without this, the
  // reconcileSubscriptions diff would see desired=[] vs existing=N and
  // delete every existing subscription on Save. (Bug found post-v3.0.)
  const [subscriptionState, setSubscriptionState] = useState<ISubscriptionSelection[]>([]);
  // Track whether the parent seed has already run for the current modal
  // session. Reset when the modal re-opens.
  const subsSeededRef = useRef(false);

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
      // v3.0 F-006 — reset subscription state for every (re)open. In edit
      // mode the parent-level seed effect below will repopulate it from the
      // server. In create mode it stays [] until the user toggles.
      setSubscriptionState([]);
      subsSeededRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Open, Project?.Id, PrefillConfig]);

  // v3.0 F-006 — seed subscriptionState from the server when editing.
  // Runs at the parent level (not inside the step) so it fires regardless
  // of which step the user is viewing. Idempotent via subsSeededRef.
  useEffect(() => {
    if (!Open) return;
    if (!isEditMode || !Project) return;
    if (subsSeededRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const subs = await ProjectNotificationSubscriptionService.list(Project.Id);
        if (cancelled) return;
        const seed: ISubscriptionSelection[] = subs.map((s) => ({
          ChannelId: s.ChannelId,
          Events: (s.Events.length > 0
            ? s.Events
            : (['DeploymentFailed'] as TNotificationEvent[])),
        }));
        setSubscriptionState(seed);
        subsSeededRef.current = true;
      } catch {
        // Non-fatal: the modal still works for the project fields. If the
        // user never touches Notifications, subsSeededRef stays false and
        // reconcileSubscriptions will skip the fetch-and-diff entirely.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [Open, isEditMode, Project?.Id]);

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

      let resolvedProjectId: number | null = null;
      if (isEditMode) {
        // Update existing project
        await updateProject.mutateAsync({
          id: Project.Id,
          data: dataToSubmit,
        });
        resolvedProjectId = Project.Id;
        showSuccess('Project updated successfully');
      } else {
        // Create new project
        const created = (await createProject.mutateAsync(dataToSubmit)) as {
          Id?: number;
          Project?: { Id?: number };
        };
        resolvedProjectId = (created?.Id ?? created?.Project?.Id) ?? null;
        showSuccess('Project created successfully');
      }

      // v3.0 F-006 — apply notification subscriptions now that we have an id.
      if (resolvedProjectId) {
        try {
          await reconcileSubscriptions(resolvedProjectId);
        } catch (subErr) {
          // Subscriptions are non-fatal — surface as a toast but still close.
          showError(
            `Project saved, but failed to update notification subscriptions: ${(subErr as Error).message}`
          );
        }
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
        // The parent seeded subscriptionState from the server already
        // (see useEffect above), so the step is a pure controlled UI.
        return (
          <Step4NotificationSubscriptions
            projectId={Project?.Id ?? null}
            value={subscriptionState}
            onChange={setSubscriptionState}
            seedFromServer={false}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  /**
   * v3.0 F-006 — reconcile subscriptionState against the live server state.
   * Called after the project is created/updated so we know its id.
   *
   * Safety guard: in edit mode, if the parent seed effect never completed
   * (network failure / modal closed before seed finished), subsSeededRef
   * stays false. We then SKIP reconcile entirely — otherwise desired=[] vs
   * existing=N would delete every existing subscription. The user can
   * still manage subs on the Project → Notifications card.
   */
  const reconcileSubscriptions = async (projectId: number): Promise<void> => {
    if (isEditMode && !subsSeededRef.current) {
      // Seed never finished → unsafe to diff. Bail out.
      return;
    }

    const desired = subscriptionState;

    // existingSubs lookup we need: id per channel. We fetch fresh to avoid
    // stale ids (cache may not be primed if the modal closed/reopened).
    const existingSubs = isEditMode
      ? await ProjectNotificationSubscriptionService.list(projectId)
      : [];

    const existingByChannel = new Map<number, { Id: number; Events: string[] }>();
    for (const s of existingSubs) {
      existingByChannel.set(s.ChannelId, { Id: s.Id, Events: s.Events });
    }

    const desiredByChannel = new Map<number, string[]>();
    for (const d of desired) desiredByChannel.set(d.ChannelId, d.Events);

    const ops: Promise<unknown>[] = [];

    // Create + update.
    for (const d of desired) {
      const existing = existingByChannel.get(d.ChannelId);
      if (!existing) {
        // brand-new subscription
        ops.push(
          ProjectNotificationSubscriptionService.create(projectId, {
            ChannelId: d.ChannelId,
            Events: d.Events as never,
          })
        );
      } else {
        // update only if event list changed (set equality, order-insensitive)
        const a = new Set<string>(existing.Events);
        const b = new Set<string>(d.Events as readonly string[]);
        const same = a.size === b.size && [...a].every((e) => b.has(e));
        if (!same) {
          ops.push(
            ProjectNotificationSubscriptionService.update(projectId, existing.Id, {
              Events: d.Events as never,
              IsActive: true,
            })
          );
        }
      }
    }

    // Deletes — anything in existingSubs that's no longer desired.
    for (const s of existingSubs) {
      if (!desiredByChannel.has(s.ChannelId)) {
        ops.push(ProjectNotificationSubscriptionService.remove(projectId, s.Id));
      }
    }

    if (ops.length > 0) {
      await Promise.allSettled(ops);
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
