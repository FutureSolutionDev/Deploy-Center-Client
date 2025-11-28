import React from 'react';
import {
    Box,
    TextField,
    FormControlLabel,
    Switch,
    Typography,
    Chip,
    Autocomplete,
} from '@mui/material';
import type { IProjectConfig } from '@/types';

interface IStep2Props {
    config: IProjectConfig;
    onChange: (config: Partial<IProjectConfig>) => void;
}   

export const Step2Configuration: React.FC<IStep2Props> = ({ config, onChange }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
                Deployment Configuration
            </Typography>

            <TextField
                fullWidth
                label="Branch"
                value={config.Branch}
                onChange={(e) => onChange({ Branch: e.target.value })}
                helperText="Branch to deploy from (e.g., main, master)"
            />

            <TextField
                fullWidth
                label="Environment"
                value={config.Environment || 'production'}
                onChange={(e) => onChange({ Environment: e.target.value })}
                helperText="Deployment environment (e.g., production, staging)"
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={config.AutoDeploy}
                        onChange={(e) => onChange({ AutoDeploy: e.target.checked })}
                    />
                }
                label="Auto Deploy"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: -2, ml: 4 }}>
                Automatically deploy when code is pushed to the branch
            </Typography>

            <Box>
                <Typography variant="subtitle2" gutterBottom>
                    Deploy On Paths (Optional)
                </Typography>
                <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={config.DeployOnPaths || []}
                    onChange={(_, newValue) => onChange({ DeployOnPaths: newValue })}
                    renderTags={(value: readonly string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Add path pattern (e.g., src/**)"
                            helperText="Only deploy if changes match these patterns (glob format)"
                        />
                    )}
                />
            </Box>
        </Box>
    );
};
