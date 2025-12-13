'use client';

import { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence, useMotionValue } from 'framer-motion';
import type { Node } from '@xyflow/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

import { DialogBackgroundRenderer } from './dialog-background-renderer';
import { NovelEditor } from './novel-editor';

// ----------------------------------------------------------------------

const dismissDistance = 150;

const openSpring = { type: 'spring' as const, stiffness: 200, damping: 30 };
const closeSpring = { type: 'spring' as const, stiffness: 300, damping: 35 };

interface V3AppStoreDialogProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onStartChat?: (node: Node) => void;
}

export function V3AppStoreDialog({ open, node, onClose, onStartChat }: V3AppStoreDialogProps) {
  const y = useMotionValue(0);
  const zIndex = useMotionValue(open ? 2 : 0);
  const cardRef = useRef<HTMLDivElement>(null);

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
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!node) return null;

  const title = (node.data?.label as string) || 'Untitled';
  const category = (node.data?.category as string) || 'Node';

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
                {/* Background Image Section */}
                <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
                  <DialogBackgroundRenderer
                    nodeData={node.data as Record<string, any>}
                    width={600}
                    height={300}
                    id={node.id}
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
                          onStartChat(node);
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
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#fff',
                      fontWeight: 700,
                      mt: 0.5,
                    }}
                  >
                    {title}
                  </Typography>
                </Box>

                {/* Content Section */}
                <Box sx={{ p: 3 }}>
                  {/* Rich Content from NovelEditor */}
                  {node.data?.content ? (
                    <Box
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        mb: 3,
                        overflow: 'hidden',
                        // Override styles for dark theme
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
                        initialContent={node.data.content}
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

                  {/* Node Properties */}
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
                    {Boolean(node.data?.meshGradient) && (
                      <PropertyItem label="Background" value="Mesh Gradient" />
                    )}
                    {Boolean(node.data?.marbleBackground) && (
                      <PropertyItem label="Background" value="Marble" />
                    )}
                    {Boolean(node.data?.backgroundImage) && (
                      <PropertyItem label="Background" value="Image" />
                    )}
                    {Boolean(node.data?.patternOverlay) && (
                      <PropertyItem label="Pattern" value="SVG Overlay" />
                    )}
                    {((node.data?.grainAmount as number) ?? 0) > 0 && (
                      <PropertyItem label="Grain" value={`${node.data?.grainAmount}%`} />
                    )}
                    <PropertyItem label="Node ID" value={node.id} />
                    <PropertyItem label="Type" value={node.type || 'default'} />
                  </Box>
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

