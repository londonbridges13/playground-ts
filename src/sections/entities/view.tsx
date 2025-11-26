'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import type { EntityTypeName, BaseEntity } from 'src/types/entities';

import { EntityTabs } from './components/entity-tabs';
import { EntityList } from './components/entity-list';
// Forms will be imported as they are created
import { AtlasForm } from './forms/atlas-form';
import { PathForm } from './forms/path-form';
import { MilestoneForm } from './forms/milestone-form';
import { HorizonForm } from './forms/horizon-form';
import { PathwayForm } from './forms/pathway-form';
import { StoryForm } from './forms/story-form';
import { InsightForm } from './forms/insight-form';
import { ArchetypeForm } from './forms/archetype-form';
import { PolarityForm } from './forms/polarity-form';
import { StepsForm } from './forms/steps-form';
import { BasisForm } from './forms/basis-form';
import { FocusForm } from './forms/focus-form';
import { DiscoveryForm } from './forms/discovery-form';

// ----------------------------------------------------------------------

function getUserIdFromStorage(): string {
  if (typeof window === 'undefined') return '';

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || '';
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }
  return '';
}

export function EntitiesView() {
  const [userId, setUserId] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<EntityTypeName>('atlas');

  // Get userId from localStorage on mount
  useEffect(() => {
    setUserId(getUserIdFromStorage());
  }, []);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleSuccess = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleError = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleEdit = (entity: BaseEntity) => {
    console.log('Edit entity:', entity);
    // TODO: Implement edit functionality
  };

  const renderForm = () => {
    if (!userId) {
      return (
        <Alert severity="warning">
          No user found in localStorage. Please log in first.
        </Alert>
      );
    }

    const commonProps = {
      userId,
      onSuccess: () => handleSuccess(`${currentTab} created successfully!`),
      onError: (err: Error) => handleError(err.message),
    };

    switch (currentTab) {
      case 'atlas':
        return <AtlasForm {...commonProps} />;
      case 'path':
        return <PathForm {...commonProps} />;
      case 'milestone':
        return <MilestoneForm {...commonProps} />;
      case 'horizon':
        return <HorizonForm {...commonProps} />;
      case 'pathway':
        return <PathwayForm {...commonProps} />;
      case 'story':
        return <StoryForm {...commonProps} />;
      case 'insight':
        return <InsightForm {...commonProps} />;
      case 'archetype':
        return <ArchetypeForm {...commonProps} />;
      case 'polarity':
        return <PolarityForm {...commonProps} />;
      case 'steps':
        return <StepsForm {...commonProps} />;
      case 'basis':
        return <BasisForm {...commonProps} />;
      case 'focus':
        return <FocusForm {...commonProps} />;
      case 'discovery':
        return <DiscoveryForm {...commonProps} />;
      default:
        return (
          <Typography color="text.secondary">
            Form for {currentTab} not implemented yet.
          </Typography>
        );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Entity CRUD Test
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Test create, read, update, and delete operations for all 13 entity types.
        </Typography>
      </Box>

      <EntityTabs currentTab={currentTab} onTabChange={setCurrentTab} />

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Form Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {renderForm()}
        </Box>

        {/* List Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <EntityList
            entityType={currentTab}
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

