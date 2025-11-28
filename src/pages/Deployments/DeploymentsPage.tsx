import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  alpha,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Rocket as DeployIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { DeploymentsService } from "@/services/deploymentsService";
import type { IDeployment } from "@/types";

export const DeploymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [deployments, setDeployments] = useState<IDeployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<IDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const data = await DeploymentsService.getAll();
      setDeployments(data);
      setFilteredDeployments(data);
    } catch (error) {
      console.error("Failed to fetch deployments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  useEffect(() => {
    let filtered = deployments;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.Status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(

        (d) =>
          (d.ProjectName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.Branch.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDeployments(filtered);
  }, [deployments, statusFilter, searchQuery]);

  const getStatusChip = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactElement; label: string }
    > = {
      success: {
        color: "success",
        icon: <SuccessIcon fontSize="small" />,
        label: "Success",
      },
      failed: {
        color: "error",
        icon: <ErrorIcon fontSize="small" />,
        label: "Failed",
      },
      inProgress: {
        color: "warning",
        icon: <ScheduleIcon fontSize="small" />,
        label: "In Progress",
      },
      pending: {
        color: "default",
        icon: <ScheduleIcon fontSize="small" />,
        label: "Pending",
      },
      queued: {
        color: "default",
        icon: <ScheduleIcon fontSize="small" />,
        label: "Queued",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon || undefined}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {t("deployments.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all deployments
            </Typography>
          </Box>

          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchDeployments}
            disabled={loading}
          >
            {t("common.refresh")}
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search by project or branch..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="inProgress">In Progress</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Deployments Table */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && filteredDeployments.length === 0 && (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <DeployIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {deployments.length === 0
              ? t("deployments.noDeployments")
              : "No deployments match your filters"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {deployments.length === 0
              ? "Deploy a project to see it here"
              : "Try adjusting your search or filters"}
          </Typography>
        </Card>
      )}

      {!loading && filteredDeployments.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 2,
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Commit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeployments.map((deployment) => (
                <TableRow
                  key={deployment.Id}
                  sx={{
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {deployment.ProjectName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={deployment.Branch} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{getStatusChip(deployment.Status)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                        px: 1,
                        py: 0.5,
                        borderRadius: 0.5,
                      }}
                    >
                      {deployment.Commit?.substring(0, 7) || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(deployment.CreatedAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/deployments/${deployment.Id}`)}
                    >
                      View Logs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Results Count */}
      {!loading && filteredDeployments.length > 0 && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Showing {filteredDeployments.length} of {deployments.length} deployments
          </Typography>
        </Box>
      )}
    </Box>
  );
};
