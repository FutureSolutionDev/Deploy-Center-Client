import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
} from '@mui/material';
import { EProjectType } from '@/types';
import type { IProject } from '@/types';

interface IStep1Props {
    data: Partial<IProject>;
    onChange: (data: Partial<IProject>) => void;
}

export const Step1BasicInfo: React.FC<IStep1Props> = ({ data, onChange }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
                Basic Information
            </Typography>

            <TextField
                fullWidth
                label="Project Name"
                value={data.Name}
                onChange={(e) => onChange({ Name: e.target.value })}
                required
                helperText="Unique name for your project"
            />

            <TextField
                fullWidth
                label="Description"
                value={data.Description || ''}
                onChange={(e) => onChange({ Description: e.target.value })}
                multiline
                rows={3}
            />

            <TextField
                fullWidth
                label="Repository URL"
                value={data.RepoUrl}
                onChange={(e) => onChange({ RepoUrl: e.target.value })}
                required
                placeholder="https://github.com/username/repo.git"
            />

            <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                    value={data.ProjectType}
                    label="Project Type"
                    onChange={(e) => onChange({ ProjectType: e.target.value })}
                >
                    <MenuItem value={EProjectType.NodeJS}>Node.js</MenuItem>
                    <MenuItem value={EProjectType.React}>React</MenuItem>
                    <MenuItem value={EProjectType.Static}>Static Site</MenuItem>
                    <MenuItem value={EProjectType.Docker}>Docker</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};
