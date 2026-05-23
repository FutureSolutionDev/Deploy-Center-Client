/**
 * WorkspacesPage — Deploy Center v3.0 / F-009 (T090 + T091 combined page).
 *
 * Left side: sidebar list (workspaces + "Unassigned" group with project counts).
 * Right side: edit form for the selected workspace OR project assignment grid.
 *
 * Routing:
 *   /workspaces                 — show full list, no selection
 *   /workspaces?ws=12           — select workspace 12 (focus its details + project list)
 *   /workspaces?ws=unassigned   — focus the Unassigned group
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, CardHeader, Typography, Button, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Chip, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress, MenuItem, Stack, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, FolderOpen as UnassignedIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  WorkspaceService,
  type IWorkspaceListItem,
} from '@/services/workspaceService';
import { ProjectsService } from '@/services/projectsService';
import {
  WORKSPACE_ICON_COMPONENTS,
  DEFAULT_WORKSPACE_ICON,
  type TWorkspaceIcon,
} from '@/types/workspaceIcons';
import { WorkspaceIconPicker } from './components/WorkspaceIconPicker';
import { useRole } from '@/contexts/RoleContext';

interface IDialogState {
  open: boolean;
  mode: 'create' | 'edit';
  editingId?: number;
  Name: string;
  Description: string;
  Color: string;
  Icon: TWorkspaceIcon;
}

const emptyDialog: IDialogState = {
  open: false, mode: 'create',
  Name: '', Description: '', Color: '#1976d2', Icon: DEFAULT_WORKSPACE_ICON,
};

const PRESET_COLORS = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c62828', '#0097a7', '#5d4037', '#455a64'];

export const WorkspacesPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { role } = useRole();
  const queryClient = useQueryClient();
  const queryKey = ['workspaces'];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => WorkspaceService.list(),
  });
  const workspaces = data?.Items ?? [];
  const unassignedCount = data?.UnassignedProjectCount ?? 0;

  const selectedParam = params.get('ws');
  const selectedIsUnassigned = selectedParam === 'unassigned';
  const selectedId = selectedParam && !selectedIsUnassigned ? Number(selectedParam) : null;
  const selected = workspaces.find((w) => w.Id === selectedId) ?? null;

  const [dialog, setDialog] = useState<IDialogState>(emptyDialog);
  const [error, setError] = useState<string | null>(null);

  // Projects (for the right-pane assign grid)
  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects-for-workspaces'],
    queryFn: () => ProjectsService.getAll(false),
  });
  const projectsForSelected = useMemo(() => {
    if (selectedIsUnassigned) return allProjects.filter((p) => !p.WorkspaceId);
    if (selectedId !== null) return allProjects.filter((p) => p.WorkspaceId === selectedId);
    return [];
  }, [allProjects, selectedId, selectedIsUnassigned]);

  // Mutations
  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({ queryKey: ['projects-for-workspaces'] });
  };
  const createMut = useMutation({
    mutationFn: () =>
      WorkspaceService.create({
        Name: dialog.Name, Description: dialog.Description || null,
        Color: dialog.Color, Icon: dialog.Icon,
      }),
    onSuccess: () => { setDialog(emptyDialog); setError(null); refetch(); },
    onError: (e: { response?: { data?: { Message?: string } } }) =>
      setError(e?.response?.data?.Message ?? 'Failed to create'),
  });
  const updateMut = useMutation({
    mutationFn: () => {
      if (!dialog.editingId) throw new Error('Missing id');
      return WorkspaceService.update(dialog.editingId, {
        Name: dialog.Name, Description: dialog.Description || null,
        Color: dialog.Color, Icon: dialog.Icon,
      });
    },
    onSuccess: () => { setDialog(emptyDialog); setError(null); refetch(); },
    onError: (e: { response?: { data?: { Message?: string } } }) =>
      setError(e?.response?.data?.Message ?? 'Failed to update'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => WorkspaceService.remove(id),
    onSuccess: () => {
      setParams({}); // clear selection — workspace gone
      refetch();
    },
  });
  const assignMut = useMutation({
    mutationFn: ({ projectId, workspaceId }: { projectId: number; workspaceId: number | null }) =>
      WorkspaceService.assignProject(projectId, workspaceId),
    onSuccess: () => refetch(),
  });

  // When data changes, ensure the selected ws still exists; otherwise clear
  useEffect(() => {
    if (selectedId !== null && !workspaces.find((w) => w.Id === selectedId)) {
      setParams({});
    }
  }, [workspaces, selectedId, setParams]);

  const openCreate = () => setDialog({ ...emptyDialog, open: true, mode: 'create' });
  const openEdit = (w: IWorkspaceListItem) => setDialog({
    open: true, mode: 'edit', editingId: w.Id,
    Name: w.Name, Description: w.Description ?? '',
    Color: w.Color, Icon: w.Icon,
  });

  const canEdit = (w: IWorkspaceListItem): boolean =>
    !!w.CreatedBy && role === 'admin';
  // Owner check needs the current userId; using role-only as proxy — backend rejects others with 403.

  const sidebar = (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Workspaces"
        action={
          <Button startIcon={<AddIcon />} size="small" onClick={openCreate} variant="contained">
            New
          </Button>
        }
      />
      <Divider />
      {isLoading ? (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : (
        <List dense>
          {workspaces.map((w) => {
            const Icon = WORKSPACE_ICON_COMPONENTS[w.Icon];
            return (
              <ListItemButton
                key={w.Id}
                selected={selectedId === w.Id}
                onClick={() => setParams({ ws: String(w.Id) })}
              >
                <ListItemIcon>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: 1, bgcolor: w.Color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon sx={{ color: 'white', fontSize: 18 }} />
                  </Box>
                </ListItemIcon>
                <ListItemText primary={w.Name} />
                <Chip size="small" label={w.ProjectCount} />
              </ListItemButton>
            );
          })}
          <ListItemButton
            selected={selectedIsUnassigned}
            onClick={() => setParams({ ws: 'unassigned' })}
            sx={{ borderTop: 1, borderColor: 'divider', mt: 1 }}
          >
            <ListItemIcon><UnassignedIcon color="action" /></ListItemIcon>
            <ListItemText primary="Unassigned" secondary="projects with no workspace" />
            <Chip size="small" label={unassignedCount} />
          </ListItemButton>
        </List>
      )}
    </Card>
  );

  const detailPane = (() => {
    if (selected) {
      const Icon = WORKSPACE_ICON_COMPONENTS[selected.Icon];
      return (
        <Card>
          <CardHeader
            avatar={
              <Box sx={{
                width: 40, height: 40, borderRadius: 1, bgcolor: selected.Color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon sx={{ color: 'white' }} />
              </Box>
            }
            title={selected.Name}
            subheader={selected.Description ?? 'No description'}
            action={
              <Stack direction="row" spacing={1}>
                {canEdit(selected) && (
                  <>
                    <Tooltip title="Edit workspace">
                      <IconButton onClick={() => openEdit(selected)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete (projects move to Unassigned)">
                      <IconButton
                        color="error"
                        onClick={() => {
                          if (confirm(`Delete '${selected.Name}'? Its ${selected.ProjectCount} project(s) will move to Unassigned.`)) {
                            deleteMut.mutate(selected.Id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Stack>
            }
          />
          <Divider />
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Projects in this workspace ({projectsForSelected.length})
            </Typography>
            {projectsForSelected.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No projects here yet. Use the dropdown below to assign one.
              </Typography>
            ) : (
              <List dense>
                {projectsForSelected.map((p) => (
                  <ListItemButton
                    key={p.Id}
                    onClick={() => navigate(`/projects/${p.Id}`)}
                  >
                    <ListItemText primary={p.Name} secondary={p.RepoUrl} />
                    <TextField
                      select size="small"
                      value={String(p.WorkspaceId ?? '')}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        const ws = e.target.value === '' ? null : Number(e.target.value);
                        assignMut.mutate({ projectId: p.Id, workspaceId: ws });
                      }}
                      sx={{ minWidth: 180 }}
                    >
                      <MenuItem value=""><em>Unassigned</em></MenuItem>
                      {workspaces.map((w) => (
                        <MenuItem key={w.Id} value={String(w.Id)}>{w.Name}</MenuItem>
                      ))}
                    </TextField>
                  </ListItemButton>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      );
    }
    if (selectedIsUnassigned) {
      return (
        <Card>
          <CardHeader
            avatar={<UnassignedIcon color="action" />}
            title="Unassigned"
            subheader="Projects with no workspace assigned. Pick one to organize them."
          />
          <Divider />
          <CardContent>
            {projectsForSelected.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                All projects are assigned to a workspace.
              </Typography>
            ) : (
              <List dense>
                {projectsForSelected.map((p) => (
                  <ListItemButton key={p.Id} onClick={() => navigate(`/projects/${p.Id}`)}>
                    <ListItemText primary={p.Name} secondary={p.RepoUrl} />
                    <TextField
                      select size="small"
                      value=""
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        const ws = e.target.value === '' ? null : Number(e.target.value);
                        assignMut.mutate({ projectId: p.Id, workspaceId: ws });
                      }}
                      sx={{ minWidth: 180 }}
                    >
                      <MenuItem value=""><em>— pick a workspace —</em></MenuItem>
                      {workspaces.map((w) => (
                        <MenuItem key={w.Id} value={String(w.Id)}>{w.Name}</MenuItem>
                      ))}
                    </TextField>
                  </ListItemButton>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Pick a workspace from the left
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Or click <strong>New</strong> to create one.
          </Typography>
          {workspaces.length === 0 && (
            <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
              Create your first workspace
            </Button>
          )}
        </CardContent>
      </Card>
    );
  })();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Workspaces</Typography>
        <Typography variant="body2" color="text.secondary">
          Group your projects visually. Workspaces are optional — projects without one show under "Unassigned".
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 3 }}>
        {sidebar}
        {detailPane}
      </Box>

      <Dialog open={dialog.open} onClose={() => setDialog(emptyDialog)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialog.mode === 'create' ? 'New Workspace' : `Edit ${dialog.Name}`}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name" fullWidth margin="normal"
            value={dialog.Name}
            onChange={(e) => setDialog((s) => ({ ...s, Name: e.target.value }))}
          />
          <TextField
            label="Description (optional)" fullWidth margin="normal" multiline minRows={2}
            value={dialog.Description}
            onChange={(e) => setDialog((s) => ({ ...s, Description: e.target.value }))}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setDialog((s) => ({ ...s, Color: c }))}
                  sx={{
                    width: 32, height: 32, borderRadius: 1, bgcolor: c, cursor: 'pointer',
                    border: dialog.Color === c ? '3px solid #000' : '3px solid transparent',
                  }}
                />
              ))}
              <TextField
                size="small" sx={{ width: 110 }}
                value={dialog.Color}
                onChange={(e) => setDialog((s) => ({ ...s, Color: e.target.value }))}
                placeholder="#RRGGBB"
              />
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <WorkspaceIconPicker
              value={dialog.Icon}
              onChange={(next) => setDialog((s) => ({ ...s, Icon: next }))}
              color={dialog.Color}
            />
          </Box>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(emptyDialog)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={dialog.Name.length === 0 || createMut.isPending || updateMut.isPending}
            onClick={() => (dialog.mode === 'create' ? createMut.mutate() : updateMut.mutate())}
          >
            {dialog.mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkspacesPage;
