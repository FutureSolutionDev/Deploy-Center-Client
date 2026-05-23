/**
 * NotificationProvidersTab — v3.0 F-006 (T064).
 * Admin-only management of central credential rows. Config values arrive
 * as "***" from the server; rotating creds = replace via Update.
 */

import React, { useState } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, Typography, CircularProgress, Switch, FormControlLabel, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Send as TestIcon, Webhook as WebhookIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  NotificationProviderService,
  type IProviderListItem,
  type TProviderType,
  type IProviderConfigInput,
} from '@/services/notificationProviderService';
import SmtpPresetPicker, { SMTP_PRESETS, type TSmtpPreset } from './SmtpPresetPicker';

const TYPES: TProviderType[] = ['discord', 'slack', 'email'];

interface IDialogState {
  open: boolean;
  mode: 'create' | 'edit';
  editingId?: number;
  Name: string;
  Type: TProviderType;
  IsActive: boolean;
  // discord
  webhookRoot: string;
  // slack
  webhookUrl: string;
  botToken: string;
  // email
  emailPreset: TSmtpPreset;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

const emptyDialog: IDialogState = {
  open: false,
  mode: 'create',
  Name: '',
  Type: 'discord',
  IsActive: true,
  webhookRoot: '',
  webhookUrl: '',
  botToken: '',
  emailPreset: 'gmail',
  host: SMTP_PRESETS.gmail.host,
  port: SMTP_PRESETS.gmail.port,
  secure: SMTP_PRESETS.gmail.secure,
  user: '',
  password: '',
  from: '',
};

export const NotificationProvidersTab: React.FC<{ t: (key: string) => string }> = () => {
  const queryClient = useQueryClient();
  const queryKey = ['notification-providers'];

  const { data: providers = [], isLoading } = useQuery<IProviderListItem[]>({
    queryKey,
    queryFn: () => NotificationProviderService.list(),
  });

  const [dialog, setDialog] = useState<IDialogState>(emptyDialog);
  const [error, setError] = useState<string | null>(null);
  const refetch = () => queryClient.invalidateQueries({ queryKey });

  const buildConfig = (): IProviderConfigInput => {
    if (dialog.Type === 'discord') return { webhookRoot: dialog.webhookRoot };
    if (dialog.Type === 'slack')   return { webhookUrl: dialog.webhookUrl || undefined, botToken: dialog.botToken || undefined };
    return {
      host: dialog.host, port: dialog.port, secure: dialog.secure,
      user: dialog.user, password: dialog.password, from: dialog.from,
      presetName: dialog.emailPreset,
    };
  };

  const createMut = useMutation({
    mutationFn: () => NotificationProviderService.create({
      Name: dialog.Name, Type: dialog.Type, Config: buildConfig(),
    }),
    onSuccess: () => { setDialog(emptyDialog); setError(null); refetch(); },
    onError: (err: { response?: { data?: { Message?: string } } }) =>
      setError(err?.response?.data?.Message ?? 'Failed to create'),
  });

  const updateMut = useMutation({
    mutationFn: () => {
      if (!dialog.editingId) throw new Error('Missing id');
      const payload: { Name?: string; Config?: IProviderConfigInput; IsActive?: boolean } = {
        Name: dialog.Name,
        IsActive: dialog.IsActive,
      };
      // Only send Config if any cred field is non-empty (rotation).
      const needsRotate =
        (dialog.Type === 'discord' && dialog.webhookRoot.length > 0) ||
        (dialog.Type === 'slack' && (dialog.webhookUrl.length > 0 || dialog.botToken.length > 0)) ||
        (dialog.Type === 'email' && dialog.password.length > 0);
      if (needsRotate) payload.Config = buildConfig();
      return NotificationProviderService.update(dialog.editingId, payload);
    },
    onSuccess: () => { setDialog(emptyDialog); setError(null); refetch(); },
    onError: (err: { response?: { data?: { Message?: string } } }) =>
      setError(err?.response?.data?.Message ?? 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => NotificationProviderService.remove(id),
    onSuccess: () => refetch(),
  });

  const testMut = useMutation({
    mutationFn: (id: number) => NotificationProviderService.test(id),
  });

  const openCreate = () => setDialog({ ...emptyDialog, open: true, mode: 'create' });
  const openEdit = (p: IProviderListItem) => setDialog({
    ...emptyDialog, open: true, mode: 'edit',
    editingId: p.Id, Name: p.Name, Type: p.Type, IsActive: p.IsActive,
  });

  const onEmailPresetApply = (preset: TSmtpPreset, spec: typeof SMTP_PRESETS.gmail | null) => {
    setDialog((s) => ({
      ...s,
      emailPreset: preset,
      host: spec?.host ?? s.host,
      port: spec?.port ?? s.port,
      secure: spec?.secure ?? s.secure,
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <WebhookIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Notification Providers
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
          Add Provider
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Central credential rows (Slack workspaces, Discord webhook roots, SMTP servers).
        Rotating credentials updates every channel under this provider at once.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
      ) : providers.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No providers configured. Add one to start sending notifications.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Channels</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((p) => (
                <TableRow key={p.Id}>
                  <TableCell>{p.Name}</TableCell>
                  <TableCell><Chip size="small" label={p.Type} /></TableCell>
                  <TableCell>{p.ChannelCount ?? 0}</TableCell>
                  <TableCell>
                    <Chip size="small" color={p.IsActive ? 'success' : 'default'} label={p.IsActive ? 'Active' : 'Disabled'} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Send test through first channel">
                      <span>
                        <IconButton size="small" disabled={(p.ChannelCount ?? 0) === 0} onClick={() => testMut.mutate(p.Id)}>
                          <TestIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (confirm(`Delete provider '${p.Name}'? ALL its channels and subscriptions will cascade-delete.`)) {
                          deleteMut.mutate(p.Id);
                        }
                      }}
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

      <Dialog open={dialog.open} onClose={() => setDialog(emptyDialog)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.mode === 'create' ? 'Add Provider' : `Edit ${dialog.Name}`}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name" fullWidth margin="normal"
            value={dialog.Name}
            onChange={(e) => setDialog((s) => ({ ...s, Name: e.target.value }))}
          />
          <TextField
            select label="Type" fullWidth margin="normal"
            value={dialog.Type}
            disabled={dialog.mode === 'edit'}
            onChange={(e) => setDialog((s) => ({ ...s, Type: e.target.value as TProviderType }))}
          >
            {TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          {dialog.Type === 'discord' && (
            <TextField
              label={dialog.mode === 'edit' ? 'New webhook root (leave empty to keep)' : 'Webhook root URL'}
              fullWidth margin="normal"
              placeholder="https://discord.com/api/webhooks/<id>/<token>"
              value={dialog.webhookRoot}
              onChange={(e) => setDialog((s) => ({ ...s, webhookRoot: e.target.value }))}
            />
          )}

          {dialog.Type === 'slack' && (
            <>
              <TextField
                label={dialog.mode === 'edit' ? 'New webhook URL (leave empty to keep)' : 'Slack incoming webhook URL'}
                fullWidth margin="normal"
                placeholder="https://hooks.slack.com/services/..."
                value={dialog.webhookUrl}
                onChange={(e) => setDialog((s) => ({ ...s, webhookUrl: e.target.value }))}
              />
              <TextField
                label="Bot token (optional, future use)"
                fullWidth margin="normal" type="password"
                value={dialog.botToken}
                onChange={(e) => setDialog((s) => ({ ...s, botToken: e.target.value }))}
              />
            </>
          )}

          {dialog.Type === 'email' && (
            <>
              <SmtpPresetPicker value={dialog.emailPreset} onApply={onEmailPresetApply} />
              <TextField label="Host" fullWidth margin="normal" value={dialog.host}
                onChange={(e) => setDialog((s) => ({ ...s, host: e.target.value }))} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Port" type="number" margin="normal" sx={{ width: 120 }}
                  value={dialog.port}
                  onChange={(e) => setDialog((s) => ({ ...s, port: Number(e.target.value) }))} />
                <FormControlLabel
                  sx={{ mt: 2 }}
                  control={<Switch checked={dialog.secure}
                    onChange={(e) => setDialog((s) => ({ ...s, secure: e.target.checked }))} />}
                  label="Secure (TLS)"
                />
              </Box>
              <TextField label="User" fullWidth margin="normal" value={dialog.user}
                onChange={(e) => setDialog((s) => ({ ...s, user: e.target.value }))} />
              <TextField
                label={dialog.mode === 'edit' ? 'New password (leave empty to keep)' : 'Password'}
                fullWidth margin="normal" type="password" value={dialog.password}
                onChange={(e) => setDialog((s) => ({ ...s, password: e.target.value }))} />
              <TextField label="From" fullWidth margin="normal" placeholder="Deploy Center <noreply@…>"
                value={dialog.from} onChange={(e) => setDialog((s) => ({ ...s, from: e.target.value }))} />
            </>
          )}

          {dialog.mode === 'edit' && (
            <FormControlLabel
              sx={{ mt: 2 }}
              control={<Switch checked={dialog.IsActive}
                onChange={(e) => setDialog((s) => ({ ...s, IsActive: e.target.checked }))} />}
              label="Active"
            />
          )}

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

export default NotificationProvidersTab;
