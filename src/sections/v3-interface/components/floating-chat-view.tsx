'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

import CloseIcon from '@mui/icons-material/Close';

import { Iconify } from 'src/components/iconify';

import { CompassIcon } from './compass-icon';
import { FloatingTextInput } from './floating-text-input';
import type { FloatingChatViewProps, ChatMessage, QuickAction } from '../types';

// ----------------------------------------------------------------------

const DEFAULT_POSITION = { x: 24, y: 100 };
const DEFAULT_SIZE = { width: 400, height: 520 };
const MIN_WIDTH = 320;
const MIN_HEIGHT = 400;
const MAX_WIDTH = 600;
const MAX_HEIGHT_RATIO = 0.9; // 90% of viewport height

// ----------------------------------------------------------------------

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'analyze', label: 'Analyze', icon: 'solar:eye-bold', action: 'analyze' },
  { id: 'explain', label: 'Explain', icon: 'solar:list-bold', action: 'explain' },
  { id: 'summarize', label: 'Summarize', icon: 'solar:file-text-bold', action: 'summarize' },
];

// ----------------------------------------------------------------------

export function FloatingChatView({
  open,
  onClose,
  initialMessage,
}: FloatingChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
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

  // Set initial position (right-aligned) and size (full height) when opening
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      const padding = 24;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Calculate height to fill screen with padding
      const newHeight = Math.min(viewportHeight - padding * 2, viewportHeight * MAX_HEIGHT_RATIO);

      // Calculate x position to align to right
      const newX = viewportWidth - DEFAULT_SIZE.width - padding;

      setSize({ width: DEFAULT_SIZE.width, height: newHeight });
      setPosition({ x: newX, y: padding });
    }
  }, [open]);

  // Reset position and size when closing
  useEffect(() => {
    if (!open) {
      setPosition(DEFAULT_POSITION);
      setSize(DEFAULT_SIZE);
    }
  }, [open]);

  // Handle initial message
  useEffect(() => {
    if (open && initialMessage && messages.length === 0) {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: initialMessage,
        timestamp: new Date(),
      };
      setMessages([userMessage]);
      setIsTyping(true);

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `I'll help you with that. You asked: "${initialMessage}"\n\nThis is a demo response. In a real implementation, this would connect to an AI model.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    }
  }, [open, initialMessage, messages.length]);

  // Reset messages when closed
  useEffect(() => {
    if (!open) {
      setMessages([]);
    }
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback((message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'This is a demo response. In a real implementation, this would connect to an AI model.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  }, []);

  const handleQuickAction = (action: QuickAction['action']) => {
    const actionMessages: Record<QuickAction['action'], string> = {
      analyze: 'Analyze the current page',
      explain: "Explain what's happening on this page",
      summarize: 'Summarize the content of this page',
    };
    handleSend(actionMessages[action]);
  };

  // Don't render on server
  if (typeof window === 'undefined') return null;

  const renderHeader = () => (
    <Box
      className="drag-handle"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Toggle Sidebar" arrow slotProps={{ popper: { sx: { zIndex: 10000 } } }}>
          <IconButton size="small" sx={{ color: '#9ca3af' }}>
            <Iconify icon="hugeicons:sidebar-left" width={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="New Chat" arrow slotProps={{ popper: { sx: { zIndex: 10000 } } }}>
          <IconButton size="small" sx={{ color: '#6b7280' }}>
            <Iconify icon="hugeicons:pencil-edit-02" width={20} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title="AI Model" arrow slotProps={{ popper: { sx: { zIndex: 10000 } } }}>
          <IconButton size="small" sx={{ color: '#6b7280' }}>
            <Iconify icon="tabler:user-hexagon" width={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Explore" arrow slotProps={{ popper: { sx: { zIndex: 10000 } } }}>
          <IconButton size="small" sx={{ color: '#6b7280', p: 0.5 }}>
            <CompassIcon size={20} color="#6b7280" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Close" arrow slotProps={{ popper: { sx: { zIndex: 10000 } } }}>
          <IconButton size="small" onClick={onClose} sx={{ color: '#6b7280' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const renderMessages = () => (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2,
        py: 2,
        minHeight: 0,
      }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Ask a question about this page...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: message.role === 'user' ? '#111827' : '#22c55e',
                  flexShrink: 0,
                }}
              >
                <Iconify
                  icon={message.role === 'user' ? 'solar:user-rounded-bold' : 'solar:chat-round-dots-bold'}
                  width={16}
                />
              </Avatar>
              <Box
                sx={{
                  maxWidth: '80%',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: message.role === 'user' ? '#111827' : 'white',
                  color: message.role === 'user' ? 'white' : '#374151',
                  boxShadow: message.role === 'assistant' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}

          {isTyping && (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#22c55e', flexShrink: 0 }}>
                <Iconify icon="solar:chat-round-dots-bold" width={16} />
              </Avatar>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[0, 150, 300].map((delay, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 6,
                        height: 6,
                        bgcolor: '#9ca3af',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out',
                        animationDelay: `${delay}ms`,
                        '@keyframes bounce': {
                          '0%, 80%, 100%': { transform: 'scale(0)' },
                          '40%': { transform: 'scale(1)' },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>
      )}
    </Box>
  );

  const renderQuickActions = () => (
    <Box sx={{ display: 'flex', gap: 1, px: 1, pb: 1, flexWrap: 'wrap' }}>
      {QUICK_ACTIONS.map((action) => (
        <Chip
          key={action.id}
          icon={<Iconify icon={action.icon as any} width={16} />}
          label={action.label}
          onClick={() => handleQuickAction(action.action)}
          sx={{
            bgcolor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            '&:hover': { bgcolor: '#f3f4f6' },
            '& .MuiChip-icon': { color: '#6b7280' },
          }}
        />
      ))}
    </Box>
  );

  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * MAX_HEIGHT_RATIO : 600;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Floating Panel with Rnd */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              dragHandleClassName="drag-handle"
              style={{
                pointerEvents: 'auto',
              }}
              resizeHandleStyles={{
                top: { cursor: 'n-resize' },
                right: { cursor: 'e-resize' },
                bottom: { cursor: 's-resize' },
                left: { cursor: 'w-resize' },
                topRight: { cursor: 'ne-resize' },
                bottomRight: { cursor: 'se-resize' },
                bottomLeft: { cursor: 'sw-resize' },
                topLeft: { cursor: 'nw-resize' },
              }}
            >
              <Box
                ref={containerRef}
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgb(253, 255, 255)',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Scrollable content area */}
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {renderHeader()}
                  {renderMessages()}
                </Box>
                {/* Fixed bottom section: Quick actions + Input */}
                <Box
                  sx={{
                    px: 1,
                    pb: 1,
                    flexShrink: 0,
                  }}
                >
                  {renderQuickActions()}
                  <FloatingTextInput onSend={handleSend} />
                </Box>
              </Box>
            </Rnd>
          </m.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

