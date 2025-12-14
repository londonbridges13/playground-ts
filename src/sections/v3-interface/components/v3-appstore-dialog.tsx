'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence, useMotionValue } from 'framer-motion';
import type { Node, Edge } from '@xyflow/react';
import type { JSONContent } from 'novel';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';

import { Iconify } from 'src/components/iconify';

import { DialogBackgroundRenderer } from './dialog-background-renderer';
import { NovelEditor } from './novel-editor';
import type { NodeFormData, NodeShape } from '../types';
import type { SmartPulseButtonEdgeData } from '../edges';

// ----------------------------------------------------------------------

const dismissDistance = 150;

const openSpring = { type: 'spring' as const, stiffness: 200, damping: 30 };
const closeSpring = { type: 'spring' as const, stiffness: 300, damping: 35 };

// Background presets for nodes
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

// Shape presets for nodes
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

// Helper to find background preset ID from image path
function findBackgroundPresetId(imagePath: string | null | undefined): string {
  if (!imagePath) return 'none';
  const preset = BACKGROUND_PRESETS.find((p) => p.image === imagePath);
  return preset?.id || 'magic1';
}

// Helper to find pattern preset ID from pattern path
function findPatternPresetId(patternPath: string | null | undefined): string {
  if (!patternPath) return 'none';
  const preset = PATTERN_PRESETS.find((p) => p.pattern === patternPath);
  return preset?.id || 'none';
}

// Edge data update type
export interface EdgeDataUpdate {
  strokeColor?: string;
  strokeWidth?: number;
  buttonBgColor?: string;
}

