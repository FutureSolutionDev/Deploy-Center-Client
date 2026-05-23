/**
 * AutoScrollToggle — Deploy Center v3.0 / F-004 (T038).
 * Controlled switch that pauses the parent's "scroll-to-bottom on new log line"
 * behavior. Parent owns the boolean state and uses it inside its useEffect that
 * calls logsEndRef.scrollIntoView. Defaults ON per FR-015.
 */

import React from 'react';
import { FormControlLabel, Switch, Tooltip } from '@mui/material';

interface IProps {
  enabled: boolean;
  onChange: (next: boolean) => void;
}

export const AutoScrollToggle: React.FC<IProps> = ({ enabled, onChange }) => (
  <Tooltip title={enabled ? 'Auto-scroll ON — turn off to read past lines' : 'Auto-scroll OFF'}>
    <FormControlLabel
      sx={{ m: 0, color: 'rgba(255,255,255,0.7)' }}
      control={
        <Switch
          size="small"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          inputProps={{ 'aria-label': 'Toggle auto-scroll for live log' }}
        />
      }
      label="Auto-scroll"
      labelPlacement="start"
    />
  </Tooltip>
);

export default AutoScrollToggle;
