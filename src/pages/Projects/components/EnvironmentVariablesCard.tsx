/**
 * EnvironmentVariablesCard — Deploy Center v3.0 / F-003.
 * Per-project encrypted env-var management. Visible to Admin/Manager only
 * (RBAC enforced by parent page; this component does not gate itself).
 * Secret values arrive as "***" from the server — never plaintext.
 */

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnvVarService } from '@/services/envVarService';
import type { IEnvVarListItem } from '@/services/envVarService';

interface IProps {
  projectId: number;
}

const KEY_PATTERN = /^[A-Z_][A-Z0-9_]{0,99}$/;

interface IDialogState {
  open: boolean;
  mode: 'create' | 'edit';
  editingId?: number;
  KeyName: string;
  Value: string;
  IsSecret: boolean;
}

const emptyDialog: IDialogState = {
  open: false,
  mode: 'create',
  KeyName: '',
  Value: '',
  IsSecret: true,
};

export const EnvironmentVariablesCard: React.FC<IProps> = ({ projectId }) => {
  const queryClient = useQueryClient();
  const queryKey = ['env-vars', projectId];

  const { data: vars = [], isLoading } = useQuery<IEnvVarListItem[]>({
    queryKey,
    queryFn: () => EnvVarService.list(projectId),
  });

  const [dialog, setDialog] = useState<IDialogState>(emptyDialog);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => queryClient.invalidateQueries({ queryKey });

  const createMut = useMutation({
    mutationFn: () =>
      EnvVarService.create(projectId, {
        KeyName: dialog.KeyName,
        Value: dialog.Value,
        IsSecret: dialog.IsSecret,
      }),
    onSuccess: () => {
      setDialog(emptyDialog);
      setError(null);
      refetch();
    },
    onError: (err: { response?: { data?: { Message?: string } } }) =>
      setError(err?.response?.data?.Message ?? 'Failed to create'),
  });

  const updateMut = useMutation({
    mutationFn: () => {
      if (!dialog.editingId) throw new Error('Missing id');
      // Only send changed fields; for Value, send only if user typed something
      // (empty string means "don't rotate the value").
      const payload: { KeyName?: string; Value?: string; IsSecret?: boolean } = {
        KeyName: dialog.KeyName,
        IsSecret: dialog.IsSecret,
      };
      if (dialog.Value.length > 0) payload.Value = dialog.Value;
      return EnvVarService.update(projectId, dialog.editingId, payload);
    },
    onSuccess: () => {
      setDialog(emptyDialog);
      setError(null);
      refetch();
    },
    onError: (err: { response?: { data?: { Message?: string } } }) =>
      setError(err?.response?.data?.Message ?? 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => EnvVarService.remove(projectId, id),
    onSuccess: () => refetch(),
  });

  const openCreate = () => setDialog({ ...emptyDialog, open: true, mode: 'create' });
  const openEdit = (item: IEnvVarListItem) =>
    setDialog({
      open: true,
      mode: 'edit',
      editingId: item.Id,
      KeyName: item.KeyName,
      Value: '',
      IsSecret: item.IsSecret,
    });

  const keyValid = KEY_PATTERN.test(dialog.KeyName);
  const valueRequiredOnCreate = dialog.mode === 'create' && dialog.Value.length === 0;
  const canSave = keyValid && !valueRequiredOnCreate && !createMut.isPending && !updateMut.isPending;

  const onSave = () => {
    if (dialog.mode === 'create') createMut.mutate();
    else updateMut.mutate();
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        avatar={<KeyIcon color="primary" />}
        title="Environment Variables"
        subheader="Encrypted at rest with AES-256-GCM. Secret values injected into deployment env; redacted in logs."
        action={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={openCreate}
          >
            Add Variable
          </Button>
        }
      />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : vars.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No environment variables defined for this project yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vars.map((v) => (
                  <TableRow key={v.Id}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{v.KeyName}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {v.IsSecret ? (
                        <Tooltip title="Hidden — value injected into deployment env only">
                          <span>••••••</span>
                        </Tooltip>
                      ) : (
                        v.Value
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={v.IsSecret ? 'Secret' : 'Plain'}
                        color={v.IsSecret ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(v)} aria-label="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (confirm(`Delete ${v.KeyName}?`)) deleteMut.mutate(v.Id);
                        }}
                        aria-label="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <Dialog open={dialog.open} onClose={() => setDialog(emptyDialog)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialog.mode === 'create' ? 'Add Environment Variable' : 'Edit Environment Variable'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={dialog.KeyName}
            onChange={(e) => setDialog((s) => ({ ...s, KeyName: e.target.value }))}
            error={dialog.KeyName.length > 0 && !keyValid}
            helperText={
              dialog.KeyName.length > 0 && !keyValid
                ? 'Must match /^[A-Z_][A-Z0-9_]{0,99}$/ — uppercase, digits, underscores; start with letter or _'
                : 'POSIX env-var name'
            }
            inputProps={{ style: { fontFamily: 'monospace' } }}
          />
          <TextField
            label={
              dialog.mode === 'edit'
                ? 'New Value (leave empty to keep current)'
                : 'Value'
            }
            fullWidth
            margin="normal"
            type={dialog.IsSecret ? 'password' : 'text'}
            value={dialog.Value}
            onChange={(e) => setDialog((s) => ({ ...s, Value: e.target.value }))}
            multiline={!dialog.IsSecret}
            minRows={!dialog.IsSecret ? 2 : 1}
            inputProps={{ maxLength: 8192, style: { fontFamily: 'monospace' } }}
            error={valueRequiredOnCreate}
            helperText={valueRequiredOnCreate ? 'Required on create' : `${dialog.Value.length}/8192`}
          />
          <FormControlLabel
            control={
              <Switch
                checked={dialog.IsSecret}
                onChange={(e) => setDialog((s) => ({ ...s, IsSecret: e.target.checked }))}
              />
            }
            label="Secret (redacted in logs)"
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(emptyDialog)}>Cancel</Button>
          <Button onClick={onSave} variant="contained" disabled={!canSave}>
            {dialog.mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EnvironmentVariablesCard;
