import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  IconButton,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useUpdateProject } from '@/hooks/useProjects';
import { useToast } from '@/contexts/ToastContext';
import type { IProject } from '@/types';

interface IVariablesManagerProps {
  project: IProject;
  onUpdate: () => void;
}

export const VariablesManager: React.FC<IVariablesManagerProps> = ({ project, onUpdate }) => {
  const { showSuccess, showError } = useToast();
  const updateProject = useUpdateProject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [localVariables, setLocalVariables] = useState<Record<string, string>>(
    project.Config?.Variables || {}
  );

  const handleAddVariable = () => {
    if (!newKey.trim()) {
      showError('Variable name is required');
      return;
    }

    setLocalVariables((prev) => ({
      ...prev,
      [newKey.trim()]: newValue,
    }));

    setNewKey('');
    setNewValue('');
    setDialogOpen(false);
  };

  const handleDeleteVariable = (key: string) => {
    setLocalVariables((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleEditVariable = (key: string) => {
    setEditingKey(key);
    setNewKey(key);
    setNewValue(localVariables[key]);
    setDialogOpen(true);
  };

  const handleUpdateVariable = () => {
    if (!newKey.trim()) {
      showError('Variable name is required');
      return;
    }

    setLocalVariables((prev) => {
      const updated = { ...prev };

      // If key changed, delete old key
      if (editingKey && editingKey !== newKey.trim()) {
        delete updated[editingKey];
      }

      updated[newKey.trim()] = newValue;
      return updated;
    });

    setNewKey('');
    setNewValue('');
    setEditingKey(null);
    setDialogOpen(false);
  };

  const handleSave = async () => {
    try {
      await updateProject.mutateAsync({
        id: project.Id,
        data: {
          Config: {
            ...project.Config,
            Variables: localVariables,
          },
        },
      });

      showSuccess('Variables updated successfully');
      setEditMode(false);
      onUpdate();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Failed to update variables';
      showError(errorMessage);
    }
  };

  const handleCancel = () => {
    setLocalVariables(project.Config?.Variables || {});
    setEditMode(false);
  };

  const handleOpenDialog = () => {
    setEditingKey(null);
    setNewKey('');
    setNewValue('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingKey(null);
    setNewKey('');
    setNewValue('');
  };

  const variableEntries = Object.entries(localVariables);

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Environment Variables
            </Typography>
          </Box>

          {!editMode ? (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={updateProject.isPending}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={updateProject.isPending}
              >
                {updateProject.isPending ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {variableEntries.length === 0 ? (
          <Alert severity="info">
            No environment variables defined. Click "Edit" to add variables that will be available during deployment.
          </Alert>
        ) : (
          <Grid container spacing={1}>
            {variableEntries.map(([key, value]) => (
              <Grid size={{ xs: 12 }} key={key}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: editMode ? 'action.hover' : 'background.paper',
                  }}
                >
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: 'primary.main',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {value || <em style={{ color: '#999' }}>(empty)</em>}
                    </Typography>
                  </Box>

                  {editMode && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditVariable(key)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteVariable(key)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {editMode && (
          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Variable
            </Button>
          </Box>
        )}
      </CardContent>

      {/* Add/Edit Variable Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingKey ? 'Edit Variable' : 'Add New Variable'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Variable Name"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="e.g., NODE_ENV, API_URL, DATABASE_HOST"
              helperText="Use uppercase with underscores for environment variables"
            />
            <TextField
              fullWidth
              label="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Variable value"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={editingKey ? handleUpdateVariable : handleAddVariable}
            disabled={!newKey.trim()}
          >
            {editingKey ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
