/**
 * CopyLogButton — Deploy Center v3.0 / F-004 (T038).
 * Copies the visible log text to clipboard via navigator.clipboard with a
 * fallback to document.execCommand for older / non-HTTPS contexts. Surfaces
 * success/failure via a transient tooltip swap.
 */

import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';

interface IProps {
  text: string;
  size?: 'small' | 'medium';
  /** ms before the success/error icon reverts to the copy icon */
  resetMs?: number;
}

type Status = 'idle' | 'success' | 'error';

const fallbackCopy = (value: string): boolean => {
  // Last-resort fallback for non-secure-context browsers.
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
};

export const CopyLogButton: React.FC<IProps> = ({ text, size = 'small', resetMs = 1500 }) => {
  const [status, setStatus] = useState<Status>('idle');

  const handleClick = async () => {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        ok = fallbackCopy(text);
      }
    } catch {
      ok = false;
    }
    setStatus(ok ? 'success' : 'error');
    window.setTimeout(() => setStatus('idle'), resetMs);
  };

  const title =
    status === 'success' ? 'Copied!' : status === 'error' ? 'Copy failed' : 'Copy log to clipboard';
  const icon =
    status === 'success' ? (
      <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
    ) : status === 'error' ? (
      <ErrorIcon fontSize="small" sx={{ color: 'error.main' }} />
    ) : (
      <CopyIcon fontSize="small" />
    );

  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={text.length === 0}
          aria-label="Copy deployment log to clipboard"
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default CopyLogButton;
