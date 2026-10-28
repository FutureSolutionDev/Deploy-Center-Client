/**
 * WorkspaceIconPicker — v3.0 F-009 (T089).
 * Renders the catalog as a grid; selected icon highlighted. Reads the
 * client mirror catalog (parity-tested against server).
 */

import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
  WORKSPACE_ICON_KEYS,
  WORKSPACE_ICON_COMPONENTS,
  WORKSPACE_ICON_LABELS,
  type TWorkspaceIcon,
} from '@/types/workspaceIcons';

interface IProps {
  value: TWorkspaceIcon;
  onChange: (next: TWorkspaceIcon) => void;
  color?: string;
}

export const WorkspaceIconPicker: React.FC<IProps> = ({ value, onChange, color = '#1976d2' }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
      Icon
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {WORKSPACE_ICON_KEYS.map((key) => {
        const Icon = WORKSPACE_ICON_COMPONENTS[key];
        const selected = value === key;
        return (
          <Tooltip key={key} title={WORKSPACE_ICON_LABELS[key]}>
            <IconButton
              size="small"
              onClick={() => onChange(key)}
              sx={{
                border: selected ? `2px solid ${color}` : '2px solid transparent',
                bgcolor: selected ? `${color}22` : 'transparent',
                borderRadius: 1,
                p: 0.75,
              }}
              aria-label={`Pick icon ${key}`}
            >
              <Icon sx={{ color: selected ? color : 'text.secondary' }} />
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  </Box>
);

export default WorkspaceIconPicker;
