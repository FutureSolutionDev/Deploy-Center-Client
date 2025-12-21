import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useDateFormatter } from "@/hooks/useDateFormatter";
import { useUserSessions, useRevokeSession, useRevokeAllSessions } from "@/hooks/useUserSettings";
import { useToast } from "@/contexts/ToastContext";

interface ISessionsTabProps {
  t: (key: string) => string;
}

export const SessionsTab: React.FC<ISessionsTabProps> = ({ t }) => {
  const { formatDateTime } = useDateFormatter();
  const { showError } = useToast();
  const { data: sessions = [], isLoading: loading } = useUserSessions();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();

  const [selectedSessionToKeep, setSelectedSessionToKeep] = useState<number | null>(
    sessions[0]?.Id ?? null
  );

  const handleRevoke = (id: number) => {
    revokeSession.mutate(id, { onError: () => showError(t("settings.saveFailed")) });
  };

  const handleRevokeAll = (keepId: number) => {
    revokeAllSessions.mutate(keepId, { onError: () => showError(t("settings.saveFailed")) });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("settings.activeSessions")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("settings.manageActiveSessions")}
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("settings.device")}</TableCell>
              <TableCell>{t("settings.ipAddress")}</TableCell>
              <TableCell>{t("settings.lastActivity")}</TableCell>
              <TableCell>{t("settings.status")}</TableCell>
              <TableCell align="right">{t("settings.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t("settings.loading")}
                </TableCell>
              </TableRow>
            )}
            {!loading && sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t("settings.noActiveSessions")}
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              sessions.map((session) => (
                <TableRow key={session.Id}>
                  <TableCell>{session.UserAgent || t("settings.notAvailable")}</TableCell>
                  <TableCell>{session.IpAddress || t("settings.notAvailable")}</TableCell>
                  <TableCell>{formatDateTime(session.LastActivityAt)}</TableCell>
                  <TableCell>{session.IsActive ? t("settings.active") : t("settings.inactive")}</TableCell>
                  <TableCell align="right">
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleRevoke(session.Id)}
                      disabled={!session.IsActive}
                    >
                      {t("settings.revoke")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t("settings.revokeAllSessions")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("settings.revokeAllSessionsDesc")}
        </Typography>
        <FormControl sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>{t("settings.keepSession")}</InputLabel>
          <Select
            value={selectedSessionToKeep || ""}
            label={t("settings.keepSession")}
            onChange={(e) => setSelectedSessionToKeep(Number(e.target.value))}
          >
            {sessions.map((session) => (
              <MenuItem key={session.Id} value={session.Id}>
                {session.UserAgent || session.IpAddress || `Session ${session.Id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <br />
        <Button
          variant="outlined"
          color="error"
          onClick={() => selectedSessionToKeep && handleRevokeAll(selectedSessionToKeep)}
          disabled={!selectedSessionToKeep || sessions.length === 0}
        >
          {t("settings.revokeAll")}
        </Button>
      </Box>
    </Box>
  );
};

export default SessionsTab;
