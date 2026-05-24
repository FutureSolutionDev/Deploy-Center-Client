/**
 * ProjectDetailsPage — Deploy Center v3.0.
 *
 * Re-organized into a tabbed layout (consistent with DeploymentDetailsPage)
 * after Sabry feedback on the previous 10-card vertical wall.
 *
 * Tabs (visibility depends on role):
 *   Overview      — info + stats (everyone)
 *   Configuration — config card (everyone)
 *   Pipeline      — pipeline card (everyone)
 *   Variables     — F-003 encrypted env vars (Admin / Manager)
 *   Deployments   — recent deployments table (everyone)
 *   Notifications — F-006 per-project subscriptions (Admin / Manager)
 *   Access        — members + webhook + ssh key (non-viewer)
 *
 * v3.0: legacy `VariablesManager` (which edited Project.Config.Variables JSON)
 * was deleted; encrypted env vars in the new `EnvironmentVariables` table are
 * the single source of truth on the Variables tab.
 */

import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tabs,
  Tab,
  Card,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  AccountTree as PipelineIcon,
  VpnKey as VariablesIcon,
  Rocket as DeploymentsIcon,
  NotificationsActive as NotificationsIcon,
  Lock as AccessIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDateFormatter } from "@/hooks/useDateFormatter";
import { useRole } from "@/contexts/RoleContext";
import type { IDeploymentRequest } from "@/types";
import { DeploymentModal } from "@/components/Projects/DeploymentModal";
import { ProjectFormModal } from "@/components/Projects/ProjectFormModal";
import { SshKeyManagement } from "@/components/Projects/SshKeyManagement";
import { useToast } from "@/contexts/ToastContext";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useDeployProject,
  useProjectStatistics,
  useRegenerateWebhook,
} from "@/hooks/useProjects";
import { useDeployments } from "@/hooks/useDeployments";
import {
  ProjectHeader,
  ProjectInfoCard,
  ProjectConfigCard,
  ProjectPipelineCard,
  ProjectStatsCard,
  ProjectDeploymentsTable,
  ProjectWebhookCard,
  ProjectMembersCard,
} from "./components";
import EnvironmentVariablesCard from "./components/EnvironmentVariablesCard"; // v3.0 F-003
import ProjectNotificationsCard from "./components/ProjectNotificationsCard"; // v3.0 F-006

