'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';
import type { JSONContent } from 'novel';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import CloseIcon from '@mui/icons-material/Close';

import { Iconify } from 'src/components/iconify';

import { NovelEditor } from './novel-editor';
import type { FloatingNodeFormProps, NodeFormData, NodeShape } from '../types';

// ----------------------------------------------------------------------

const DEFAULT_POSITION = { x: 24, y: 100 };
const DEFAULT_SIZE = { width: 480, height: 560 };
const MIN_WIDTH = 400;
const MIN_HEIGHT = 480;
const MAX_WIDTH = 700;
const MAX_HEIGHT_RATIO = 0.9;

// Background presets for Magic Hex nodes (12 mesh backgrounds)
const BACKGROUND_PRESETS = [
  { id: 'magic1', label: 'Magic 1', image: '/magic-mg1.png' },
  { id: 'magic2', label: 'Magic 2', image: '/magic-mg2.png' },
  { id: 'magic3', label: 'Magic 3', image: '/mesh/magic3.png' },
  { id: 'magic4', label: 'Magic 4', image: '/mesh/magic4.png' },
  { id: 'magic5', label: 'Magic 5', image: '/mesh/magic5.png' },
  { id: 'magic6', label: 'Magic 6', image: '/mesh/magic6.png' },
  { id: 'magic7', label: 'Magic 7', image: '/mesh/magic7.png' },
  { id: 'magic8', label: 'Magic 8', image: '/mesh/magic8.png' },
  { id: 'magic9', label: 'Magic 9', image: '/mesh/magic9.png' },
  { id: 'magic10', label: 'Magic 10', image: '/mesh/magic10.png' },
  { id: 'magic11', label: 'Magic 11', image: '/mesh/magic11.png' },
  { id: 'magic12', label: 'Magic 12', image: '/mesh/magic12.png' },
  { id: 'none', label: 'None', image: null },
];

// SVG Pattern overlays
const PATTERN_PRESETS = [
  { id: 'none', label: 'None', pattern: null },
  { id: 'pattern1', label: 'Pattern 1', pattern: '/node-patterns/pattern-1.svg' },
  { id: 'pattern2', label: 'Pattern 2', pattern: '/node-patterns/pattern-2.svg' },
];

// Shape presets for node creation
const SHAPE_PRESETS: { id: NodeShape; label: string; icon: string }[] = [
  { id: 'hexagon', label: 'Hexagon', icon: 'tabler:hexagon' },
  { id: 'circular', label: 'Circle', icon: 'tabler:circle' },
  { id: 'rectangle', label: 'Rectangle', icon: 'tabler:square' },
  { id: 'diamond', label: 'Diamond', icon: 'tabler:diamond' },
  { id: 'oval', label: 'Oval', icon: 'tabler:oval' },
  { id: 'pill', label: 'Pill', icon: 'tabler:pill' },
  { id: 'triangle', label: 'Triangle', icon: 'tabler:triangle' },
  { id: 'pentagon', label: 'Pentagon', icon: 'tabler:pentagon' },
  { id: 'octagon', label: 'Octagon', icon: 'tabler:octagon' },
  { id: 'star', label: 'Star', icon: 'tabler:star' },
  { id: 'cloud', label: 'Cloud', icon: 'tabler:cloud' },
];

// ----------------------------------------------------------------------

