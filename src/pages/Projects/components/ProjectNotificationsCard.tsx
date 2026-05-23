/**
 * ProjectNotificationsCard — v3.0 F-006 (T066).
 * Per-project subscription matrix: list every available Channel, let the
 * user toggle subscription + pick events. Saving creates/updates/deletes
 * subscription rows for this project.
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  Card, CardHeader, CardContent, Box, Button, Typography, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, Chip, FormGroup, FormControlLabel, Checkbox,
} from '@mui/material';
import { NotificationsActive as NotifIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  useEffect(() => {
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

  const saveAllMut = useMutation({
    mutationFn: async () => {
      // For each dirty row, decide: create / update / delete.
      const tasks: Promise<unknown>[] = [];
      rows.forEach((r, channelId) => {
        if (!r.dirty) return;
        if (r.subscribed) {
          const eventsArr = Array.from(r.events);
          if (eventsArr.length === 0) return; // skip — server would 400
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subsKey }),
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
            disabled={dirtyCount === 0 || saveAllMut.isPending}
            onClick={() => saveAllMut.mutate()}
          >
            {saveAllMut.isPending ? 'Saving…' : `Save ${dirtyCount > 0 ? `(${dirtyCount} change${dirtyCount > 1 ? 's' : ''})` : ''}`}
          </Button>
        }
      />
      <CardContent>
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