interface V3AppStoreDialogProps {
  open: boolean;
  node: Node | null;
  edges?: Edge[];
  allNodes?: Node[];
  onClose: () => void;
  onStartChat?: (node: Node) => void;
  onSaveNode?: (nodeId: string, data: NodeFormData) => Node | void;
  onUpdateEdge?: (edgeId: string, data: EdgeDataUpdate) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

export function V3AppStoreDialog({
  open,
  node,
  edges = [],
  allNodes = [],
  onClose,
  onStartChat,
  onSaveNode,
  onUpdateEdge,
  onDeleteEdge,
}: V3AppStoreDialogProps) {
  const y = useMotionValue(0);
  const zIndex = useMotionValue(open ? 2 : 0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Local node state - tracks the current node data (updated after save)
  const [localNode, setLocalNode] = useState<Node | null>(node);

  // Sync localNode with prop when node changes (e.g., opening dialog for a different node)
  useEffect(() => {
    setLocalNode(node);
  }, [node]);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editContent, setEditContent] = useState<JSONContent | null>(null);
  const [selectedBackground, setSelectedBackground] = useState('magic1');
  const [selectedPattern, setSelectedPattern] = useState('none');
  const [selectedShape, setSelectedShape] = useState<NodeShape>('hexagon');

  // Initialize edit state when entering edit mode
  const handleEnterEditMode = useCallback(() => {
    if (!localNode) return;
    setEditLabel((localNode.data?.label as string) || '');
    setEditContent(localNode.data?.content || null);
    setSelectedBackground(findBackgroundPresetId(localNode.data?.backgroundImage as string));
    setSelectedPattern(findPatternPresetId(localNode.data?.patternOverlay as string));
    setSelectedShape((localNode.type as NodeShape) || 'hexagon');
    setIsEditing(true);
  }, [localNode]);

  // Cancel edit mode
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Save changes
  const handleSaveChanges = useCallback(() => {
    if (!localNode || !onSaveNode) return;
    const bgPreset = BACKGROUND_PRESETS.find((p) => p.id === selectedBackground);
    const patternPreset = PATTERN_PRESETS.find((p) => p.id === selectedPattern);
    const formData: NodeFormData = {
      label: editLabel.trim() || 'Untitled',
      content: editContent,
      backgroundImage: bgPreset?.image || null,
      patternOverlay: patternPreset?.pattern || null,
      shape: selectedShape,
    };
    const updatedNode = onSaveNode(localNode.id, formData);
    // Update local node state with the returned updated node
    if (updatedNode) {
      setLocalNode(updatedNode);
    }
    setIsEditing(false);
  }, [localNode, onSaveNode, editLabel, editContent, selectedBackground, selectedPattern, selectedShape]);

  // Handle content change from NovelEditor
  const handleContentChange = useCallback((newContent: JSONContent) => {
    setEditContent(newContent);
  }, []);

  // Create preview node data that updates in real-time during editing
  const previewNodeData = useMemo(() => {
    if (!localNode) return {};
    if (!isEditing) return localNode.data;

    // When editing, merge original node data with current edit selections
    const bgPreset = BACKGROUND_PRESETS.find((p) => p.id === selectedBackground);
    const patternPreset = PATTERN_PRESETS.find((p) => p.id === selectedPattern);

    return {
      ...localNode.data,
      backgroundImage: bgPreset?.image || null,
      patternOverlay: patternPreset?.pattern || null,
    };
  }, [localNode, isEditing, selectedBackground, selectedPattern]);

  // Get edges connected to this node
  const connectedEdges = useMemo(() => {
    if (!localNode) return [];
    return edges.filter((edge) => edge.source === localNode.id || edge.target === localNode.id);
  }, [edges, localNode]);

  // Helper to get node label by ID
  const getNodeLabel = useCallback(
    (nodeId: string): string => {
      const foundNode = allNodes.find((n) => n.id === nodeId);
      return (foundNode?.data?.label as string) || nodeId;
    },
    [allNodes]
  );

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Reset edit mode when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  // Handle swipe to dismiss
  const checkSwipeToDismiss = useCallback(() => {
    if (y.get() > dismissDistance) {
      onClose();
    }
  }, [y, onClose]);

  // Handle z-index updates
  const checkZIndex = useCallback((latest: any) => {
    if (open) {
      zIndex.set(2);
    } else if (!open && latest.scaleX < 1.01) {
      zIndex.set(0);
    }
  }, [open, zIndex]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        if (isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose, isEditing, handleCancelEdit]);

  if (!localNode) return null;

  const title = (localNode.data?.label as string) || 'Untitled';
  const category = (localNode.data?.category as string) || 'Node';

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 9998,
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Card Dialog */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <m.div
              ref={cardRef}
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={open ? openSpring : closeSpring}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDrag={checkSwipeToDismiss}
              onUpdate={checkZIndex}
              style={{
                y,
                zIndex,
                width: '90%',
                maxWidth: '600px',
                maxHeight: '85vh',
                backgroundColor: '#1a1a2e',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0px 24px 64px rgba(0, 0, 0, 0.5)',
                pointerEvents: 'auto',
                position: 'relative',
              }}
            >
              {/* Close Button */}
              <IconButton
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <Iconify icon="mingcute:close-line" width={20} />
              </IconButton>

              {/* Scrollable Content */}
              <Box
                sx={{
                  width: '100%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {/* Background Image Section - Uses preview data for real-time updates */}
                <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
                  <DialogBackgroundRenderer
                    nodeData={previewNodeData as Record<string, any>}
                    width={600}
                    height={300}
                    id={localNode.id}
                  />

                  {/* Chat Button - Lower Right Corner */}
                  {onStartChat && (
                    <Tooltip
                      title="Start Chat"
                      placement="left"
                      slotProps={{
                        popper: {
                          sx: { zIndex: 10000 },
                        },
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          onStartChat(localNode!);
                          onClose();
                        }}
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          right: 12,
                          zIndex: 10,
                          backgroundColor: 'rgba(99, 102, 241, 0.9)',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: 'rgba(99, 102, 241, 1)',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <Iconify icon="hugeicons:chat" width={22} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Title Section */}
                <Box
                  sx={{
                    p: 3,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem',
                      letterSpacing: 1,
                    }}
                  >
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                    {isEditing ? (
                      <TextField
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="Node title"
                        autoFocus
                        sx={{
                          mr: 2,
                          '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'rgba(99, 102, 241, 0.8)',
                            },
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255, 255, 255, 0.4)',
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        variant="h4"
                        sx={{
                          color: '#fff',
                          fontWeight: 700,
                        }}
                      >
                        {title}
                      </Typography>
                    )}
                    {onSaveNode && !isEditing && (
                      <Tooltip
                        title="Edit Node"
                        placement="left"
                        slotProps={{
                          popper: {
                            sx: { zIndex: 10000 },
                          },
                        }}
                      >
                        <IconButton
                          onClick={handleEnterEditMode}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                              color: '#fff',
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          <Iconify icon="hugeicons:pencil-edit-02" width={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {/* Content Section */}
                <Box sx={{ p: 3 }}>
                  {/* Rich Content from NovelEditor */}
                  {isEditing ? (
                    <Box
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        mb: 3,
                        overflow: 'hidden',
                        minHeight: 200,
                        '& .tiptap': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          minHeight: 150,
                          '& p': {
                            color: 'rgba(255, 255, 255, 0.8)',
                          },
                          '& h1, & h2, & h3': {
                            color: '#fff',
                          },
                          '& blockquote': {
                            borderLeftColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.6)',
                          },
                          '& code': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '& pre': {
                            bgcolor: 'rgba(0, 0, 0, 0.3)',
                          },
                        },
                      }}
                    >
                      <NovelEditor
                        key="edit-mode"
                        initialContent={editContent || undefined}
                        onChange={handleContentChange}
                        editable
                      />
                    </Box>
                  ) : localNode.data?.content ? (
                    <Box
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        mb: 3,
                        overflow: 'hidden',
                        '& .tiptap': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          minHeight: 'auto',
                          cursor: 'default',
                          '& p': {
                            color: 'rgba(255, 255, 255, 0.8)',
                          },
                          '& h1, & h2, & h3': {
                            color: '#fff',
                          },
                          '& blockquote': {
                            borderLeftColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.6)',
                          },
                          '& code': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '& pre': {
                            bgcolor: 'rgba(0, 0, 0, 0.3)',
                          },
                        },
                      }}
                    >
                      <NovelEditor
                        key="view-mode"
                        initialContent={localNode.data.content}
                        editable={false}
                      />
                    </Box>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontStyle: 'italic',
                        mb: 3,
                      }}
                    >
                      No content
                    </Typography>
                  )}

                  {/* Edit Mode: Background, Pattern, Shape Selectors */}
                  {isEditing && (
                    <>
                      {/* Background Selection */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            mb: 1.5,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: '0.7rem',
                          }}
                        >
                          Background
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          {BACKGROUND_PRESETS.map((preset) => (
                            <Tooltip key={preset.id} title={preset.label} arrow>
                              <Box
                                onClick={() => setSelectedBackground(preset.id)}
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 1.5,
                                  cursor: 'pointer',
                                  backgroundImage: preset.image ? `url(${preset.image})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  bgcolor: preset.image ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                                  border: selectedBackground === preset.id
                                    ? '2px solid rgba(99, 102, 241, 1)'
                                    : '2px solid rgba(255, 255, 255, 0.2)',
                                  boxShadow: selectedBackground === preset.id
                                    ? '0 0 0 2px rgba(99, 102, 241, 0.3)'
                                    : 'none',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  '&:hover': {
                                    borderColor: 'rgba(99, 102, 241, 0.8)',
                                    transform: 'scale(1.05)',
                                  },
                                }}
                              >
                                {!preset.image && (
                                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.6rem' }}>
                                    None
                                  </Typography>
                                )}
                              </Box>
                            </Tooltip>
                          ))}
                        </Box>
                      </Box>

                      {/* Pattern Selection */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            mb: 1.5,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: '0.7rem',
                          }}
                        >
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
                                bgcolor: selectedPattern === preset.id ? 'rgba(99, 102, 241, 0.9)' : 'transparent',
                                color: selectedPattern === preset.id ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                '&:hover': {
                                  bgcolor: selectedPattern === preset.id ? 'rgba(99, 102, 241, 1)' : 'rgba(255, 255, 255, 0.1)',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Shape Selection */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            mb: 1.5,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: '0.7rem',
                          }}
                        >
                          Shape
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {SHAPE_PRESETS.map((preset) => (
                            <Chip
                              key={preset.id}
                              label={preset.label}
                              icon={<Iconify icon={preset.icon as any} width={16} sx={{ color: 'inherit !important' }} />}
                              onClick={() => setSelectedShape(preset.id)}
                              variant={selectedShape === preset.id ? 'filled' : 'outlined'}
                              size="small"
                              sx={{
                                bgcolor: selectedShape === preset.id ? 'rgba(99, 102, 241, 0.9)' : 'transparent',
                                color: selectedShape === preset.id ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                '& .MuiChip-icon': {
                                  color: selectedShape === preset.id ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                },
                                '&:hover': {
                                  bgcolor: selectedShape === preset.id ? 'rgba(99, 102, 241, 1)' : 'rgba(255, 255, 255, 0.1)',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Connections Section */}
                      {connectedEdges.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              mb: 1.5,
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                              fontSize: '0.7rem',
                            }}
                          >
                            Connections ({connectedEdges.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {connectedEdges.map((edge) => {
                              const edgeData = (edge.data || {}) as SmartPulseButtonEdgeData;
                              const isOutgoing = edge.source === localNode?.id;
                              const connectedNodeId = isOutgoing ? edge.target : edge.source;
                              const connectedNodeLabel = getNodeLabel(connectedNodeId);

                              return (
                                <Box
                                  key={edge.id}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                  }}
                                >
                                  {/* Connection Header */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Iconify
                                        icon={(isOutgoing ? 'solar:arrow-right-bold' : 'solar:arrow-left-bold') as any}
                                        width={16}
                                        sx={{ color: edgeData.strokeColor || 'rgba(158, 122, 255, 0.8)' }}
                                      />
                                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                        {isOutgoing ? 'To: ' : 'From: '}
                                        <strong>{connectedNodeLabel}</strong>
                                      </Typography>
                                    </Box>
                                    {onDeleteEdge && (
                                      <Tooltip title="Delete connection">
                                        <IconButton
                                          size="small"
                                          onClick={() => onDeleteEdge(edge.id)}
                                          sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
                                          }}
                                        >
                                          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>

                                  {/* Edge Properties */}
                                  {onUpdateEdge && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {/* Stroke Color */}
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', minWidth: 80 }}>
                                          Line Color
                                        </Typography>
                                        <input
                                          type="color"
                                          value={edgeData.strokeColor || '#9e7aff'}
                                          onChange={(e) => onUpdateEdge(edge.id, { strokeColor: e.target.value })}
                                          style={{
                                            width: 32,
                                            height: 24,
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            backgroundColor: 'transparent',
                                          }}
                                        />
                                      </Box>

                                      {/* Stroke Width */}
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', minWidth: 80 }}>
                                          Line Width
                                        </Typography>
                                        <Slider
                                          size="small"
                                          value={edgeData.strokeWidth || 2.5}
                                          min={1}
                                          max={6}
                                          step={0.5}
                                          onChange={(_, value) => onUpdateEdge(edge.id, { strokeWidth: value as number })}
                                          sx={{
                                            flex: 1,
                                            color: 'rgba(99, 102, 241, 0.9)',
                                            '& .MuiSlider-thumb': { width: 14, height: 14 },
                                          }}
                                        />
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', minWidth: 24 }}>
                                          {edgeData.strokeWidth || 2.5}
                                        </Typography>
                                      </Box>

                                      {/* Button Background Color */}
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', minWidth: 80 }}>
                                          Button Color
                                        </Typography>
                                        <input
                                          type="color"
                                          value={edgeData.buttonBgColor?.replace(/rgba?\([^)]+\)/, '#9e7aff') || '#9e7aff'}
                                          onChange={(e) => onUpdateEdge(edge.id, { buttonBgColor: e.target.value })}
                                          style={{
                                            width: 32,
                                            height: 24,
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            backgroundColor: 'transparent',
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      )}

                      {/* Save/Cancel Buttons */}
                      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                          sx={{
                            borderRadius: 2,
                            color: 'rgba(255, 255, 255, 0.7)',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              bgcolor: 'rgba(255, 255, 255, 0.05)',
                            },
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSaveChanges}
                          startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'rgba(99, 102, 241, 0.9)',
                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 1)' },
                          }}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </>
                  )}

                  {/* View Mode: Node Properties */}
                  {!isEditing && (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          mb: 2,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          fontSize: '0.7rem',
                        }}
                      >
                        Node Properties
                      </Typography>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 2,
                        }}
                      >
                        {Boolean(localNode.data?.meshGradient) && (
                          <PropertyItem label="Background" value="Mesh Gradient" />
                        )}
                        {Boolean(localNode.data?.marbleBackground) && (
                          <PropertyItem label="Background" value="Marble" />
                        )}
                        {Boolean(localNode.data?.backgroundImage) && (
                          <PropertyItem label="Background" value="Image" />
                        )}
                        {Boolean(localNode.data?.patternOverlay) && (
                          <PropertyItem label="Pattern" value="SVG Overlay" />
                        )}
                        {((localNode.data?.grainAmount as number) ?? 0) > 0 && (
                          <PropertyItem label="Grain" value={`${localNode.data?.grainAmount}%`} />
                        )}
                        <PropertyItem label="Node ID" value={localNode.id} />
                        <PropertyItem label="Type" value={localNode.type || 'default'} />
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </m.div>
          </Box>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Helper component for property items
function PropertyItem({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255, 255, 255, 0.4)',
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#fff',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

