/**
 * ProjectsPage — Deploy Center v3.0.
 * Workspace-first grid. Each workspace = a card; projects inside are draggable
 * across cards (drag-and-drop via @dnd-kit). "Unassigned" is always the last
 * card (no edit/delete).
 *
 * Replaces the v2.1 flat projects list AND the standalone /workspaces page —
 * one screen does both.
 */

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Stack,
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  CreateNewFolder as NewWorkspaceIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  GitHub as GitHubIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Rocket as DeployIcon,
  Visibility as ViewIcon,
  PowerSettingsNew as ToggleIcon,
  MoreVert as MoreVertIcon,
  FolderOpen as UnassignedIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { useRole } from "@/contexts/RoleContext";
import {
  useProjects,
  useUpdateProject,
  useDeleteProject,
  useDeployProject,
} from "@/hooks/useProjects";
import type { IProject, IDeploymentRequest } from "@/types";
import { ProjectFormModal } from "@/components/Projects/ProjectFormModal";
import { DeploymentModal } from "@/components/Projects/DeploymentModal";
import {
  WorkspaceService,
  type IWorkspaceListItem,
  type IWorkspaceListResponse,
} from "@/services/workspaceService";
import {
  WORKSPACE_ICON_COMPONENTS,
  DEFAULT_WORKSPACE_ICON,
  type TWorkspaceIcon,
} from "@/types/workspaceIcons";
import { WorkspaceIconPicker } from "@/pages/Projects/WorkspaceIconPicker";

const PRESET_COLORS = [
  "#1976d2",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#c62828",
  "#0097a7",
  "#5d4037",
  "#455a64",
];

// ─── drag-and-drop ids ──────────────────────────────────────────────────────
// Project draggables: `proj-{Id}`
// Workspace droppables: `ws-{Id}`  |  Unassigned droppable: `ws-unassigned`
const projDragId = (id: number): string => `proj-${id}`;
const wsDropId = (id: number | null): string =>
  id === null ? "ws-unassigned" : `ws-${id}`;
const parseWsDropId = (id: string): number | null => {
  if (id === "ws-unassigned") return null;
  const m = /^ws-(\d+)$/.exec(id);
  return m ? Number(m[1]) : null;
};
const parseProjDragId = (id: string): number | null => {
  const m = /^proj-(\d+)$/.exec(id);
  return m ? Number(m[1]) : null;
};

interface IWorkspaceDialogState {
  open: boolean;
  mode: "create" | "edit";
  editingId?: number;
  Name: string;
  Description: string;
  Color: string;
  Icon: TWorkspaceIcon;
}
const emptyWsDialog: IWorkspaceDialogState = {
  open: false,
  mode: "create",
  Name: "",
  Description: "",
  Color: "#1976d2",
  Icon: DEFAULT_WORKSPACE_ICON,
};

// ─── small components ───────────────────────────────────────────────────────

interface IProjectCardProps {
  project: IProject;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, p: IProject) => void;
  onOpenDetails: (p: IProject) => void;
  canManage: boolean;
}

const ProjectRow: React.FC<IProjectCardProps> = ({
  project,
  onMenuOpen,
  onOpenDetails,
  canManage,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: projDragId(project.Id),
      disabled: !canManage,
    });
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.4 : 1,
    cursor: canManage ? "grab" : "default",
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.75,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        "&:hover": { bgcolor: "action.hover" },
        mb: 0.5,
      }}
    >
      {canManage && (
        <Box
          {...listeners}
          {...attributes}
          sx={{ display: "flex", alignItems: "center", color: "text.disabled" }}
        >
          <DragIcon fontSize="small" />
        </Box>
      )}
      <Box
        sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        onClick={() => onOpenDetails(project)}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {project.Name}
          {!project.IsActive && (
            <Chip size="small" label="Inactive" sx={{ ml: 1, height: 18 }} />
          )}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          noWrap
        >
          <GitHubIcon sx={{ fontSize: 12 }} />
          {project.RepoUrl}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onMenuOpen(e, project);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

