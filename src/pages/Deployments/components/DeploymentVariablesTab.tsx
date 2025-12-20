import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
} from '@mui/material';
import type { IDeployment } from '@/types';

interface IDeploymentVariablesTabProps {
    deployment: IDeployment;
}

export const DeploymentVariablesTab: React.FC<IDeploymentVariablesTabProps> = ({ deployment }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Deployment Variables
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {deployment.Project?.Config?.Variables && Object.keys(deployment.Project.Config.Variables).length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Variable</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(deployment.Project.Config.Variables).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell sx={{ fontFamily: 'monospace', color: '#1976d2' }}>{key}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>{value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Alert severity="info">No variables configured for this deployment</Alert>
                )}
            </CardContent>
        </Card>
    );
};
