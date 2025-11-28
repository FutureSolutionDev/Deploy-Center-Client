import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Rocket as DeployIcon,
} from '@mui/icons-material';
import type { IProject, IDeploymentRequest } from '@/types';

interface IDeploymentModalProps {
    Open: boolean;
    Project: IProject | null;
    OnClose: () => void;
    OnDeploy: (data: IDeploymentRequest) => Promise<void>;
}

export const DeploymentModal: React.FC<IDeploymentModalProps> = ({
    Open,
    Project,
    OnClose,
    OnDeploy,
}) => {
    const [Branch, setBranch] = useState<string>('');
    const [CommitHash, setCommitHash] = useState<string>('');
    const [CommitMessage, setCommitMessage] = useState<string>('');
    const [Loading, setLoading] = useState(false);
    const [Error, setError] = useState<string | null>(null);
    const [ShowAdvanced, setShowAdvanced] = useState(false);

    // Available branches (hardcoded for now, can be fetched from API)
    const AvailableBranches = ['main', 'master', 'develop', 'staging', 'production'];

    // Reset form when project changes
    useEffect(() => {
        if (Project) {
            setBranch(Project.Branch || 'main');
            setCommitHash('');
            setCommitMessage('');
            setError(null);
            setShowAdvanced(false);
        }
    }, [Project]);

    const HandleDeploy = async () => {
        if (!Project) return;

        setLoading(true);
        setError(null);

        try {
            const deploymentData: IDeploymentRequest = {
                ProjectId: Project.Id,
                Branch: Branch || undefined,
                CommitHash: CommitHash || undefined,
                CommitMessage: CommitMessage || undefined,
            };

            await OnDeploy(deploymentData);
            OnClose();
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'message' in err
                    ? String(err.message)
                    : 'Failed to start deployment';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const HandleClose = () => {
        if (!Loading) {
            OnClose();
        }
    };

    return (
        <Dialog
            open={Open}
            onClose={HandleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeployIcon color="primary" />
                <Typography variant="h6">
                    Deploy: {Project?.Name || 'Project'}
                </Typography>
            </DialogTitle>

            <DialogContent>
                {Error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {Error}
                    </Alert>
                )}

                <Box sx={{ mt: 1 }}>
                    {/* Branch Selection */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Branch</InputLabel>
                        <Select
                            value={Branch}
                            onChange={(e) => setBranch(e.target.value)}
                            label="Branch"
                            disabled={Loading}
                        >
                            {AvailableBranches.map((branch) => (
                                <MenuItem key={branch} value={branch}>
                                    {branch}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Advanced Options (Collapsible) */}
                    <Accordion
                        expanded={ShowAdvanced}
                        onChange={() => setShowAdvanced(!ShowAdvanced)}
                        sx={{ mb: 2 }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body2" color="text.secondary">
                                Advanced Options (Optional)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Commit Hash */}
                                <TextField
                                    label="Commit Hash"
                                    value={CommitHash}
                                    onChange={(e) => setCommitHash(e.target.value)}
                                    placeholder="e.g., a1b2c3d4"
                                    helperText="Deploy specific commit (leave empty for latest)"
                                    disabled={Loading}
                                    fullWidth
                                />

                                {/* Commit Message */}
                                <TextField
                                    label="Commit Message"
                                    value={CommitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    placeholder="Manual deployment"
                                    helperText="Custom message for this deployment"
                                    disabled={Loading}
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* Info Box */}
                    <Alert severity="info" variant="outlined">
                        This will trigger a new deployment for <strong>{Project?.Name}</strong> from the{' '}
                        <strong>{Branch}</strong> branch.
                    </Alert>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={HandleClose} disabled={Loading} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={HandleDeploy}
                    variant="contained"
                    disabled={Loading || !Branch}
                    startIcon={Loading ? <CircularProgress size={20} /> : <DeployIcon />}
                >
                    {Loading ? 'Deploying...' : 'Deploy Now'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
