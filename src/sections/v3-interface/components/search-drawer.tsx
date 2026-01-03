'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

import { Iconify } from 'src/components/iconify';
import { useListFocuses, useListBases, useSearch } from '../hooks';
import type { FocusListItem, BasisListItem } from '../hooks';

// ----------------------------------------------------------------------

type SearchDrawerProps = {
  open: boolean;
  onClose: () => void;
  onNewFocus?: () => void;
  onSelectFocus?: (focus: FocusListItem) => void;
  onSelectBasis?: (basis: BasisListItem) => void;
};

type FilterType = 'all' | 'focuses' | 'bases';
type SortType = 'name' | 'recent';

export function SearchDrawer({ open, onClose, onNewFocus, onSelectFocus, onSelectBasis }: SearchDrawerProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showShine, setShowShine] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks for fetching data
  const { listFocuses, focuses, loading: focusesLoading, error: focusesError } = useListFocuses();
  const { listBases, bases, loading: basesLoading, error: basesError } = useListBases();
  const { search, results: searchResults, loading: searchLoading, error: searchError, clearResults } = useSearch();

  // Fetch data when drawer opens
  useEffect(() => {
    if (open) {
      listFocuses();
      listBases();
    }
  }, [open, listFocuses, listBases]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Trigger shine effect on open
      setShowShine(true);
      // Focus input when drawer opens
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = '';
      // Reset search state when drawer closes
      setSearchValue('');
      setIsSearchMode(false);
      clearResults();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, clearResults]);

  // Debounced semantic search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchValue.trim()) {
      setIsSearchMode(true);
      debounceRef.current = setTimeout(() => {
        const types: Array<'focus' | 'basis'> | undefined =
          activeFilter === 'focuses' ? ['focus'] :
          activeFilter === 'bases' ? ['basis'] :
          undefined;
        search(searchValue, types);
      }, 300);
    } else {
      setIsSearchMode(false);
      clearResults();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchValue, activeFilter, search, clearResults]);

  // Combined loading state
  const isLoading = focusesLoading || basesLoading || searchLoading;

  // Combined error
  const error = focusesError || basesError || searchError;

  // Handle focus click
  const handleFocusClick = useCallback((focus: FocusListItem) => {
    onSelectFocus?.(focus);
    onClose();
  }, [onSelectFocus, onClose]);

  // Handle basis click
  const handleBasisClick = useCallback((basis: BasisListItem) => {
    onSelectBasis?.(basis);
    onClose();
  }, [onSelectBasis, onClose]);

  const renderHeader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        flexShrink: 0,
      }}
    >
      <Iconify icon="hugeicons:sidebar-left" width={20} sx={{ color: '#6b7280' }} />
      <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );

  const renderSearchInput = () => (
    <Box
      sx={{
        position: 'relative',
        mx: 2,
        mt: 0.5,
        bgcolor: '#fafafa',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
        flexShrink: 0,
      }}
    >
      {/* Shine effect overlay - from FloatingTextInput */}
      <m.div
        initial={{ x: '-100%' }}
        animate={showShine ? { x: '200%' } : { x: '-100%' }}
        transition={{
          duration: 0.8,
          ease: 'easeInOut',
        }}
        onAnimationComplete={() => {
          if (showShine) setShowShine(false);
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      <TextField
        inputRef={inputRef}
        fullWidth
        placeholder="Search focuses and bases..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              {searchLoading ? (
                <CircularProgress size={18} sx={{ ml: 1 }} />
              ) : (
                <SearchIcon sx={{ color: '#9ca3af', ml: 1 }} />
              )}
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setSearchValue('')}
                sx={{ mr: 0.5 }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            fontSize: '1rem',
            color: '#374151',
            py: 0.75,
            px: 1.5,
          },
        }}
      />
    </Box>
  );

  const renderFilterOptions = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {(['all', 'focuses', 'bases'] as FilterType[]).map((filter) => (
          <Chip
            key={filter}
            label={filter.charAt(0).toUpperCase() + filter.slice(1)}
            size="small"
            variant={activeFilter === filter ? 'filled' : 'outlined'}
            color={activeFilter === filter ? 'primary' : 'default'}
            onClick={() => setActiveFilter(filter)}
            sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
          />
        ))}
      </Box>

      <Chip
        label={sortBy === 'name' ? 'Name' : 'Recent'}
        size="small"
        variant="outlined"
        onClick={() => setSortBy(sortBy === 'name' ? 'recent' : 'name')}
        icon={<Iconify icon="carbon:chevron-sort" width={14} />}
        sx={{ cursor: 'pointer' }}
      />
    </Box>
  );

  const renderQuickActions = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        px: 2,
        pb: 1.5,
        flexShrink: 0,
      }}
    >
      <Chip
        label="New Focus"
        size="small"
        icon={<Iconify icon="solar:add-circle-bold" width={16} />}
        onClick={() => {
          onNewFocus?.();
          onClose();
        }}
        sx={{
          cursor: 'pointer',
          bgcolor: 'primary.lighter',
          color: 'primary.dark',
          '&:hover': { bgcolor: 'primary.light' },
        }}
      />
    </Box>
  );

  // Filter and sort focuses for list view
  const filteredFocuses = useMemo(() => {
    if (isSearchMode) return [];
    return [...focuses].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [focuses, sortBy, isSearchMode]);

  // Filter and sort bases for list view
  const filteredBases = useMemo(() => {
    if (isSearchMode) return [];
    return [...bases].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [bases, sortBy, isSearchMode]);

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="80%" height={20} />
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              <Skeleton variant="rounded" width={60} height={24} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  // Render error state
  const renderError = () => (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography color="error" variant="body2">
        {error}
      </Typography>
      <Chip
        label="Retry"
        size="small"
        onClick={() => {
          listFocuses();
          listBases();
        }}
        sx={{ mt: 1, cursor: 'pointer' }}
      />
    </Box>
  );

  // Render empty state
  const renderEmpty = () => (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Iconify icon="solar:file-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
      <Typography color="text.secondary" variant="body2">
        {isSearchMode ? 'No results found' : 'No items yet'}
      </Typography>
    </Box>
  );

  // Render a focus card
  const renderFocusCard = (focus: FocusListItem) => (
    <Card
      key={focus.id}
      onClick={() => handleFocusClick(focus)}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        mb: 1.5,
        flexShrink: 0,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Iconify icon="solar:cup-star-bold" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {focus.title}
          </Typography>
        </Box>
        {focus.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, ml: 3.5 }}>
            {focus.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 0.5, ml: 3.5 }}>
          <Chip label="Focus" size="small" variant="soft" color="primary" />
          {focus.basesCount > 0 && (
            <Chip label={`${focus.basesCount} bases`} size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  // Render a basis card
  const renderBasisCard = (basis: BasisListItem) => (
    <Card
      key={basis.id}
      onClick={() => handleBasisClick(basis)}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        mb: 1.5,
        flexShrink: 0,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Iconify icon="solar:file-text-bold" width={18} sx={{ color: 'info.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {basis.title}
          </Typography>
        </Box>
        {basis.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, ml: 3.5 }}>
            {basis.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 0.5, ml: 3.5 }}>
          <Chip label="Basis" size="small" variant="soft" color="info" />
          <Chip label={basis.entityType} size="small" variant="outlined" />
        </Box>
      </CardContent>
    </Card>
  );

  // Render search results
  const renderSearchResults = () => {
    // Defensive: ensure arrays are always defined even if server returns undefined
    const searchFocuses = searchResults?.focuses || [];
    const searchBases = searchResults?.bases || [];
    const showFocuses = activeFilter === 'all' || activeFilter === 'focuses';
    const showBases = activeFilter === 'all' || activeFilter === 'bases';
    const hasResults = (showFocuses && searchFocuses.length > 0) || (showBases && searchBases.length > 0);

    if (!hasResults) {
      return renderEmpty();
    }

    return (
      <>
        {showFocuses && searchFocuses.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, mb: 1 }}>
              Focuses ({searchFocuses.length})
            </Typography>
            {searchFocuses.map((focus) => renderFocusCard({
              ...focus,
              imageUrl: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              basesCount: 0,
            }))}
          </>
        )}
        {showBases && searchBases.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, mb: 1, mt: showFocuses ? 2 : 0 }}>
              Bases ({searchBases.length})
            </Typography>
            {searchBases.map((basis) => renderBasisCard({
              ...basis,
              sourceEntityId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }))}
          </>
        )}
      </>
    );
  };

  // Render list results (non-search mode)
  const renderListResults = () => {
    const showFocuses = activeFilter === 'all' || activeFilter === 'focuses';
    const showBases = activeFilter === 'all' || activeFilter === 'bases';
    const hasResults = (showFocuses && filteredFocuses.length > 0) || (showBases && filteredBases.length > 0);

    if (!hasResults) {
      return renderEmpty();
    }

    return (
      <>
        {showFocuses && filteredFocuses.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, mb: 1 }}>
              Focuses ({filteredFocuses.length})
            </Typography>
            {filteredFocuses.map(renderFocusCard)}
          </>
        )}
        {showBases && filteredBases.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, mb: 1, mt: showFocuses ? 2 : 0 }}>
              Bases ({filteredBases.length})
            </Typography>
            {filteredBases.map(renderBasisCard)}
          </>
        )}
      </>
    );
  };

  const renderResults = () => (
    <Box
      sx={{
        flex: 1,
        minHeight: 0, // Important for flex scroll
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isLoading && renderLoadingSkeleton()}
      {!isLoading && error && renderError()}
      {!isLoading && !error && isSearchMode && renderSearchResults()}
      {!isLoading && !error && !isSearchMode && renderListResults()}
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        paper: {
          sx: {
            width: 1,
            maxWidth: 420,
            m: 2,
            borderRadius: '24px',
            maxHeight: 'calc(100vh - 32px)',
            bgcolor: 'rgb(253, 255, 255)',
            boxShadow: '40px 40px 80px -8px rgba(0, 0, 0, 0.24)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
      >
        {renderHeader()}
        {renderSearchInput()}
        {renderFilterOptions()}
        {renderQuickActions()}
        {renderResults()}
      </m.div>
    </Drawer>
  );
}

