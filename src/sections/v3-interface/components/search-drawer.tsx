'use client';

import { useState, useRef, useEffect } from 'react';
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

import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type SearchDrawerProps = {
  open: boolean;
  onClose: () => void;
  onNewFocus?: () => void;
};

type FilterType = 'all' | 'active' | 'docs' | 'design';
type SortType = 'name' | 'recent';

// Sample search results - replace with actual data
const sampleResults = [
  { id: '1', title: 'Project Alpha', description: 'Main project workspace', tags: ['active', 'priority'], updatedAt: new Date('2024-12-20') },
  { id: '2', title: 'Design System', description: 'Component library and guidelines', tags: ['design'], updatedAt: new Date('2024-12-22') },
  { id: '3', title: 'API Documentation', description: 'Backend service documentation', tags: ['docs'], updatedAt: new Date('2024-12-21') },
];

export function SearchDrawer({ open, onClose, onNewFocus }: SearchDrawerProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showShine, setShowShine] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const inputRef = useRef<HTMLInputElement>(null);

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
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const renderHeader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
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
        placeholder="Search anything..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#9ca3af', ml: 1 }} />
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
      }}
    >
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {(['all', 'active', 'docs', 'design'] as FilterType[]).map((filter) => (
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

  // Filter and sort results
  const filteredResults = sampleResults
    .filter((result) => {
      // Text search filter
      const matchesSearch =
        !searchValue ||
        result.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        result.description.toLowerCase().includes(searchValue.toLowerCase());

      // Tag filter
      const matchesFilter =
        activeFilter === 'all' || result.tags.some((tag) => tag.includes(activeFilter));

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const renderResults = () => (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {filteredResults.map((result) => (
          <Card
            key={result.id}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {result.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {result.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {result.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="soft" color="primary" />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
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
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
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

