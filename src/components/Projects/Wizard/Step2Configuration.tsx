import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    FormControlLabel,
    Switch,
    Typography,
    IconButton,
    Button,
    Paper,
    Checkbox,
    FormGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { IProjectConfig } from '@/types';

interface IStep2Props {
    config: IProjectConfig;
    onChange: (config: Partial<IProjectConfig>) => void;
}

// Available rsync options
interface IRsyncOption {
    flag: string;
    label: string;
    description: string;
    defaultEnabled: boolean;
}

const RSYNC_OPTIONS: IRsyncOption[] = [
    { flag: '-a', label: 'Archive mode', description: 'Preserve permissions, timestamps, symlinks, etc. (includes -rlptgoD)', defaultEnabled: true },
    { flag: '-v', label: 'Verbose', description: 'Show detailed output during sync', defaultEnabled: true },
    { flag: '--delete', label: 'Delete extraneous files', description: 'Remove files from destination that don\'t exist in source', defaultEnabled: true },
    { flag: '--no-perms', label: 'Don\'t preserve permissions', description: 'Ignore file permissions (useful for different systems)', defaultEnabled: false },
    { flag: '--no-owner', label: 'Don\'t preserve owner', description: 'Ignore file ownership (recommended for different users)', defaultEnabled: false },
    { flag: '--no-group', label: 'Don\'t preserve group', description: 'Ignore file group (recommended for different users)', defaultEnabled: false },
    { flag: '--omit-dir-times', label: 'Omit directory times', description: 'Don\'t update directory timestamps (faster sync)', defaultEnabled: false },
    { flag: '--compress', label: 'Compress during transfer', description: 'Compress data during transfer (slower but less bandwidth)', defaultEnabled: false },
    { flag: '--progress', label: 'Show progress', description: 'Show progress during file transfer', defaultEnabled: false },
    { flag: '--chmod=ugo=rwX', label: 'Set permissions (rwX)', description: 'Set read/write/execute permissions for all users', defaultEnabled: false },
    { flag: '--checksum', label: 'Use checksum', description: 'Skip files based on checksum, not size/time (slower but more accurate)', defaultEnabled: false },
    { flag: '--ignore-times', label: 'Ignore timestamps', description: 'Don\'t skip files that match size and time', defaultEnabled: false },
];

export const Step2Configuration: React.FC<IStep2Props> = ({ config, onChange }) => {
    const paths = config.DeployOnPaths || [];
    const ignorePatterns = config.SyncIgnorePatterns || [];

    // Parse existing rsync options to determine which checkboxes should be checked
    const parseRsyncOptions = (optionsString: string | undefined): Set<string> => {
        if (!optionsString) return new Set(RSYNC_OPTIONS.filter(opt => opt.defaultEnabled).map(opt => opt.flag));

        const flags = new Set<string>();
        const parts = optionsString.trim().split(/\s+/);

        for (const part of parts) {
            // Match each known flag
            RSYNC_OPTIONS.forEach(opt => {
                if (part === opt.flag || part.startsWith(opt.flag)) {
                    flags.add(opt.flag);
                }
            });
        }

        return flags;
    };

    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(() =>
        parseRsyncOptions(config.RsyncOptions)
    );

    // Update RsyncOptions whenever selected options change
    useEffect(() => {
        const optionsArray = Array.from(selectedOptions);
        const optionsString = optionsArray.length > 0 ? optionsArray.join(' ') : '';
        onChange({ RsyncOptions: optionsString || undefined });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOptions]);

    const handleOptionToggle = (flag: string) => {
        setSelectedOptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(flag)) {
                newSet.delete(flag);
            } else {
                newSet.add(flag);
            }
            return newSet;
        });
    };

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

            <Box>
                <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                    Build Output Directory (Optional)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Select the directory to sync to production, or leave empty to sync entire project
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {[
                        { value: null, label: 'Entire Project', description: 'Sync all files (Node.js projects)' },
                        { value: 'build', label: 'build/', description: 'React (CRA) default output' },
                        { value: 'dist', label: 'dist/', description: 'Vite, Vue, Angular output' },
                        { value: '.next', label: '.next/', description: 'Next.js output' },
                        { value: 'out', label: 'out/', description: 'Next.js static export' },
                        { value: 'public', label: 'public/', description: 'Static files only' },
                    ].map((option) => {
                        const isSelected = (config.BuildOutput || null) === option.value;
                        return (
                            <Paper
                                key={option.value || 'entire'}
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    cursor: 'pointer',
                                    flex: '1 1 calc(50% - 8px)',
                                    minWidth: '200px',
                                    border: isSelected ? 2 : 1,
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'primary.lighter',
                                    },
                                }}
                                onClick={() => onChange({ BuildOutput: option.value || undefined })}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Box
                                        sx={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: '50%',
                                            border: 2,
                                            borderColor: isSelected ? 'primary.main' : 'divider',
                                            bgcolor: isSelected ? 'primary.main' : 'transparent',
                                            mr: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {isSelected && (
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: 'white',
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{
                                            fontFamily: option.value ? 'monospace' : 'inherit',
                                            color: isSelected ? 'primary.main' : 'text.primary',
                                        }}
                                    >
                                        {option.label}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                                    {option.description}
                                </Typography>
                            </Paper>
                        );
                    })}
                </Box>

                <TextField
                    fullWidth
                    size="small"
                    label="Custom Directory"
                    value={config.BuildOutput && !['build', 'dist', '.next', 'out', 'public'].includes(config.BuildOutput) ? config.BuildOutput : ''}
                    onChange={(e) => onChange({ BuildOutput: e.target.value || undefined })}
                    placeholder="custom-output"
                    helperText="Or enter a custom directory name"
                />
            </Box>

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
                    Select rsync options for syncing files to production
                </Typography>

                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        bgcolor: 'background.default',
                    }}
                >
                    <FormGroup>
                        {RSYNC_OPTIONS.map((option) => (
                            <FormControlLabel
                                key={option.flag}
                                control={
                                    <Checkbox
                                        checked={selectedOptions.has(option.flag)}
                                        onChange={() => handleOptionToggle(option.flag)}
                                        size="small"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {option.label}
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                sx={{
                                                    ml: 1,
                                                    fontFamily: 'monospace',
                                                    color: 'primary.main',
                                                    bgcolor: 'primary.lighter',
                                                    px: 0.5,
                                                    py: 0.25,
                                                    borderRadius: 0.5,
                                                }}
                                            >
                                                {option.flag}
                                            </Typography>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {option.description}
                                        </Typography>
                                    </Box>
                                }
                                sx={{ mb: 1.5, alignItems: 'flex-start' }}
                            />
                        ))}
                    </FormGroup>
                </Paper>

                {selectedOptions.size > 0 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
                            Generated Command:
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'monospace',
                                color: 'success.dark',
                                wordBreak: 'break-word',
                            }}
                        >
                            rsync {Array.from(selectedOptions).join(' ')}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
