'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import CloseIcon from '@mui/icons-material/Close';

import type { MentionTabsMenuProps, MentionTab } from '../types';

// ----------------------------------------------------------------------

// Sample tabs data - in real implementation, this would come from browser tabs API or props
const SAMPLE_TABS: MentionTab[] = [
  { id: '1', title: 'Multicolor Titanium', url: 'apple.com' },
  { id: '2', title: 'ACTIVE TU...', url: 'amazon.com' },
  { id: '3', title: 'React Documentation', url: 'react.dev' },
  { id: '4', title: 'GitHub - playground-ts', url: 'github.com' },
];

// ----------------------------------------------------------------------

export function MentionTabsMenu({
  open,
  anchorEl,
  onClose,
  onSelect,
  searchQuery = '',
}: MentionTabsMenuProps) {
  // Filter tabs based on search query
  const filteredTabs = SAMPLE_TABS.filter(
    (tab) =>
      tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTabClick = (tab: MentionTab) => {
    onSelect(tab);
  };

  if (!open) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        padding: 16,
        minWidth: 280,
        maxWidth: 340,
        zIndex: 10000,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography
          sx={{
            fontSize: 20,
            color: '#6b7280',
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          @
        </Typography>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
          Mention Tabs
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            ml: 'auto',
            color: '#9ca3af',
            '&:hover': { bgcolor: '#f3f4f6' },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Tab suggestions card */}
      <Card
        sx={{
          p: 1.5,
          bgcolor: '#f9fafb',
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid #e5e7eb',
        }}
      >
        <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6 }}>
          Should I buy{' '}
          <Typography
            component="span"
            onClick={() => handleTabClick(SAMPLE_TABS[0])}
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
              color: '#111827',
              fontWeight: 500,
              '&:hover': { color: '#22c55e' },
            }}
          >
            {SAMPLE_TABS[0].title}
          </Typography>
          {' '}or{' '}
          <Typography
            component="span"
            onClick={() => handleTabClick(SAMPLE_TABS[1])}
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
              color: '#111827',
              fontWeight: 500,
              '&:hover': { color: '#22c55e' },
            }}
          >
            {SAMPLE_TABS[1].title}
          </Typography>
          ?
        </Typography>
      </Card>

      {/* Helper text */}
      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}
        >
          Mention tabs to add context
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Type @ to mention a tab
        </Typography>
      </Box>

      {/* Tab list (shown when there are filtered results) */}
      {searchQuery && filteredTabs.length > 0 && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {filteredTabs.slice(0, 4).map((tab) => (
            <Box
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: '#f3f4f6' },
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 0.5,
                  bgcolor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#6b7280',
                }}
              >
                {tab.title.charAt(0).toUpperCase()}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#9ca3af',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {tab.url}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </m.div>
  );
}

