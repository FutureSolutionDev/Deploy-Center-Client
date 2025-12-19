import React from 'react';
import {
    Box,
    TextField,
    FormControlLabel,
    Switch,
    Typography,
    IconButton,
    Button,
    Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { IProjectConfig } from '@/types';

interface IStep2Props {
    config: IProjectConfig;
    onChange: (config: Partial<IProjectConfig>) => void;
}   

export const Step2Configuration: React.FC<IStep2Props> = ({ config, onChange }) => {
    const paths = config.DeployOnPaths || [];

    const handleAddPath = () => {
        onChange({ DeployOnPaths: [...paths, ''] });
    };

    const handleRemovePath = (index: number) => {
        const newPaths = paths.filter((_, i) => i !== index);
        onChange({ DeployOnPaths: newPaths });
    };

    const handlePathChange = (index: number, value: string) => {
        const newPaths = [...paths];
        newPaths[index] = value;
        onChange({ DeployOnPaths: newPaths });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
                Deployment Configuration
            </Typography>

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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                            Deploy On Paths (Optional)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Only trigger deployment when changes occur in these paths
                        </Typography>
                    </Box>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddPath}
                        variant="outlined"
                        size="small"
                    >
                        Add Path
                    </Button>
                </Box>

                {paths.length === 0 ? (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            textAlign: 'center',
                            bgcolor: 'background.default',
                            borderStyle: 'dashed',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            No path filters configured. Deployment will trigger on any change.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Click "Add Path" to add glob patterns (e.g., src/**, *.ts, public/**)
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {paths.map((path, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={path}
                                    onChange={(e) => handlePathChange(index, e.target.value)}
                                    placeholder="e.g., src/**, *.ts, public/**"
                                    helperText={
                                        index === 0
                                            ? "Use glob patterns: * (any file), ** (any path), ? (one char)"
                                            : undefined
                                    }
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemovePath(index)}
                                    sx={{ mt: 0.5 }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}

                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
                        Examples:
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                        • <code>src/**</code> - Any file in src folder<br />
                        • <code>*.ts</code> - Any TypeScript file in root<br />
                        • <code>package.json</code> - Specific file<br />
                        • <code>!**/*.test.ts</code> - Exclude test files (add ! prefix)
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
