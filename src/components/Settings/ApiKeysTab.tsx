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
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useDateFormatter } from "@/hooks/useDateFormatter";

export interface ICreateApiKeyInput {
  name: string;
  scopes: string[];
  expiresAt?: Date | null;
}

import { useToast } from "@/contexts/ToastContext";
import {
  useApiKeys,
  useGenerateApiKey,
  useRevokeApiKey,
  useReactivateApiKey,
  useRegenerateApiKey,
} from "@/hooks/useUserSettings";

interface IApiKeysTabProps {
  t: (key: string) => string;
}

const DEFAULT_SCOPES = [
  "deployments:read",
  "deployments:write",
  "projects:read",
  "projects:write",
  "admin:*",
];

export const ApiKeysTab: React.FC<IApiKeysTabProps> = ({ t }) => {
  const { showSuccess, showError } = useToast();
  const { data: apiKeys = [], isLoading: loading } = useApiKeys();
  const generateApiKey = useGenerateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const reactivateApiKey = useReactivateApiKey();
  const regenerateApiKey = useRegenerateApiKey();
  const { formatDateTime } = useDateFormatter();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScopes, setNewScopes] = useState<string[]>(["deployments:read"]);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [regeneratedKey, setRegeneratedKey] = useState<{ id: number; key: string } | null>(null);
  const scopes = useMemo(() => DEFAULT_SCOPES, []);

  const handleCloseDialog = () => {
    setOpen(false);
    setGeneratedKey(null);
    setNewName("");
    setNewScopes(["deployments:read"]);
    setExpiresAt("");
  };

  const handleGenerate = async () => {
    try {
      const expiresDate = expiresAt ? new Date(expiresAt) : undefined;
      const result = await generateApiKey.mutateAsync({
        name: newName,
        scopes: newScopes,
        expiresAt: expiresDate || undefined,
      });
      if (result?.key) {
        setGeneratedKey(result.key);
      }
    } catch {
      showError(t("settings.saveFailed"));
    }
  };

  const copyToClipboard = (value: string) => {
    if (!value) return;
    void navigator.clipboard.writeText(value);
    showSuccess(t("common.copiedToClipboard"));
  };

  const handleReactivate = async (id: number) => {
    reactivateApiKey.mutate(id, {
      onSuccess: () => showSuccess("API key reactivated successfully"),
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const handleRegenerate = async (id: number) => {
    try {
      const result = await regenerateApiKey.mutateAsync(id);
      if (result?.key) {
        setRegeneratedKey({ id, key: result.key });
      }
    } catch {
      showError(t("settings.saveFailed"));
    }
  };

  const handleRevoke = async (id: number) => {
    revokeApiKey.mutate(id, {
      onSuccess: () => showSuccess(t("settings.saveSuccess") || "API key revoked successfully"),
      onError: () => showError(t("settings.saveFailed")),
    });
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
                <TableCell>{formatDateTime(key.CreatedAt)}</TableCell>
                <TableCell>{key.LastUsedAt ? formatDateTime(key.LastUsedAt) : t("settings.notAvailable")}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    {!key.IsActive && (
                      <Tooltip title="Reactivate">
                        <Button
                          color="success"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleReactivate(key.Id)}
                          disabled={loading}
                        >
                          Reactivate
                        </Button>
                      </Tooltip>
                    )}
                    {key.IsActive && (
                      <Tooltip title="Regenerate">
                        <Button
                          color="warning"
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={() => handleRegenerate(key.Id)}
                          disabled={loading}
                        >
                          Regenerate
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip title={t("settings.revoke")}>
                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleRevoke(key.Id)}
                        disabled={loading}
                      >
                        {t("settings.revoke")}
                      </Button>
                    </Tooltip>
                  </Box>
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

      {/* Regenerated Key Dialog */}
      <Dialog open={!!regeneratedKey} onClose={() => setRegeneratedKey(null)} fullWidth maxWidth="sm">
        <DialogTitle>API Key Regenerated Successfully</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            Your new API key (copy it now, it won't be shown again):
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
            <Typography variant="body2">{regeneratedKey?.key}</Typography>
            <Button
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={() => regeneratedKey && copyToClipboard(regeneratedKey.key)}
              variant="outlined"
            >
              {t("settings.copy")}
            </Button>
          </Box>
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
            {t("settings.copyWarning")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegeneratedKey(null)} variant="contained">
            {t("settings.close") || "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeysTab;
