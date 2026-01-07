import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ProjectWizard } from './Wizard/ProjectWizard';
import type { IProject } from '@/types';

interface IEditProjectModalProps {
  Open: boolean;
  Project: IProject;
  OnClose: () => void;
}

export const EditProjectModal: React.FC<IEditProjectModalProps> = ({
  Open,
  Project,
  OnClose,
}) => {
  return (
    <Dialog
      open={Open}
      onClose={OnClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <IconButton
        onClick={OnClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <ProjectWizard initialData={Project} onClose={OnClose} />
      </DialogContent>
    </Dialog>
  );
};
