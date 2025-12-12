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
import type { IUserSession } from "@/types";

interface ISessionsTabProps {
  sessions: IUserSession[];
  loading?: boolean;
  onRevoke: (id: number) => Promise<void>;
  onRevokeAll: (keepId: number) => Promise<void>;
  t: (key: string) => string;
}

export const SessionsTab: React.FC<ISessionsTabProps> = ({
  sessions,
  loading,
  onRevoke,
  onRevokeAll,
  t,
}) => {
  const { formatDateTime } = useDateFormatter();
  const [selectedSessionToKeep, setSelectedSessionToKeep] = useState<number | null>(
    sessions[0]?.Id ?? null
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {t("settings.sessions")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("settings.keepSession")}</InputLabel>
            <Select
              value={selectedSessionToKeep ?? ""}
              label={t("settings.keepSession")}
              onChange={(e) => setSelectedSessionToKeep(Number(e.target.value))}
              disabled={loading || sessions.length === 0}
            >
              {sessions.map((session) => (
                <MenuItem key={session.Id} value={session.Id}>
                  {session.Id} - {session.IpAddress || t("settings.notAvailable")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            color="warning"
            disabled={!selectedSessionToKeep || loading}
            onClick={() => selectedSessionToKeep && onRevokeAll(selectedSessionToKeep)}
          >
            {t("settings.revokeAll")}
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("settings.device")}</TableCell>
              <TableCell>{t("settings.ipAddress")}</TableCell>
              <TableCell>{t("settings.userAgent")}</TableCell>
              <TableCell>{t("settings.lastActivity")}</TableCell>
              <TableCell align="right">{t("settings.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.Id}>
                <TableCell>
                  {session.DeviceInfo?.device || session.DeviceInfo?.Device || t("settings.notAvailable")}
                </TableCell>
                <TableCell>{session.IpAddress || t("settings.notAvailable")}</TableCell>
                <TableCell sx={{ maxWidth: 240, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {session.UserAgent || t("settings.notAvailable")}
                </TableCell>
                <TableCell>
                  {session.LastActivityAt
                    ? formatDateTime(session.LastActivityAt)
                    : t("settings.notAvailable")}
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onRevoke(session.Id)}
                    disabled={loading}
                  >
                    {t("settings.revoke")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>{t("settings.noSessions")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SessionsTab;
