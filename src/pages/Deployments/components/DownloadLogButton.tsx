/**
 * DownloadLogButton — Deploy Center v3.0 / F-004 (T038).
 * Fetches the deployment log file via authenticated axios → triggers a browser
 * download of `deployment-{id}.log`. Uses the axios instance so the cookie /
 * Bearer token attached to ApiInstance flows through.
 */

import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import ApiInstance from '@/services/api';

interface IProps {
  deploymentId: number;
  size?: 'small' | 'medium';
}

export const DownloadLogButton: React.FC<IProps> = ({ deploymentId, size = 'small' }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setDownloading(true);
    setError(null);
    try {
      const response = await ApiInstance.get(`/deployments/${deploymentId}/log/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data as BlobPart], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deployment-${deploymentId}.log`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { Message?: string } } })?.response?.data?.Message ??
        'Download failed';
      setError(msg);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Tooltip title={error ?? 'Download log file'}>
      <span>
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={downloading}
          aria-label="Download deployment log"
          sx={{ color: error ? 'error.main' : 'rgba(255,255,255,0.7)' }}
        >
          {downloading ? <CircularProgress size={16} /> : <DownloadIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default DownloadLogButton;
