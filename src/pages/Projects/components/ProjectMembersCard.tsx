import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PersonAdd as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useProjectMembers, useAddProjectMember, useRemoveProjectMember } from "@/hooks/useProjects";
import { useToast } from "@/contexts/ToastContext";
import ApiInstance from "@/services/api";

interface IProjectMembersCardProps {
  projectId: number;
  projectName: string;
}

interface IUser {
  Id: number;
  UserId: number;
  Username: string;
  Email: string;
  Role: string;
}

export const ProjectMembersCard: React.FC<IProjectMembersCardProps> = ({
  projectId,
  projectName,
}) => {
  const { showSuccess, showError } = useToast();
  const { data: members = [], isLoading, refetch } = useProjectMembers(projectId);
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleOpenAddDialog = async () => {
    setAddDialogOpen(true);
    setLoadingUsers(true);
    try {
      // Fetch all users from backend
      const response = await ApiInstance.get("/users");
      const allUsers = response.data.Data?.Users || [];

      // Filter out users who are already members
      const memberUserIds = members.map((m: any) => m.UserId);
      const filtered = allUsers.filter((u: IUser) => !memberUserIds.includes(u.Id));
      setAvailableUsers(filtered);
    } catch (error) {
      showError("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setSelectedUserId("");
    setSelectedRole("member");
    setAvailableUsers([]);
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      showError("Please select a user");
      return;
    }

    try {
      await addMember.mutateAsync({
        projectId,
        userId: selectedUserId as number,
        role: selectedRole,
      });
      showSuccess("Member added successfully");
      handleCloseAddDialog();
      refetch();
    } catch (error: any) {
      showError(error?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to remove ${username} from this project?`)) {
      return;
    }

    try {
      await removeMember.mutateAsync({ projectId, userId });
      showSuccess("Member removed successfully");
      refetch();
    } catch (error: any) {
      showError(error?.message || "Failed to remove member");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "error";
      case "member":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <>
      <Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
        <CardHeader
          avatar={<PersonIcon />}
          title="Project Members"
          titleTypographyProps={{ variant: "h6" }}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              size="small"
            >
              Add Member
            </Button>
          }
        />
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : members.length === 0 ? (
            <Alert severity="info">
              No members assigned to this project yet.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>User Role</TableCell>
                    <TableCell>Project Role</TableCell>
                    <TableCell>Added At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member: any) => (
                    <TableRow key={member.Id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {member.User?.Username || "Unknown"}
                        </Typography>
                      </TableCell>
                      <TableCell>{member.User?.Email || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={member.User?.Role || "N/A"}
                          size="small"
                          color={
                            member.User?.Role === "Admin"
                              ? "error"
                              : member.User?.Role === "Manager"
                              ? "warning"
                              : member.User?.Role === "Developer"
                              ? "success"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.Role}
                          size="small"
                          color={getRoleBadgeColor(member.Role)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(member.AddedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveMember(member.UserId, member.User?.Username)}
                          disabled={member.Role === "owner" && members.filter((m: any) => m.Role === "owner").length === 1}
                          title={
                            member.Role === "owner" && members.filter((m: any) => m.Role === "owner").length === 1
                              ? "Cannot remove the last owner"
                              : "Remove member"
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Member to {projectName}</DialogTitle>
        <DialogContent>
          {loadingUsers ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : availableUsers.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              All users are already members of this project.
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                select
                fullWidth
                label="Select User"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                margin="normal"
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.Id} value={user.Id}>
                    {user.Username} ({user.Email}) - {user.Role}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Project Role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                margin="normal"
                helperText="Owner: Can manage members. Member: Regular access."
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={!selectedUserId || loadingUsers || addMember.isPending}
          >
            {addMember.isPending ? "Adding..." : "Add Member"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
