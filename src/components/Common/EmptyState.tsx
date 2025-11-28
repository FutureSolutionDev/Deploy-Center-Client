import React from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface IEmptyStateProps {
    Icon: SvgIconComponent;
    Title: string;
    Description: string;
    Action?: {
        Label: string;
        OnClick: () => void;
    };
}

/**
 * EmptyState Component
 * Reusable component for displaying empty states with icon, message, and optional action
 */
export const EmptyState: React.FC<IEmptyStateProps> = ({
    Icon,
    Title,
    Description,
    Action,
}) => {
    return (
        <Card
            sx={{
                textAlign: 'center',
                py: 8,
                px: 3,
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Icon
                    sx={{
                        fontSize: 64,
                        color: 'text.disabled',
                    }}
                />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {Title}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: Action ? 3 : 0 }}>
                {Description}
            </Typography>

            {Action && (
                <Button variant="contained" onClick={Action.OnClick}>
                    {Action.Label}
                </Button>
            )}
        </Card>
    );
};
