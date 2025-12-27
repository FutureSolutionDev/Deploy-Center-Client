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
    const ignorePatterns = config.SyncIgnorePatterns || [];

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

    const handleAddIgnorePattern = () => {
        onChange({ SyncIgnorePatterns: [...ignorePatterns, ''] });
    };

    const handleRemoveIgnorePattern = (index: number) => {
        const newPatterns = ignorePatterns.filter((_, i) => i !== index);
        onChange({ SyncIgnorePatterns: newPatterns });
    };

    const handleIgnorePatternChange = (index: number, value: string) => {
        const newPatterns = [...ignorePatterns];
        newPatterns[index] = value;
        onChange({ SyncIgnorePatterns: newPatterns });
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

            <TextField
                fullWidth
                label="Build Output Directory (Optional)"
                value={config.BuildOutput || ''}
                onChange={(e) => onChange({ BuildOutput: e.target.value })}
                placeholder="build"
                helperText="Directory to sync to production (e.g., 'build', 'dist' for React/Vue). Leave empty to sync entire project."
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

            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                            Sync Ignore Patterns (Optional)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Files/folders to preserve during deployment sync (won't be overwritten)
                        </Typography>
                    </Box>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddIgnorePattern}
                        variant="outlined"
                        size="small"
                    >
                        Add Pattern
                    </Button>
                </Box>

                {ignorePatterns.length === 0 ? (
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
                            No ignore patterns configured. Only system files (.env, .htaccess, etc.) will be preserved.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Click "Add Pattern" to preserve custom files/folders (e.g., node_modules, Backup, Logs)
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {ignorePatterns.map((pattern, index) => (
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
                                    value={pattern}
                                    onChange={(e) => handleIgnorePatternChange(index, e.target.value)}
                                    placeholder="e.g., node_modules, Backup, Logs, *.log"
                                    helperText={
                                        index === 0
                                            ? "Files/folders to preserve (supports wildcards: *, **, ?)"
                                            : undefined
                                    }
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveIgnorePattern(index)}
                                    sx={{ mt: 0.5 }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}

                <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
                        Common Patterns:
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                        • <code>node_modules</code> - Dependencies folder<br />
                        • <code>Backup</code> - Backup files/folders<br />
                        • <code>Logs</code> - Log files folder<br />
                        • <code>*.log</code> - All log files<br />
                        • <code>_RateLimits</code> - Rate limit data<br />
                        • <code>uploads</code> - User uploads folder
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Note: System files (.env, .htaccess, web.config, php.ini) are always preserved automatically.
                    </Typography>
                </Box>
            </Box>

            <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Advanced Rsync Options (Optional)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Custom rsync command options for syncing files to production
                </Typography>

                <TextField
                    fullWidth
                    label="Rsync Options"
                    value={config.RsyncOptions || ''}
                    onChange={(e) => onChange({ RsyncOptions: e.target.value })}
                    placeholder="-av --no-perms --no-owner --no-group --omit-dir-times --delete"
                    helperText="Leave empty to use default options (-av --delete)"
                    multiline
                    rows={2}
                />

                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
                        Common Options:
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                        • <code>-av --delete</code> - Default (archive mode with delete)<br />
                        • <code>--no-perms</code> - Don't preserve permissions<br />
                        • <code>--no-owner</code> - Don't preserve file ownership<br />
                        • <code>--no-group</code> - Don't preserve group ownership<br />
                        • <code>--omit-dir-times</code> - Don't update directory timestamps<br />
                        • <code>--delete</code> - Delete files that don't exist in source
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Example: <code>-av --no-perms --no-owner --no-group --omit-dir-times --delete</code>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
