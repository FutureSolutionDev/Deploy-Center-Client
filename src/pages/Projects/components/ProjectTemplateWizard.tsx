/**
 * ProjectTemplateWizard — Deploy Center v3.0 / F-008 (T084).
 *
 * Step 1 of the Create-Project flow. Lists every project template grouped by
 * category and lets the user either:
 *   - pick a template → wizard closes and reports the template (caller opens
 *     ProjectFormModal with the template's DefaultConfig pre-filled), OR
 *   - "Skip and start blank" → wizard closes with `null` (caller opens
 *     ProjectFormModal with defaults).
 *
 * The wizard is read-only; it doesn't create the project itself.
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  ProjectTemplateService,
  type IProjectTemplate,
  type EProjectTemplateCategory,
} from '@/services/projectTemplateService';

interface IProps {
  open: boolean;
  onClose: (chosen: IProjectTemplate | null | 'cancel') => void;
}

const CATEGORY_LABELS: Record<EProjectTemplateCategory, string> = {
  backend: 'Backend',
  frontend: 'Frontend',
  static: 'Static',
  other: 'Other',
};

export const ProjectTemplateWizard: React.FC<IProps> = ({ open, onClose }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['project-templates'],
    queryFn: () => ProjectTemplateService.list(),
    enabled: open,
    staleTime: 60_000,
  });

  const grouped = useMemo(() => {
    const map = new Map<EProjectTemplateCategory, IProjectTemplate[]>();
    for (const cat of ['backend', 'frontend', 'static', 'other'] as const) {
      map.set(cat, []);
    }
    for (const t of templates ?? []) {
      map.get(t.Category)!.push(t);
    }
    return map;
  }, [templates]);

  const selectedTemplate =
    templates?.find((t) => t.Id === selectedId) ?? null;

  const handleConfirm = (): void => {
    onClose(selectedTemplate);
  };

  const handleSkip = (): void => {
    onClose(null);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose('cancel')}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Choose a project template
        <Typography variant="body2" color="text.secondary">
          Pick a starting point — pipeline, ignore patterns, and variables will be pre-filled.
          You can edit everything in the next step.
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error">Failed to load templates. You can still skip and start blank.</Alert>
        )}

        {!isLoading && !error && (
          <Stack spacing={3}>
            {Array.from(grouped.entries()).map(([cat, items]) => {
              if (items.length === 0) return null;
              return (
                <Box key={cat}>
                  <Divider textAlign="left" sx={{ mb: 1 }}>
                    {CATEGORY_LABELS[cat]}
                  </Divider>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    {items.map((t) => {
                      const selected = t.Id === selectedId;
                      return (
                        <Card
                          key={t.Id}
                          variant={selected ? 'elevation' : 'outlined'}
                          sx={{
                            outline: selected ? '2px solid' : 'none',
                            outlineColor: 'primary.main',
                          }}
                        >
                          <CardActionArea onClick={() => setSelectedId(t.Id)}>
                            <CardContent>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {t.Name}
                                </Typography>
                                {t.IsBuiltIn && (
                                  <Chip
                                    label="Built-in"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                {t.Description}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSkip}>Skip and start blank</Button>
        <Button onClick={() => onClose('cancel')}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!selectedTemplate || isLoading}
          onClick={handleConfirm}
        >
          Use this template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectTemplateWizard;
