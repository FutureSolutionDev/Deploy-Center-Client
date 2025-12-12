import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import type { IApiKey } from "@/types";

export interface ICreateApiKeyInput {
  name: string;
  scopes: string[];
  expiresAt?: Date | null;
}

interface IApiKeysTabProps {
  apiKeys: IApiKey[];
  loading?: boolean;
  onGenerate: (input: ICreateApiKeyInput) => Promise<{ key: string; prefix: string } | null>;
  onRevoke: (id: number) => Promise<void>;
  availableScopes?: string[];
  t: (key: string) => string;
}

const DEFAULT_SCOPES = [
  "deployments:read",
  "deployments:write",
  "projects:read",
  "projects:write",
  "admin:*",
];

export const ApiKeysTab: React.FC<IApiKeysTabProps> = ({
  apiKeys,
  loading,
  onGenerate,
  onRevoke,
  availableScopes,
  t,
}) => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScopes, setNewScopes] = useState<string[]>(["deployments:read"]);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const scopes = useMemo(() => availableScopes || DEFAULT_SCOPES, [availableScopes]);

  const handleCloseDialog = () => {
    setOpen(false);
    setGeneratedKey(null);
    setNewName("");
    setNewScopes(["deployments:read"]);
    setExpiresAt("");
  };

  const handleGenerate = async () => {
    const expiresDate = expiresAt ? new Date(expiresAt) : undefined;
    const result = await onGenerate({
      name: newName,
      scopes: newScopes,
      expiresAt: expiresDate || null,
    });
    if (result?.key) {
      setGeneratedKey(result.key);
    }
  };

  const copyToClipboard = (value: string) => {
    if (!value) return;
    void navigator.clipboard.writeText(value);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {t("settings.apiKeys")}
        </Typography>
        <Button startIcon={<VpnKeyIcon />} variant="contained" onClick={() => setOpen(true)} disabled={loading}>
          {t("settings.generateApiKey")}
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("settings.name")}</TableCell>
              <TableCell>{t("settings.scopes")}</TableCell>
              <TableCell>{t("settings.createdAt")}</TableCell>
              <TableCell>{t("settings.lastUsed")}</TableCell>
              <TableCell align="right">{t("settings.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.Id}>
                <TableCell>{key.Name}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {key.Scopes.map((scope) => (
                      <Chip size="small" key={scope} label={scope} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{new Date(key.CreatedAt).toLocaleString()}</TableCell>
                <TableCell>{key.LastUsedAt ? new Date(key.LastUsedAt).toLocaleString() : t("settings.notAvailable")}</TableCell>
                <TableCell align="right">
                  <Tooltip title={t("settings.revoke")}>
                    <Button
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => onRevoke(key.Id)}
                      disabled={loading}
                    >
                      {t("settings.revoke")}
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {apiKeys.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>{t("settings.noApiKeys")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t("settings.generateApiKey")}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="normal"
            label={t("settings.name")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>{t("settings.scopes")}</InputLabel>
            <Select
              multiple
              value={newScopes}
              onChange={(e) => setNewScopes(e.target.value as string[])}
              input={<OutlinedInput label={t("settings.scopes")} />}
              renderValue={(selected) => selected.join(", ")}
            >
              {scopes.map((scope) => (
                <MenuItem key={scope} value={scope}>
                  {scope}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            type="date"
            label={t("settings.expiresAt")}
            InputLabelProps={{ shrink: true }}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />

          {generatedKey && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t("settings.copyYourKey")}
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  wordBreak: "break-all",
                }}
              >
                <Typography variant="body2">{generatedKey}</Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyToClipboard(generatedKey)}
                  variant="outlined"
                >
                  {t("settings.copy")}
                </Button>
              </Box>
              <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                {t("settings.copyWarning")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("settings.cancel")}</Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={!newName || loading}
          >
            {t("settings.generate")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeysTab;
