/**
 * ProjectNotificationsCard — v3.0 F-006 (T066).
 * Per-project subscription matrix: list every available Channel, let the
 * user toggle subscription + pick events. Saving creates/updates/deletes
 * subscription rows for this project.
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Card, CardHeader, CardContent, Box, Button, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, Chip, FormGroup, FormControlLabel, Checkbox,
} from '@mui/material';
import { NotificationsActive as NotifIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { NotificationChannelService, type IChannelListItem } from '@/services/notificationChannelService';
import {
  ProjectNotificationSubscriptionService,
  ALL_NOTIFICATION_EVENTS,
  type ISubscriptionListItem,
  type TNotificationEvent,
} from '@/services/projectNotificationSubscriptionService';

interface IProps { projectId: number; }

interface IRowState {
  subscriptionId?: number;
  subscribed: boolean;
  events: Set<TNotificationEvent>;
  dirty: boolean;
}

export const ProjectNotificationsCard: React.FC<IProps> = ({ projectId }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const subsKey = ['project-notif-subs', projectId];
  const channelsKey = ['notification-channels'];

  const { data: channels = [] } = useQuery<IChannelListItem[]>({
    queryKey: channelsKey, queryFn: () => NotificationChannelService.list(),
  });
  const { data: subs = [], isLoading } = useQuery<ISubscriptionListItem[]>({
    queryKey: subsKey, queryFn: () => ProjectNotificationSubscriptionService.list(projectId),
  });

  // Build a per-channel editable state from current subs.
  const [rows, setRows] = useState<Map<number, IRowState>>(new Map());

  // BUG FIX: previously this useEffect rebuilt `rows` from scratch on every
  // refetch (window focus, sibling invalidate, save success), wiping any
  // pending user toggles. Now we only seed on the FIRST load — subsequent
  // refetches that change subs/channels are silently merged WITHOUT
  // touching dirty rows. After saveAllMut succeeds we explicitly reset the
  // seed flag so the new server state becomes the baseline.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) {
      // Merge: for non-dirty rows, take server values; for dirty rows, keep
      // the user's in-progress edits intact.
      setRows((prev) => {
        const next = new Map(prev);
        for (const c of channels) {
          const existing = next.get(c.Id);
          if (existing?.dirty) continue;
          const s = subs.find((x) => x.ChannelId === c.Id);
          next.set(c.Id, {
            subscriptionId: s?.Id,
            subscribed: !!s,
            events: new Set(s?.Events ?? ['DeploymentFailed']),
            dirty: false,
          });
        }
        // Drop rows whose channel disappeared from the server list.
        for (const id of Array.from(next.keys())) {
          if (!channels.find((c) => c.Id === id)) next.delete(id);
        }
        return next;
      });
      return;
    }
    const m = new Map<number, IRowState>();
    for (const c of channels) {
      const s = subs.find((x) => x.ChannelId === c.Id);
      m.set(c.Id, {
        subscriptionId: s?.Id,
        subscribed: !!s,
        events: new Set(s?.Events ?? ['DeploymentFailed']),
        dirty: false,
      });
    }
    setRows(m);
    if (channels.length > 0) seededRef.current = true;
  }, [channels, subs]);

  const dirtyCount = useMemo(() => {
    let n = 0;
    rows.forEach((r) => { if (r.dirty) n += 1; });
    return n;
  }, [rows]);

  const setRow = (channelId: number, patch: Partial<IRowState>) => {
    setRows((prev) => {
      const next = new Map(prev);
      const cur = next.get(channelId);
      if (!cur) return prev;
      next.set(channelId, { ...cur, ...patch, dirty: true });
      return next;
    });
  };

  const toggleEvent = (channelId: number, event: TNotificationEvent) => {
    const cur = rows.get(channelId);
    if (!cur) return;
    const ev = new Set(cur.events);
    if (ev.has(event)) ev.delete(event); else ev.add(event);
    setRow(channelId, { events: ev });
  };

  // Inline validation: detect subscribed rows with zero events BEFORE we
  // hit save. Previously this silently no-op'd in the mutation, so the user
  // saw the Save button do nothing with no feedback.
  const invalidRows = useMemo(() => {
    const bad: string[] = [];
    rows.forEach((r, channelId) => {
      if (r.dirty && r.subscribed && r.events.size === 0) {
        const c = channels.find((x) => x.Id === channelId);
        bad.push(c?.Name ?? `Channel #${channelId}`);
      }
    });
    return bad;
  }, [rows, channels]);

  const saveAllMut = useMutation({
    mutationFn: async () => {
      if (invalidRows.length > 0) {
        throw new Error(
          `Select at least one event for: ${invalidRows.join(', ')}`
        );
      }
      // For each dirty row, decide: create / update / delete.
      const tasks: Promise<unknown>[] = [];
      rows.forEach((r, channelId) => {
        if (!r.dirty) return;
        if (r.subscribed) {
          const eventsArr = Array.from(r.events);
          if (eventsArr.length === 0) return; // already caught above
          if (r.subscriptionId) {
            tasks.push(
              ProjectNotificationSubscriptionService.update(projectId, r.subscriptionId, {
                Events: eventsArr,
                IsActive: true,
              })
            );
          } else {
            tasks.push(
              ProjectNotificationSubscriptionService.create(projectId, {
                ChannelId: channelId,
                Events: eventsArr,
              })
            );
          }
        } else if (r.subscriptionId) {
          tasks.push(ProjectNotificationSubscriptionService.remove(projectId, r.subscriptionId));
        }
      });
      await Promise.all(tasks);
    },
    onSuccess: () => {
      // Reset the seed flag so the next refetch repopulates non-dirty rows
      // from the new server state, then invalidate to trigger that refetch.
      seededRef.current = false;
      void queryClient.invalidateQueries({ queryKey: subsKey });
      showSuccess('Notification subscriptions updated');
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to update notification subscriptions';
      showError(msg);
    },
  });

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        avatar={<NotifIcon color="primary" />}
        title="Notifications"
        subheader="Subscribe this project to delivery channels and choose which events fire each one."
        action={
          <Button
            variant="contained"
            disabled={
              dirtyCount === 0 || saveAllMut.isPending || invalidRows.length > 0
            }
            onClick={() => saveAllMut.mutate()}
          >
            {saveAllMut.isPending ? 'Saving…' : `Save ${dirtyCount > 0 ? `(${dirtyCount} change${dirtyCount > 1 ? 's' : ''})` : ''}`}
          </Button>
        }
      />
      <CardContent>
        {invalidRows.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Select at least one event for: <strong>{invalidRows.join(', ')}</strong>
          </Alert>
        )}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : channels.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No notification channels configured yet — an Admin needs to add a Provider + Channel
            in Settings → Notifications first.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Channel</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Subscribe</TableCell>
                  <TableCell>Events</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {channels.map((c) => {
                  const r = rows.get(c.Id);
                  if (!r) return null;
                  return (
                    <TableRow key={c.Id}>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{c.Name}</TableCell>
                      <TableCell>
                        {c.ProviderName} <Chip size="small" label={c.ProviderType} sx={{ ml: 1 }} />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={r.subscribed}
                          onChange={(e) => setRow(c.Id, { subscribed: e.target.checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <FormGroup row sx={{ opacity: r.subscribed ? 1 : 0.4 }}>
                          {ALL_NOTIFICATION_EVENTS.map((event) => (
                            <FormControlLabel
                              key={event}
                              control={
                                <Checkbox
                                  size="small"
                                  disabled={!r.subscribed}
                                  checked={r.events.has(event)}
                                  onChange={() => toggleEvent(c.Id, event)}
                                />
                              }
                              label={event.replace('Deployment', '')}
                            />
                          ))}
                        </FormGroup>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectNotificationsCard;
