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
import { INotificationConfig } from '@/types';

interface Step4Props {
    notifications: INotificationConfig;
    onChange: (notifications: INotificationConfig) => void;
}

export const Step4Notifications: React.FC<Step4Props> = ({ notifications, onChange }) => {
    const updateChannel = (channel: 'Discord' | 'Slack' | 'Telegram' | 'Email', data: any) => {
        onChange({
            ...notifications,
            [channel]: { ...(notifications[channel as keyof INotificationConfig] as any), ...data },
        });
    };

    const toggleChannel = (channel: 'Discord' | 'Slack' | 'Telegram' | 'Email') => {
        const current = notifications[channel as keyof INotificationConfig] as any;
        updateChannel(channel, { Enabled: !current?.Enabled });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Notifications</Typography>

            {/* Global Triggers */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
            <Accordion expanded={notifications.Discord?.Enabled}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications.Discord?.Enabled || false}
                                onChange={() => toggleChannel('Discord')}
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
                    />
                </AccordionDetails>
            </Accordion>

            {/* Slack */}
            <Accordion expanded={notifications.Slack?.Enabled}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications.Slack?.Enabled || false}
                                onChange={() => toggleChannel('Slack')}
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
                    />
                </AccordionDetails>
            </Accordion>

            {/* Telegram */}
            <Accordion expanded={notifications.Telegram?.Enabled}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications.Telegram?.Enabled || false}
                                onChange={() => toggleChannel('Telegram')}
                            />
                        }
                        label="Telegram"
                        onClick={(e) => e.stopPropagation()}
                    />
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Bot Token"
                                value={notifications.Telegram?.BotToken || ''}
                                onChange={(e) => updateChannel('Telegram', { BotToken: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Chat ID"
                                value={notifications.Telegram?.ChatId || ''}
                                onChange={(e) => updateChannel('Telegram', { ChatId: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Email */}
            <Accordion expanded={notifications.Email?.Enabled}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications.Email?.Enabled || false}
                                onChange={() => toggleChannel('Email')}
                            />
                        }
                        label="Email"
                        onClick={(e) => e.stopPropagation()}
                    />
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
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