export function FloatingNodeForm({
  open,
  onClose,
  onSave,
}: FloatingNodeFormProps) {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [label, setLabel] = useState('');
  const [content, setContent] = useState<JSONContent | null>(null);
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUND_PRESETS[0].id);
  const [selectedPattern, setSelectedPattern] = useState(PATTERN_PRESETS[0].id);
  const [selectedShape, setSelectedShape] = useState<NodeShape>(SHAPE_PRESETS[0].id);

  // Set initial position (right side) when opening
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      const padding = 24;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const newHeight = Math.min(DEFAULT_SIZE.height, viewportHeight - padding * 2);
      // Position on the right side of the screen
      const newX = viewportWidth - DEFAULT_SIZE.width - padding;
      const newY = (viewportHeight - newHeight) / 2;

      setSize({ width: DEFAULT_SIZE.width, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  }, [open]);

  // Reset form when closing
  useEffect(() => {
    if (!open) {
      setLabel('');
      setContent(null);
      setSelectedBackground(BACKGROUND_PRESETS[0].id);
      setSelectedPattern(PATTERN_PRESETS[0].id);
      setSelectedShape(SHAPE_PRESETS[0].id);
      setPosition(DEFAULT_POSITION);
      setSize(DEFAULT_SIZE);
    }
  }, [open]);

  const handleSave = useCallback(() => {
    const bgPreset = BACKGROUND_PRESETS.find((p) => p.id === selectedBackground);
    const patternPreset = PATTERN_PRESETS.find((p) => p.id === selectedPattern);
    const formData: NodeFormData = {
      label: label.trim() || 'New Node',
      content,
      backgroundImage: bgPreset?.image || null,
      patternOverlay: patternPreset?.pattern || null,
      shape: selectedShape,
    };
    onSave(formData);
    onClose();
  }, [label, content, selectedBackground, selectedPattern, selectedShape, onSave, onClose]);

  const handleContentChange = useCallback((newContent: JSONContent) => {
    setContent(newContent);
  }, []);

  // Don't render on server
  if (typeof window === 'undefined') return null;

  const renderHeader = () => (
    <Box
      className="drag-handle"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        pb: 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:add-circle-bold" width={24} sx={{ color: '#6366f1' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
          Create Node
        </Typography>
      </Box>
      <IconButton size="small" onClick={onClose} sx={{ color: '#6b7280' }}>
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );

  const renderForm = () => (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minHeight: 0,
      }}
    >
      {/* Label Field */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
          Label
        </Typography>
        <TextField
          fullWidth
          size="small"
          autoFocus
          placeholder="Enter node label..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f9fafb',
            },
          }}
        />
      </Box>

      {/* Content Editor */}
      <Box sx={{ flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
          Content
        </Typography>
        <Box
          sx={{
            flex: 1,
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#f9fafb',
          }}
        >
          <NovelEditor onChange={handleContentChange} />
        </Box>
      </Box>

      {/* Background Presets */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
          Background
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {BACKGROUND_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.label}
              onClick={() => setSelectedBackground(preset.id)}
              variant={selectedBackground === preset.id ? 'filled' : 'outlined'}
              size="small"
              sx={{
                bgcolor: selectedBackground === preset.id ? '#6366f1' : 'transparent',
                color: selectedBackground === preset.id ? 'white' : '#374151',
                borderColor: '#d1d5db',
                '&:hover': {
                  bgcolor: selectedBackground === preset.id ? '#4f46e5' : '#f3f4f6',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Pattern Overlay */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
          Pattern Overlay
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {PATTERN_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.label}
              onClick={() => setSelectedPattern(preset.id)}
              variant={selectedPattern === preset.id ? 'filled' : 'outlined'}
              size="small"
              sx={{
                bgcolor: selectedPattern === preset.id ? '#6366f1' : 'transparent',
                color: selectedPattern === preset.id ? 'white' : '#374151',
                borderColor: '#d1d5db',
                '&:hover': {
                  bgcolor: selectedPattern === preset.id ? '#4f46e5' : '#f3f4f6',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Shape Selection */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
          Shape
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {SHAPE_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.label}
              icon={<Iconify icon={preset.icon} width={16} />}
              onClick={() => setSelectedShape(preset.id)}
              variant={selectedShape === preset.id ? 'filled' : 'outlined'}
              size="small"
              sx={{
                bgcolor: selectedShape === preset.id ? '#6366f1' : 'transparent',
                color: selectedShape === preset.id ? 'white' : '#374151',
                borderColor: '#d1d5db',
                '& .MuiChip-icon': {
                  color: selectedShape === preset.id ? 'white' : '#6b7280',
                },
                '&:hover': {
                  bgcolor: selectedShape === preset.id ? '#4f46e5' : '#f3f4f6',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderFooter = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        p: 2,
        pt: 1.5,
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        justifyContent: 'flex-end',
      }}
    >
      <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, color: '#6b7280', borderColor: '#d1d5db' }}>
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={handleSave}
        startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
        sx={{
          borderRadius: 2,
          bgcolor: '#6366f1',
          '&:hover': { bgcolor: '#4f46e5' },
        }}
      >
        Create Node
      </Button>
    </Box>
  );

  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * MAX_HEIGHT_RATIO : 600;

  return createPortal(
    <AnimatePresence>
      {open && (
        /* Floating Panel - No backdrop, allows interaction with canvas */
        <m.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            <Rnd
              position={position}
              size={size}
              onDragStart={() => setIsDragging(true)}
              onDragStop={(e, d) => {
                setIsDragging(false);
                setPosition({ x: d.x, y: d.y });
              }}
              onResizeStop={(e, direction, ref, delta, pos) => {
                setSize({
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                });
                setPosition(pos);
              }}
              minWidth={MIN_WIDTH}
              minHeight={MIN_HEIGHT}
              maxWidth={MAX_WIDTH}
              maxHeight={maxHeight}
              bounds="window"
              enableResizing={{
                top: true, right: true, bottom: true, left: true,
                topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
              }}
              dragHandleClassName="drag-handle"
              style={{ pointerEvents: 'auto' }}
            >
              <Box
                ref={containerRef}
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgb(255, 255, 255)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {renderHeader()}
                {renderForm()}
                {renderFooter()}
              </Box>
            </Rnd>
          </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