interface ITabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<ITabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatDateTime } = useDateFormatter();
  const { showSuccess, showError } = useToast();
  const { isViewer, canManageProjects } = useRole();

  // React Query hooks
  const { data: project, isLoading, error, refetch } = useProject(Number(id));
  const { data: allDeployments = [] } = useDeployments();
  const { data: stats } = useProjectStatistics(Number(id));
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const deployProject = useDeployProject();
  const regenerateWebhook = useRegenerateWebhook();

  // Local UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Filter deployments for this project
  const projectDeployments = useMemo(
    () =>
      allDeployments.filter(
        (d) => d.ProjectId === Number(id) || d.ProjectName === project?.Name
      ),
    [allDeployments, id, project?.Name]
  );

  const handleOpenDeploy = (): void => {
    setDeployDialogOpen(true);
  };

  const handleDeploy = async (data: IDeploymentRequest): Promise<void> => {
    if (!project) return;
    try {
      await deployProject.mutateAsync({ id: data.ProjectId, data });
      showSuccess(t("deployments.startedSuccessfully"));
      setDeployDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : t("deployments.failedToStart");
      throw new Error(errorMessage);
    }
  };

  const handleDeleteClick = (): void => setDeleteDialogOpen(true);

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!project) return;
    deleteProject.mutate(project.Id, {
      onSuccess: () => {
        showSuccess(t("projects.deletedSuccessfully"));
        navigate("/projects");
      },
      onError: (err: Error) => {
        showError(err?.message || t("projects.failedToDelete"));
        setDeleteDialogOpen(false);
      },
    });
  };

  const handleToggleActive = async (): Promise<void> => {
    if (!project) return;
    updateProject.mutate(
      { id: project.Id, data: { IsActive: !project.IsActive } },
      {
        onSuccess: () => {
          showSuccess(
            project.IsActive
              ? t("projects.deactivatedSuccessfully")
              : t("projects.activatedSuccessfully")
          );
        },
        onError: (err: Error) =>
          showError(err?.message || t("projects.failedToToggleActive")),
      }
    );
  };

  const handleRegenerateWebhook = async (): Promise<void> => {
    if (!project) return;
    if (!window.confirm(t("projects.webhookRegenerationWarning"))) return;
    regenerateWebhook.mutate(project.Id, {
      onSuccess: () => showSuccess(t("projects.webhookRegenerated")),
      onError: (err: Error) =>
        showError(err?.message || t("projects.failedToRegenerateWebhook")),
    });
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    showSuccess(t("common.copiedToClipboard"));
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && !project) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate("/projects")}>
          {t("common.backToProjects")}
        </Button>
      </Box>
    );
  }

  // Not found state
  if (!project) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t("deployments.notFound")}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate("/projects")}>
          {t("common.backToProjects")}
        </Button>
      </Box>
    );
  }

  // ─── tab definitions (role-gated) ─────────────────────────────────────
  interface ITabDef {
    key: string;
    label: string;
    icon: React.ReactElement;
    visible: boolean;
    render: () => React.ReactNode;
  }

  const tabs: ITabDef[] = [
    {
      key: "overview",
      label: "Overview",
      icon: <InfoIcon />,
      visible: true,
      render: () => (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ProjectInfoCard project={project} formatDateTime={formatDateTime} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ProjectStatsCard stats={stats || null} />
          </Grid>
        </Grid>
      ),
    },
    {
      key: "configuration",
      label: "Configuration",
      icon: <SettingsIcon />,
      visible: true,
      render: () => <ProjectConfigCard project={project} />,
    },
    {
      key: "pipeline",
      label: "Pipeline",
      icon: <PipelineIcon />,
      visible: true,
      render: () => <ProjectPipelineCard project={project} />,
    },
    {
      key: "variables",
      label: "Variables",
      icon: <VariablesIcon />,
      visible: canManageProjects,
      render: () => <EnvironmentVariablesCard projectId={project.Id} />,
    },
    {
      key: "deployments",
      label: "Deployments",
      icon: <DeploymentsIcon />,
      visible: true,
      render: () => (
        <ProjectDeploymentsTable
          deployments={projectDeployments}
          formatDateTime={formatDateTime}
        />
      ),
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <NotificationsIcon />,
      visible: canManageProjects,
      render: () => <ProjectNotificationsCard projectId={project.Id} />,
    },
    {
      key: "access",
      label: "Access",
      icon: <AccessIcon />,
      // Webhook + SSH visible to anyone but viewer; Members admin/manager only.
      // We show the tab if any of those rows would be visible.
      visible: !isViewer || canManageProjects,
      render: () => (
        <Grid container spacing={2}>
          {!isViewer && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <ProjectWebhookCard
                  project={project}
                  onRegenerateWebhook={handleRegenerateWebhook}
                  onCopyToClipboard={copyToClipboard}
                  regeneratingWebhook={regenerateWebhook.isPending}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <SshKeyManagement project={project} onUpdate={() => refetch()} />
              </Grid>
            </>
          )}
          {canManageProjects && (
            <Grid size={12}>
              <ProjectMembersCard projectId={project.Id} projectName={project.Name} />
            </Grid>
          )}
        </Grid>
      ),
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible);
  // Clamp tabIndex in case the visible-tab list shrinks (e.g., role change).
  const safeTabIndex = tabIndex < visibleTabs.length ? tabIndex : 0;

  return (
    <Box>
      {/* Header */}
      <ProjectHeader
        project={project}
        onRefresh={refetch}
        onEdit={() => setEditDialogOpen(true)}
        onToggleActive={handleToggleActive}
        onDelete={handleDeleteClick}
        onDeploy={handleOpenDeploy}
        togglingActive={updateProject.isPending}
        deploying={deployProject.isPending}
      />

      {/* Tabs */}
      <Card sx={{ mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={safeTabIndex}
            onChange={(_, v: number) => setTabIndex(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {visibleTabs.map((tab) => (
              <Tab
                key={tab.key}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                sx={{ minHeight: 48 }}
              />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ p: 2 }}>
          {visibleTabs.map((tab, idx) => (
            <TabPanel key={tab.key} value={safeTabIndex} index={idx}>
              {tab.render()}
            </TabPanel>
          ))}
        </Box>
      </Card>

      {/* Manual Deployment Dialog */}
      <DeploymentModal
        Open={deployDialogOpen}
        Project={project}
        OnClose={() => setDeployDialogOpen(false)}
        OnDeploy={handleDeploy}
      />

      {/* Edit Project Dialog */}
      <ProjectFormModal
        Open={editDialogOpen}
        Project={project}
        OnClose={(updated) => {
          setEditDialogOpen(false);
          if (updated) refetch();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("projects.deleteProject")}</DialogTitle>
        <DialogContent>
          <Typography>{t("projects.confirmDeleteDesc")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            startIcon={<DeleteIcon />}
          >
            {t("projects.deleteProject")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