interface IWorkspaceCardProps {
  workspace: IWorkspaceListItem | null; // null = "Unassigned"
  projects: IProject[];
  onProjectMenuOpen: (e: React.MouseEvent<HTMLElement>, p: IProject) => void;
  onProjectOpenDetails: (p: IProject) => void;
  onEditWorkspace: (ws: IWorkspaceListItem) => void;
  onDeleteWorkspace: (ws: IWorkspaceListItem) => void;
  canManageProject: boolean;
  canEditWorkspace: (ws: IWorkspaceListItem) => boolean;
}

const WorkspaceCard: React.FC<IWorkspaceCardProps> = ({
  workspace,
  projects,
  onProjectMenuOpen,
  onProjectOpenDetails,
  onEditWorkspace,
  onDeleteWorkspace,
  canManageProject,
  canEditWorkspace,
}) => {
  const isUnassigned = workspace === null;
  const dropId = wsDropId(workspace?.Id ?? null);
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    disabled: !canManageProject,
  });

  const Icon = isUnassigned
    ? UnassignedIcon
    : WORKSPACE_ICON_COMPONENTS[workspace.Icon];
  const headerColor = isUnassigned ? "#9e9e9e" : workspace.Color;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        borderTop: "4px solid",
        borderTopColor: headerColor,
        ...(isOver && canManageProject
          ? { outline: "2px dashed", outlineColor: headerColor }
          : {}),
        transition: "outline-color 120ms",
        minHeight: 200,
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: headerColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: "white", fontSize: 20 }} />
          </Box>
        }
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {isUnassigned ? "Unassigned" : workspace.Name}
            </Typography>
            <Chip size="small" label={projects.length} />
          </Box>
        }
        subheader={
          isUnassigned
            ? "Projects with no workspace"
            : workspace.Description || " "
        }
        action={
          !isUnassigned && canEditWorkspace(workspace) ? (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit workspace">
                <IconButton
                  size="small"
                  onClick={() => onEditWorkspace(workspace)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete (projects move to Unassigned)">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDeleteWorkspace(workspace)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : undefined
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent
        ref={setNodeRef}
        sx={{
          flex: 1,
          p: 1.5,
          minHeight: 100,
          bgcolor:
            isOver && canManageProject ? `${headerColor}11` : "transparent",
        }}
      >
        {projects.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 80,
              color: "text.disabled",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption">
              {canManageProject ? "Drop a project here" : "No projects"}
            </Typography>
          </Box>
        ) : (
          projects.map((p) => (
            <ProjectRow
              key={p.Id}
              project={p}
              onMenuOpen={onProjectMenuOpen}
              onOpenDetails={onProjectOpenDetails}
              canManage={canManageProject}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

// ─── main page ──────────────────────────────────────────────────────────────

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { canManageProjects, canDeploy, isViewer, role } = useRole();
  const queryClient = useQueryClient();

  // Projects (existing infrastructure)
  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
    refetch,
  } = useProjects(true);
  const updateProject = useUpdateProject();
  const deleteProjectMut = useDeleteProject();
  const deployProjectMut = useDeployProject();

  // Workspaces
  const workspacesQuery = useQuery<IWorkspaceListResponse>({
    queryKey: ["workspaces"],
    queryFn: () => WorkspaceService.list(),
  });
  const workspaces = workspacesQuery.data?.Items ?? [];

  // Drag-and-drop reassignment mutation with optimistic update.
  const assignMut = useMutation({
    mutationFn: ({
      projectId,
      workspaceId,
    }: {
      projectId: number;
      workspaceId: number | null;
    }) => WorkspaceService.assignProject(projectId, workspaceId),
    onMutate: async ({ projectId, workspaceId }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData<IProject[]>([
        "projects",
        { includeInactive: true },
      ]);
      if (previous) {
        queryClient.setQueryData<IProject[]>(
          ["projects", { includeInactive: true }],
          previous.map((p) =>
            p.Id === projectId ? { ...p, WorkspaceId: workspaceId } : p,
          ),
        );
      }
      return { previous };
    },
    onError: (
      err: { response?: { data?: { Message?: string } }; message?: string },
      _vars,
      ctx,
    ) => {
      if (ctx?.previous) {
        queryClient.setQueryData(
          ["projects", { includeInactive: true }],
          ctx.previous,
        );
      }
      showError(
        err?.response?.data?.Message ??
          err?.message ??
          "Failed to move project",
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  // Workspace CRUD mutations
  const wsCreateMut = useMutation({
    mutationFn: (input: {
      Name: string;
      Description: string;
      Color: string;
      Icon: TWorkspaceIcon;
    }) =>
      WorkspaceService.create({
        Name: input.Name,
        Description: input.Description || null,
        Color: input.Color,
        Icon: input.Icon,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setWsDialog(emptyWsDialog);
      setWsError(null);
      showSuccess("Workspace created");
    },
    onError: (err: { response?: { data?: { Message?: string } } }) =>
      setWsError(err?.response?.data?.Message ?? "Failed to create workspace"),
  });
  const wsUpdateMut = useMutation({
    mutationFn: (input: {
      id: number;
      Name: string;
      Description: string;
      Color: string;
      Icon: TWorkspaceIcon;
    }) =>
      WorkspaceService.update(input.id, {
        Name: input.Name,
        Description: input.Description || null,
        Color: input.Color,
        Icon: input.Icon,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setWsDialog(emptyWsDialog);
      setWsError(null);
      showSuccess("Workspace updated");
    },
    onError: (err: { response?: { data?: { Message?: string } } }) =>
      setWsError(err?.response?.data?.Message ?? "Failed to update workspace"),
  });
  const wsDeleteMut = useMutation({
    mutationFn: (id: number) => WorkspaceService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess("Workspace deleted; projects moved to Unassigned");
    },
    onError: (err: { response?: { data?: { Message?: string } } }) =>
      showError(err?.response?.data?.Message ?? "Failed to delete workspace"),
  });

  // Project-row actions menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [deployingProject, setDeployingProject] = useState<IProject | null>(
    null,
  );
  const [search, setSearch] = useState("");

  // Workspace dialog state
  const [wsDialog, setWsDialog] =
    useState<IWorkspaceDialogState>(emptyWsDialog);
  const [wsError, setWsError] = useState<string | null>(null);

  // Group projects by workspace
  const grouped = useMemo(() => {
    const filterMatch = (p: IProject): boolean =>
      search.length === 0 ||
      p.Name.toLowerCase().includes(search.toLowerCase()) ||
      p.RepoUrl.toLowerCase().includes(search.toLowerCase());

    const byWs = new Map<number, IProject[]>();
    const unassigned: IProject[] = [];
    for (const p of projects) {
      if (!filterMatch(p)) continue;
      if (p.WorkspaceId) {
        const arr = byWs.get(p.WorkspaceId) ?? [];
        arr.push(p);
        byWs.set(p.WorkspaceId, arr);
      } else {
        unassigned.push(p);
      }
    }
    return { byWs, unassigned };
  }, [projects, search]);

  // DnD setup — small activation distance so click events still fire on row body
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over) return;
    const projectId = parseProjDragId(String(active.id));
    if (projectId === null) return;
    const overId = String(over.id);
    if (!overId.startsWith("ws-")) return;
    const targetWorkspaceId = parseWsDropId(overId);
    const currentProj = projects.find((p) => p.Id === projectId);
    if (!currentProj) return;
    const currentWs = currentProj.WorkspaceId ?? null;
    if (currentWs === targetWorkspaceId) return; // same workspace; no-op
    assignMut.mutate({ projectId, workspaceId: targetWorkspaceId });
  };

  // Project row action handlers
  const handleMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    p: IProject,
  ): void => {
    setAnchorEl(e.currentTarget);
    setSelectedProject(p);
  };
  const handleMenuClose = (): void => {
    setAnchorEl(null);
    setSelectedProject(null);
  };
  const handleOpenDetails = (p: IProject): void => {
    navigate(`/projects/${p.Id}`);
  };
  const handleOpenProjectDialog = (p?: IProject): void => {
    setEditingProject(p ?? null);
    setOpenDialog(true);
  };
  const handleProjectDialogClose = (updated: boolean): void => {
    setOpenDialog(false);
    setEditingProject(null);
    if (updated) refetch();
  };
  const handleDeleteConfirm = (): void => {
    if (!selectedProject) return;
    deleteProjectMut.mutate(selectedProject.Id, {
      onSuccess: () => {
        showSuccess("Project deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedProject(null);
      },
      onError: (err: Error) => {
        showError(err?.message || "Failed to delete");
        setDeleteDialogOpen(false);
      },
    });
  };
  const handleDeploy = async (data: IDeploymentRequest): Promise<void> => {
    try {
      await deployProjectMut.mutateAsync({ id: data.ProjectId, data });
      showSuccess("Deployment started");
      setDeployDialogOpen(false);
      setDeployingProject(null);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Deploy failed";
      throw new Error(msg);
    }
  };
  const handleToggleActive = (): void => {
    if (!selectedProject) return;
    updateProject.mutate(
      { id: selectedProject.Id, data: { IsActive: !selectedProject.IsActive } },
      {
        onSuccess: () => {
          showSuccess(
            `Project ${selectedProject.IsActive ? "deactivated" : "activated"}`,
          );
          handleMenuClose();
        },
        onError: (err: Error) => {
          showError(err?.message || "Failed to update");
          handleMenuClose();
        },
      },
    );
  };

  // Workspace dialog handlers
  const openWsCreate = (): void =>
    setWsDialog({ ...emptyWsDialog, open: true, mode: "create" });
  const openWsEdit = (ws: IWorkspaceListItem): void =>
    setWsDialog({
      open: true,
      mode: "edit",
      editingId: ws.Id,
      Name: ws.Name,
      Description: ws.Description ?? "",
      Color: ws.Color,
      Icon: ws.Icon,
    });
  const canEditWorkspace = (ws: IWorkspaceListItem): boolean =>
    role === "admin" || (!!ws.CreatedBy && false); // backend rechecks; UI shows for admin

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {t("projects.title") || "Projects"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Group projects in workspaces. Drag projects between cards to
            reassign.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh">
            <span>
              <IconButton
                onClick={() => {
                  void refetch();
                  void workspacesQuery.refetch();
                }}
                disabled={projectsLoading}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            startIcon={<NewWorkspaceIcon />}
            variant="outlined"
            onClick={openWsCreate}
          >
            New Workspace
          </Button>
          {canManageProjects && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => handleOpenProjectDialog()}
            >
              New Project
            </Button>
          )}
        </Stack>
      </Box>

      {projectsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {projectsError instanceof Error
            ? projectsError.message
            : "Failed to load projects"}
        </Alert>
      )}

      {projectsLoading || workspacesQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {/* Unassigned — always last */}
            <WorkspaceCard
              workspace={null}
              projects={grouped.unassigned}
              onProjectMenuOpen={handleMenuOpen}
              onProjectOpenDetails={handleOpenDetails}
              onEditWorkspace={() => undefined}
              onDeleteWorkspace={() => undefined}
              canManageProject={canManageProjects}
              canEditWorkspace={() => false}
            />
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.Id}
                workspace={ws}
                projects={grouped.byWs.get(ws.Id) ?? []}
                onProjectMenuOpen={handleMenuOpen}
                onProjectOpenDetails={handleOpenDetails}
                onEditWorkspace={openWsEdit}
                onDeleteWorkspace={(w) => {
                  if (
                    confirm(
                      `Delete '${w.Name}'? Its projects will move to Unassigned.`,
                    )
                  ) {
                    wsDeleteMut.mutate(w.Id);
                  }
                }}
                canManageProject={canManageProjects}
                canEditWorkspace={canEditWorkspace}
              />
            ))}
          </Box>
        </DndContext>
      )}

      {/* Project row menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedProject) handleOpenDetails(selectedProject);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View details</ListItemText>
        </MenuItem>
        {canDeploy && selectedProject?.IsActive && (
          <MenuItem
            onClick={() => {
              if (selectedProject) {
                setDeployingProject(selectedProject);
                setDeployDialogOpen(true);
              }
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <DeployIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Deploy</ListItemText>
          </MenuItem>
        )}
        {canManageProjects && (
          <>
            <MenuItem
              onClick={() => {
                if (selectedProject) handleOpenProjectDialog(selectedProject);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleToggleActive}>
              <ListItemIcon>
                <ToggleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {selectedProject?.IsActive ? "Deactivate" : "Activate"}
              </ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDeleteDialogOpen(true);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
        {isViewer && (
          <MenuItem disabled>
            <ListItemText>Read-only</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Project form modal */}
      {openDialog && (
        <ProjectFormModal
          Open={openDialog}
          Project={editingProject ?? undefined}
          OnClose={handleProjectDialogClose}
        />
      )}

      {/* Project delete confirm */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{selectedProject?.Name}</strong>? This will soft-delete (set
          IsActive=false) and clean up the bare-clone cache.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deploy modal */}
      <DeploymentModal
        Open={deployDialogOpen}
        Project={deployingProject}
        OnClose={() => {
          setDeployDialogOpen(false);
          setDeployingProject(null);
        }}
        OnDeploy={handleDeploy}
      />

      {/* Workspace create/edit dialog */}
      <Dialog
        open={wsDialog.open}
        onClose={() => setWsDialog(emptyWsDialog)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {wsDialog.mode === "create"
            ? "New Workspace"
            : `Edit ${wsDialog.Name}`}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={wsDialog.Name}
            onChange={(e) =>
              setWsDialog((s) => ({ ...s, Name: e.target.value }))
            }
          />
          <TextField
            label="Description (optional)"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            value={wsDialog.Description}
            onChange={(e) =>
              setWsDialog((s) => ({ ...s, Description: e.target.value }))
            }
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              Color
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {PRESET_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setWsDialog((s) => ({ ...s, Color: c }))}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: c,
                    cursor: "pointer",
                    border:
                      wsDialog.Color === c
                        ? "3px solid #000"
                        : "3px solid transparent",
                  }}
                />
              ))}
              <TextField
                size="small"
                sx={{ width: 110 }}
                value={wsDialog.Color}
                onChange={(e) =>
                  setWsDialog((s) => ({ ...s, Color: e.target.value }))
                }
                placeholder="#RRGGBB"
              />
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <WorkspaceIconPicker
              value={wsDialog.Icon}
              onChange={(next) => setWsDialog((s) => ({ ...s, Icon: next }))}
              color={wsDialog.Color}
            />
          </Box>
          {wsError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {wsError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWsDialog(emptyWsDialog)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              wsDialog.Name.length === 0 ||
              wsCreateMut.isPending ||
              wsUpdateMut.isPending
            }
            onClick={() => {
              if (wsDialog.mode === "create") {
                wsCreateMut.mutate({
                  Name: wsDialog.Name,
                  Description: wsDialog.Description,
                  Color: wsDialog.Color,
                  Icon: wsDialog.Icon,
                });
              } else if (wsDialog.editingId) {
                wsUpdateMut.mutate({
                  id: wsDialog.editingId,
                  Name: wsDialog.Name,
                  Description: wsDialog.Description,
                  Color: wsDialog.Color,
                  Icon: wsDialog.Icon,
                });
              }
            }}
          >
            {wsDialog.mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;
