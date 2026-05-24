/**
 * Step4NotificationSubscriptions — Deploy Center v3.0 / F-006.
 *
 * Replaces the legacy Step4Notifications (which wrote credentials into
 * Project.Config.Notifications JSON). This step uses the v3.0 model:
 *   Provider → Channel → Subscription
 * Credentials live on the Channel (centrally managed in Settings →
 * Notifications); this step only lets the user subscribe THIS project
 * to those channels and pick which events fire each one.
 *
 * Controlled-component contract:
 *   - `value` is the full desired subscription state, keyed by channelId.
 *   - `onChange(next)` fires on every toggle/edit.
 *   - The parent (ProjectFormModal) reconciles `value` against the actual
 *     server state in its handleSubmit: create new, update changed,
 *     delete unsubscribed. In CREATE mode, the parent defers reconciliation
 *     until after createProject resolves with the new project id.
 *
 * If `projectId` is provided, we load existing subscriptions and seed
 * `value` once on mount. Otherwise (CREATE), we start with an empty value.
 */

import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  NotificationChannelService,
  type IChannelListItem,
} from '@/services/notificationChannelService';
import {
  ProjectNotificationSubscriptionService,
  ALL_NOTIFICATION_EVENTS,
  type ISubscriptionListItem,
  type TNotificationEvent,
} from '@/services/projectNotificationSubscriptionService';

/** One row of desired-state: which channel + which events. */
export interface ISubscriptionSelection {
  ChannelId: number;
  Events: TNotificationEvent[];
}

interface IProps {
  /** Existing project id when editing; null/undefined during create. */
  projectId?: number | null;
  /** Full desired-state subscription set (controlled). */
  value: ISubscriptionSelection[];
  /** Fired on every change to value. */
  onChange: (next: ISubscriptionSelection[]) => void;
  /**
   * Whether this component should seed `value` from the server on first
   * load (edit mode only). Once seeded the prop is ignored; the parent
   * owns subsequent state via `value`.
   */
  seedFromServer?: boolean;
}

const DEFAULT_EVENTS: TNotificationEvent[] = ['DeploymentFailed'];

export const Step4NotificationSubscriptions: React.FC<IProps> = ({
  projectId,
  value,
  onChange,
  seedFromServer = true,
}) => {
  const isEdit = !!projectId;

  const { data: channels = [], isLoading: channelsLoading } = useQuery<IChannelListItem[]>({
    queryKey: ['notification-channels'],
    queryFn: () => NotificationChannelService.list(),
  });

  const { data: existingSubs = [], isLoading: subsLoading } = useQuery<ISubscriptionListItem[]>({
    queryKey: ['project-notif-subs', projectId],
    queryFn: () => ProjectNotificationSubscriptionService.list(projectId!),
    enabled: isEdit,
  });

  // One-shot seed from server (edit mode only). After the first successful
  // load we leave the parent in charge.
  const seededRef = React.useRef(false);
  useEffect(() => {
    if (!isEdit || !seedFromServer) return;
    if (subsLoading) return;
    if (seededRef.current) return;
    seededRef.current = true;
    onChange(
      existingSubs.map((s) => ({
        ChannelId: s.ChannelId,
        Events: s.Events.length > 0 ? s.Events : DEFAULT_EVENTS,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, seedFromServer, subsLoading]);

  const byChannel = useMemo(() => {
    const m = new Map<number, ISubscriptionSelection>();
    for (const v of value) m.set(v.ChannelId, v);
    return m;
  }, [value]);

  const toggleSubscribed = (channelId: number, on: boolean): void => {
    if (on) {
      // Add (or re-add) with default events.
      const next = [...value, { ChannelId: channelId, Events: [...DEFAULT_EVENTS] }];
      onChange(next);
    } else {
      onChange(value.filter((v) => v.ChannelId !== channelId));
    }
  };

  const toggleEvent = (channelId: number, event: TNotificationEvent): void => {
    const next = value.map((v) => {
      if (v.ChannelId !== channelId) return v;
      const has = v.Events.includes(event);
      const events = has
        ? v.Events.filter((e) => e !== event)
        : [...v.Events, event];
      return { ...v, Events: events };
    });
    onChange(next);
  };

  const loading = channelsLoading || (isEdit && subsLoading);
  const subscribedCount = value.length;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Notification subscriptions</Typography>
        <Typography variant="body2" color="text.secondary">
          Pick which delivery channels this project uses and which events fire each one.
          Channels (Discord / Slack / Email) and their credentials are managed centrally
          in <strong>Settings → Notifications</strong>.
        </Typography>
        {!isEdit && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Subscriptions will be saved automatically after the project is created.
          </Typography>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && channels.length === 0 && (
        <Alert severity="info">
          No notification channels exist yet. Ask an Admin to add a provider + channel in{' '}
          <strong>Settings → Notifications</strong>, then come back here to subscribe.
        </Alert>
      )}

      {!loading && channels.length > 0 && (
        <Card variant="outlined">
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
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
                    const sel = byChannel.get(c.Id);
                    const subscribed = !!sel;
                    return (
                      <TableRow key={c.Id}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{c.Name}</TableCell>
                        <TableCell>
                          {c.ProviderName ?? '—'}
                          {c.ProviderType && (
                            <Chip
                              size="small"
                              label={c.ProviderType}
                              sx={{ ml: 1, textTransform: 'uppercase' }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={subscribed}
                            onChange={(e) =>
                              toggleSubscribed(c.Id, e.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <FormGroup row sx={{ opacity: subscribed ? 1 : 0.4 }}>
                            {ALL_NOTIFICATION_EVENTS.map((event) => (
                              <FormControlLabel
                                key={event}
                                control={
                                  <Checkbox
                                    size="small"
                                    disabled={!subscribed}
                                    checked={sel?.Events.includes(event) ?? false}
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
          </CardContent>
        </Card>
      )}

      {!loading && (
        <Typography variant="caption" color="text.secondary">
          {subscribedCount} subscription{subscribedCount === 1 ? '' : 's'} selected.
        </Typography>
      )}
    </Stack>
  );
};

export default Step4NotificationSubscriptions;
