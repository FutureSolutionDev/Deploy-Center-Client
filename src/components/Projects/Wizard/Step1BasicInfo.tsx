import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Button,
    IconButton,
    Stack,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { EProjectType } from '@/types';
import type { IProject } from '@/types';

interface IStep1Props {
    data: Partial<IProject>;
    onChange: (data: Partial<IProject>) => void;
}

export const Step1BasicInfo: React.FC<IStep1Props> = ({ data, onChange }) => {
    // Initialize DeploymentPaths from either DeploymentPaths or ProjectPath for backward compatibility
    const deploymentPaths = data.DeploymentPaths && data.DeploymentPaths.length > 0
        ? data.DeploymentPaths
        : data.ProjectPath
        ? [data.ProjectPath]
        : [''];

    const handlePathChange = (index: number, value: string) => {
        const newPaths = [...deploymentPaths];
        newPaths[index] = value;
        onChange({
            DeploymentPaths: newPaths,
            ProjectPath: newPaths[0] || '', // Keep ProjectPath in sync with first path for backward compatibility
        });
    };

    const handleAddPath = () => {
        const newPaths = [...deploymentPaths, ''];
        onChange({
            DeploymentPaths: newPaths,
            ProjectPath: newPaths[0] || '',
        });
    };

    const handleRemovePath = (index: number) => {
        if (deploymentPaths.length > 1) {
            const newPaths = deploymentPaths.filter((_, i) => i !== index);
            onChange({
                DeploymentPaths: newPaths,
                ProjectPath: newPaths[0] || '',
            });
        }
    };

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
                value={data.RepoUrl || ''}
                onChange={(e) => onChange({ RepoUrl: e.target.value })}
                required
                placeholder="https://github.com/username/repo.git"
            />

            <TextField
                fullWidth
                label="Branch"
                value={data.Branch || ''}
                onChange={(e) => onChange({ Branch: e.target.value })}
                required
                placeholder="master or main"
                helperText="Branch to deploy from"
            />

            <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
                    Deployment Paths
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Add one or more absolute paths where the project should be deployed on the server
                </Typography>

                <Stack spacing={2}>
                    {deploymentPaths.map((path, index) => (
                        <Stack key={index} direction="row" spacing={1} alignItems="flex-start">
                            <TextField
                                fullWidth
                                label={`Deployment Path ${index + 1}`}
                                value={path}
                                onChange={(e) => handlePathChange(index, e.target.value)}
                                required
                                placeholder="/www/wwwroot/your-project"
                                helperText={index === 0 ? 'Primary deployment path' : undefined}
                            />
                            {deploymentPaths.length > 1 && (
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemovePath(index)}
                                    sx={{ mt: 1 }}
                                    title="Remove this path"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Stack>
                    ))}

                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddPath}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        Add Another Path
                    </Button>
                </Stack>
            </Box>

            <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                    value={data.ProjectType}
                    label="Project Type"
                    onChange={(e) => onChange({ ProjectType: e.target.value })}
                >
                    <MenuItem value={EProjectType.NodeJS}>Node.js</MenuItem>
                    <MenuItem value={EProjectType.React}>React</MenuItem>
                    <MenuItem value={EProjectType.NextJS}>Next.js</MenuItem>
                    <MenuItem value={EProjectType.Static}>Static Site</MenuItem>
                    <MenuItem value={EProjectType.Docker}>Docker</MenuItem>
                    <MenuItem value={EProjectType.Other}>Other</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};
