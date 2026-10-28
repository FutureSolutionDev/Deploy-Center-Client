/**
 * SmtpPresetPicker — v3.0 F-006 (T064).
 * Pre-fills host/port/secure for common SMTP providers. Operator still
 * supplies user/password/from manually.
 */

import React from 'react';
import { MenuItem, TextField } from '@mui/material';

export type TSmtpPreset = 'gmail' | 'sendgrid' | 'mailgun' | 'custom';

interface IPresetSpec {
  label: string;
  host: string;
  port: number;
  secure: boolean;
}

export const SMTP_PRESETS: Record<Exclude<TSmtpPreset, 'custom'>, IPresetSpec> = {
  gmail:    { label: 'Gmail',    host: 'smtp.gmail.com',     port: 465, secure: true },
  sendgrid: { label: 'SendGrid', host: 'smtp.sendgrid.net',  port: 587, secure: false },
  mailgun:  { label: 'Mailgun',  host: 'smtp.mailgun.org',   port: 587, secure: false },
};

export interface ISmtpPresetPickerProps {
  value: TSmtpPreset;
  onApply: (preset: TSmtpPreset, spec: IPresetSpec | null) => void;
}

export const SmtpPresetPicker: React.FC<ISmtpPresetPickerProps> = ({ value, onApply }) => (
  <TextField
    select
    label="SMTP preset"
    value={value}
    onChange={(e) => {
      const next = e.target.value as TSmtpPreset;
      if (next === 'custom') onApply(next, null);
      else onApply(next, SMTP_PRESETS[next]);
    }}
    fullWidth
    margin="normal"
    helperText="Pick a preset to pre-fill host/port/secure. Custom = full manual."
  >
    {(Object.keys(SMTP_PRESETS) as Array<Exclude<TSmtpPreset, 'custom'>>).map((k) => (
      <MenuItem key={k} value={k}>
        {SMTP_PRESETS[k].label} — {SMTP_PRESETS[k].host}:{SMTP_PRESETS[k].port}
      </MenuItem>
    ))}
    <MenuItem value="custom">Custom (manual host/port)</MenuItem>
  </TextField>
);

export default SmtpPresetPicker;
