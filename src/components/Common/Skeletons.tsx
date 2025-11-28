import React from 'react';
import { Box, Skeleton, TableRow, TableCell, Card, Grid } from '@mui/material';

/**
 * ProjectCardSkeleton - Loading skeleton for project cards
 */
export const ProjectCardSkeleton: React.FC = () => {
    return (
        <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="circular" width={40} height={40} />
            </Box>
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
        </Card>
    );
};

/**
 * ProjectsGridSkeleton - Multiple project card skeletons in a grid
 */
export const ProjectsGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <Grid container spacing={3}>
            {Array.from({ length: count }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <ProjectCardSkeleton />
                </Grid>
            ))}
        </Grid>
    );
};

/**
 * TableRowSkeleton - Loading skeleton for table rows
 */
export const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => {
    return (
        <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                    <Skeleton variant="text" width="80%" />
                </TableCell>
            ))}
        </TableRow>
    );
};

/**
 * TableSkeleton - Multiple table row skeletons
 */
export const TableSkeleton: React.FC<{ rows?: number; columns: number }> = ({
    rows = 5,
    columns,
}) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <TableRowSkeleton key={index} columns={columns} />
            ))}
        </>
    );
};

/**
 * StatCardSkeleton - Loading skeleton for statistics cards
 */
export const StatCardSkeleton: React.FC = () => {
    return (
        <Card sx={{ p: 3 }}>
            <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
        </Card>
    );
};

/**
 * ChartSkeleton - Loading skeleton for charts
 */
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => {
    return (
        <Card sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: 1 }} />
        </Card>
    );
};
