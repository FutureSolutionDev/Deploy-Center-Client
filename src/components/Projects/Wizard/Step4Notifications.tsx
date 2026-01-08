import React from 'react';
import {
    Box,
    Typography,
    FormControlLabel,
    Switch,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { INotificationConfig } from '@/types';

interface IStep4Props {
    notifications: INotificationConfig;
    onChange: (notifications: INotificationConfig) => void;
}

export const Step4Notifications: React.FC<IStep4Props> = ({ notifications, onChange }) => {
    const [expandedPanels, setExpandedPanels] = React.useState<Record<string, boolean>>({
        discord: false,
        slack: false,
        telegram: false,
        email: false,
    });

    const updateChannel = (channel: 'Discord' | 'Slack' | 'Telegram' | 'Email', data: Record<string, any>) => {
        const currentConfig = notifications[channel as keyof INotificationConfig] as any || {};
        onChange({
            ...notifications,
            [channel]: { ...currentConfig, ...data },
        });
    };

    const toggleChannel = (channel: 'Discord' | 'Slack' | 'Telegram' | 'Email', event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        const currentConfig = notifications[channel as keyof INotificationConfig] as any;
        const enabled = currentConfig?.Enabled || false;
        updateChannel(channel, { Enabled: !enabled });

        // Expand panel if enabling
        const channelKey = channel.toLowerCase();
        if (!enabled) {
            setExpandedPanels(prev => ({ ...prev, [channelKey]: true }));
        }
    };

    const togglePanel = (channel: string) => {
        setExpandedPanels(prev => ({ ...prev, [channel]: !prev[channel] }));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h6">Notifications</Typography>

            {/* Global Triggers */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={notifications.OnSuccess}
                            onChange={(e) => onChange({ ...notifications, OnSuccess: e.target.checked })}
                        />
                    }
                    label="On Success"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={notifications.OnFailure}
                            onChange={(e) => onChange({ ...notifications, OnFailure: e.target.checked })}
                        />
                    }
                    label="On Failure"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={notifications.OnStart}
                            onChange={(e) => onChange({ ...notifications, OnStart: e.target.checked })}
                        />
                    }
                    label="On Start"
                />
            </Box>

            {/* Discord */}
            <Accordion expanded={expandedPanels.discord} onChange={() => togglePanel('discord')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications.Discord?.Enabled || false}
                                onChange={(e) => toggleChannel('Discord', e)}
                            />
                        }
                        label="Discord"
                        onClick={(e) => e.stopPropagation()}
                    />
                </AccordionSummary>
                <AccordionDetails>
                    <TextField
                        fullWidth
                        label="Webhook URL"
                        value={notifications.Discord?.WebhookUrl || ''}
                        onChange={(e) => updateChannel('Discord', { WebhookUrl: e.target.value })}
                        placeholder="https://discord.com/api/webhooks/..."
                    />
                </AccordionDetails>
            </Accordion>

            {/* Slack */}
            <Accordion expanded={expandedPanels.slack} onChange={() => togglePanel('slack')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications.Slack?.Enabled || false}
                                onChange={(e) => toggleChannel('Slack', e)}
                            />
                        }
                        label="Slack"
                        onClick={(e) => e.stopPropagation()}
                    />
                </AccordionSummary>
                <AccordionDetails>
                    <TextField
                        fullWidth
                        label="Webhook URL"
                        value={notifications.Slack?.WebhookUrl || ''}
                        onChange={(e) => updateChannel('Slack', { WebhookUrl: e.target.value })}
                        placeholder="https://hooks.slack.com/services/..."
                    />
                </AccordionDetails>
            </Accordion>

            {/* Telegram */}
            <Accordion expanded={expandedPanels.telegram} onChange={() => togglePanel('telegram')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications.Telegram?.Enabled || false}
                                onChange={(e) => toggleChannel('Telegram', e)}
                            />
                        }
                        label="Telegram"
                        onClick={(e) => e.stopPropagation()}
                    />
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={0.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Bot Token"
                                value={notifications.Telegram?.BotToken || ''}
                                onChange={(e) => updateChannel('Telegram', { BotToken: e.target.value })}
                                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Chat ID"
                                value={notifications.Telegram?.ChatId || ''}
                                onChange={(e) => updateChannel('Telegram', { ChatId: e.target.value })}
                                placeholder="-1001234567890"
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Email */}
            <Accordion expanded={expandedPanels.email} onChange={() => togglePanel('email')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications.Email?.Enabled || false}
                                onChange={(e) => toggleChannel('Email', e)}
                            />
                        }
                        label="Email"
                        onClick={(e) => e.stopPropagation()}
                    />
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={0.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="SMTP Host"
                                value={notifications.Email?.Host || ''}
                                onChange={(e) => updateChannel('Email', { Host: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Port"
                                type="number"
                                value={notifications.Email?.Port || 587}
                                onChange={(e) => updateChannel('Email', { Port: parseInt(e.target.value) })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.Email?.Secure || false}
                                        onChange={(e) => updateChannel('Email', { Secure: e.target.checked })}
                                    />
                                }
                                label="Secure (SSL/TLS)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="User"
                                value={notifications.Email?.User || ''}
                                onChange={(e) => updateChannel('Email', { User: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={notifications.Email?.Password || ''}
                                onChange={(e) => updateChannel('Email', { Password: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="From Address"
                                value={notifications.Email?.From || ''}
                                onChange={(e) => updateChannel('Email', { From: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="To (comma separated)"
                                value={notifications.Email?.To?.join(', ') || ''}
                                onChange={(e) => updateChannel('Email', { To: e.target.value.split(',').map((s: string) => s.trim()) })}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
