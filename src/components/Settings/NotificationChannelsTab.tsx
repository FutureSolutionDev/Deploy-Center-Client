/**
 * NotificationChannelsTab — v3.0 F-006 (T065).
 * Admin/Manager management of delivery targets under a Provider.
 */

import React, { useMemo, useState } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, Typography, CircularProgress, FormControlLabel, Switch, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Send as TestIcon, Forum as ChannelIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  NotificationChannelService,
  type IChannelListItem,
  type IDeliveryConfigInput,
} from '@/services/notificationChannelService';
import { NotificationProviderService, type IProviderListItem } from '@/services/notificationProviderService';

interface IDialogState {
  open: boolean;
  mode: 'create' | 'edit';
  editingId?: number;
  ProviderId: number | '';
  Name: string;
  IsActive: boolean;
  // delivery-config fields per type
  discordSuffix: string;
  discordOverride: string;
  slackChannel: string;
  emailRecipients: string;
}

const emptyDialog: IDialogState = {
  open: false, mode: 'create',
  ProviderId: '', Name: '', IsActive: true,
  discordSuffix: '', discordOverride: '',
  slackChannel: '',
  emailRecipients: '',
};

export const NotificationChannelsTab: React.FC<{ t: (key: string) => string }> = () => {
  const queryClient = useQueryClient();
  const channelsKey = ['notification-channels'];
  const providersKey = ['notification-providers'];

  const { data: channels = [], isLoading: chLoading } = useQuery<IChannelListItem[]>({
    queryKey: channelsKey, queryFn: () => NotificationChannelService.list(),
  });
  const { data: providers = [] } = useQuery<IProviderListItem[]>({
    queryKey: providersKey, queryFn: () => NotificationProviderService.list(),
  });

  const providerById = useMemo(
    () => new Map(providers.map((p) => [p.Id, p])),
    [providers]
  );

  const [dialog, setDialog] = useState<IDialogState>(emptyDialog);
  const [error, setError] = useState<string | null>(null);
  const refetch = () => queryClient.invalidateQueries({ queryKey: channelsKey });

  const selectedProvider = dialog.ProviderId === '' ? undefined : providerById.get(dialog.ProviderId);

  const buildDelivery = (): IDeliveryConfigInput | null => {
    if (!selectedProvider) return null;
    if (selectedProvider.Type === 'discord') {
      return dialog.discordOverride
        ? { overrideWebhook: dialog.discordOverride }
        : { webhookSuffix: dialog.discordSuffix };
    }
    if (selectedProvider.Type === 'slack') {
      return { channel: dialog.slackChannel };
    }
    return {
      recipients: dialog.emailRecipients.split(',').map((s) => s.trim()).filter(Boolean),
    };
  };

  const createMut = useMutation({
    mutationFn: () => {
      if (dialog.ProviderId === '') throw new Error('Provider required');
      const delivery = buildDelivery();
      if (!delivery) throw new Error('Delivery config invalid');
      return NotificationChannelService.create({
        ProviderId: dialog.ProviderId, Name: dialog.Name, DeliveryConfig: delivery,
      });
    },
    onSuccess: () => { setDialog(emptyDialog); setError(null); refetch(); },
    onError: (err: { response?: { data?: { Message?: string } }; message?: string }) =>
      setError(err?.response?.data?.Message ?? err?.message ?? 'Failed to create'),
  });

  const updateMut = useMutation({
    mutationFn: () => {
      if (!dialog.editingId) throw new Error('Missing id');
      const payload: { Name?: string; DeliveryConfig?: IDeliveryConfigInput; IsActive?: boolean } = {
        Name: dialog.Name, IsActive: dialog.IsActive,
      };
      const delivery = buildDelivery();
      // Only rotate delivery config if user typed something
      const hasInput =
        selectedProvider?.Type === 'discord' ? (dialog.discordSuffix.length > 0 || dialog.discordOverride.length > 0)
        : selectedProvider?.Type === 'slack' ? (dialog.slackChannel.length > 0)
        : (dialog.emailRecipients.length > 0);
      if (delivery && hasInput) payload.DeliveryConfig = delivery;
      return NotificationChannelService.update(dialog.editingId, payload);
    },
    onSuccess: () => { setDialog(emptyDialog); setError(null); refetch(); },
    onError: (err: { response?: { data?: { Message?: string } } }) =>
      setError(err?.response?.data?.Message ?? 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => NotificationChannelService.remove(id),
    onSuccess: () => refetch(),
  });

  const testMut = useMutation({ mutationFn: (id: number) => NotificationChannelService.test(id) });

  const openCreate = () => setDialog({ ...emptyDialog, open: true, mode: 'create' });
  const openEdit = (c: IChannelListItem) => setDialog({
    ...emptyDialog, open: true, mode: 'edit',
    editingId: c.Id, ProviderId: c.ProviderId, Name: c.Name, IsActive: c.IsActive,
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <ChannelIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Notification Channels
        </Typography>
        <Button
          startIcon={<AddIcon />} variant="contained" onClick={openCreate}
          disabled={providers.length === 0}
        >
          Add Channel
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Delivery targets under a Provider. e.g. multiple Slack rooms inside one Slack workspace,
        or multiple email recipient lists under one SMTP host.
      </Typography>
      {providers.length === 0 && (
        <Typography color="warning.main" sx={{ mb: 2 }}>
          Create a Provider first (Notification Providers tab).
        </Typography>
      )}

      {chLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
      ) : channels.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No channels configured yet.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Channel Name</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {channels.map((c) => (
                <TableRow key={c.Id}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{c.Name}</TableCell>
                  <TableCell>{c.ProviderName}</TableCell>
                  <TableCell><Chip size="small" label={c.ProviderType} /></TableCell>
                  <TableCell>
                    <Chip size="small" color={c.IsActive ? 'success' : 'default'} label={c.IsActive ? 'Active' : 'Disabled'} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Send a test message">
                      <IconButton size="small" onClick={() => testMut.mutate(c.Id)}>
                        <TestIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton
                      size="small" color="error"
                      onClick={() => {
                        if (confirm(`Delete channel '${c.Name}'? All project subscriptions to it will cascade-delete.`)) {
                          deleteMut.mutate(c.Id);
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
        <DialogTitle>{dialog.mode === 'create' ? 'Add Channel' : `Edit ${dialog.Name}`}</DialogTitle>
        <DialogContent>
          <TextField
            select label="Provider" fullWidth margin="normal"
            value={dialog.ProviderId === '' ? '' : String(dialog.ProviderId)}
            disabled={dialog.mode === 'edit'}
            onChange={(e) => setDialog((s) => ({ ...s, ProviderId: Number(e.target.value) }))}
          >
            {providers.map((p) => (
              <MenuItem key={p.Id} value={String(p.Id)}>
                {p.Name} ({p.Type})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Channel name" fullWidth margin="normal"
            placeholder={selectedProvider?.Type === 'slack' ? '#deploys' : selectedProvider?.Type === 'email' ? 'ops-list' : 'deployments'}
            value={dialog.Name}
            onChange={(e) => setDialog((s) => ({ ...s, Name: e.target.value }))}
          />

          {selectedProvider?.Type === 'discord' && (
            <>
              <TextField
                label={dialog.mode === 'edit' ? 'New webhook suffix (leave empty to keep)' : 'Webhook suffix (id/token)'}
                fullWidth margin="normal"
                placeholder="<id>/<token>"
                value={dialog.discordSuffix}
                onChange={(e) => setDialog((s) => ({ ...s, discordSuffix: e.target.value }))}
              />
              <TextField
                label="OR full override URL"
                fullWidth margin="normal"
                value={dialog.discordOverride}
                onChange={(e) => setDialog((s) => ({ ...s, discordOverride: e.target.value }))}
              />
            </>
          )}

          {selectedProvider?.Type === 'slack' && (
            <TextField
              label={dialog.mode === 'edit' ? 'New channel name (leave empty to keep)' : 'Slack channel'}
              fullWidth margin="normal"
              placeholder="#deploys"
              value={dialog.slackChannel}
              onChange={(e) => setDialog((s) => ({ ...s, slackChannel: e.target.value }))}
            />
          )}

          {selectedProvider?.Type === 'email' && (
            <TextField
              label={dialog.mode === 'edit' ? 'New recipients (comma-separated, leave empty to keep)' : 'Recipients (comma-separated)'}
              fullWidth multiline minRows={2} margin="normal"
              placeholder="ops@team.com, sre@team.com"
              value={dialog.emailRecipients}
              onChange={(e) => setDialog((s) => ({ ...s, emailRecipients: e.target.value }))}
            />
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
            disabled={
              dialog.ProviderId === '' || dialog.Name.length === 0 ||
              createMut.isPending || updateMut.isPending
            }
            onClick={() => (dialog.mode === 'create' ? createMut.mutate() : updateMut.mutate())}
          >
            {dialog.mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationChannelsTab;
