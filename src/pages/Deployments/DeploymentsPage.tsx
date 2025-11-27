import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  DeploymentsService,
  type IDeployment,
} from "@/services/deploymentsService";

export const DeploymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState<IDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const data = await DeploymentsService.getAll();
      setDeployments(data);
    } catch (error) {
      console.error("Failed to fetch deployments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "error";
      case "in_progress":
        return "warning";
      default:
        return "default";
    }
  };

  const filteredDeployments =
    filterStatus === "all"
      ? deployments
      : deployments.filter((d) => d.status === filterStatus);

  return (
    <Box className="dashboard-container sss" sx={{ flex: 1, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Deployments History</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
          </TextField>
          <IconButton onClick={fetchDeployments}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Commit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeployments.map((deployment) => (
                  <TableRow key={deployment.id} hover>
                    <TableCell>#{deployment.id}</TableCell>
                    <TableCell sx={{ fontWeight: "medium" }}>
                      {deployment.projectName}
                    </TableCell>
                    <TableCell>{deployment.branch}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      {deployment.commitHash}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={deployment.status}
                        color={getStatusColor(deployment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{deployment.triggerType}</TableCell>
                    <TableCell>{deployment.timestamp}</TableCell>
                    <TableCell>{deployment.duration || "-"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        title="View Logs"
                        onClick={() =>
                          navigate(`/deployments/${deployment.id}`)
                        }
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDeployments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      No deployments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
            <Pagination count={1} color="primary" />
          </Box>
        </Paper>
      )}
    </Box>
  );
};
