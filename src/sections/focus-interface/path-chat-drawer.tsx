'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

import { m } from 'motion/react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TuneIcon from '@mui/icons-material/Tune';

import { Iconify } from 'src/components/iconify';
import { MarkdownMessage } from 'src/components/markdown-message';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useSocket } from 'src/hooks/useSocket';
import { useAIStreaming } from 'src/hooks/useAIStreaming';
import { conversationAPI } from 'src/lib/api/conversations';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';
import type { SocketMessage } from 'src/types/socket';

// ----------------------------------------------------------------------

const models = [
  'Sonnet 4.5',
  'Sonnet 4',
  'Opus 4',
  'Haiku 4',
  'GPT-4',
  'GPT-3.5',
];

type PathChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  conversationId?: string;
};

// ============================================================================
// Types
// ============================================================================

interface TypingUser {
  userId: string;
  name: string;
}

// ----------------------------------------------------------------------

// Standalone Hexagon Component (no React Flow dependencies)
const StandaloneHexagon = ({
  label,
  onDragStart: onDragStartCallback,
  onDragEnd: onDragEndCallback,
}: {
  label: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (event: React.DragEvent) => {
    setIsDragging(true);
    // Store node data in the drag event
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        type: 'hexagon',
        label: label,
      })
    );
    event.dataTransfer.effectAllowed = 'move';

    // Call parent's drag start handler
    onDragStartCallback?.();
  };

  const onDragEnd = () => {
    setIsDragging(false);

    // Call parent's drag end handler
    onDragEndCallback?.();
  };

  return (
    <Box
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      sx={{
        position: 'relative',
        width: 178,
        height: 174,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.2s',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
    {/* SVG with rounded hexagon */}
    <svg
      width="178"
      height="174"
      viewBox="0 0 178 174"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter id="round-standalone">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>

      {/* Hexagon fill */}
      <path
        fill="#d0d0d0"
        d="M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z"
        filter="url(#round-standalone)"
      />

      {/* Hexagon border */}
      <path
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeOpacity="1.0"
        d="M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z"
        filter="url(#round-standalone)"
      />
    </svg>

    {/* Content */}
    <Typography
      variant="body2"
      sx={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        px: 2,
        fontWeight: 500,
      }}
    >
      {label}
    </Typography>
  </Box>
  );
};

// ----------------------------------------------------------------------

// Smaller version for search results
const MiniHexagon = ({
  label,
  onDragStart: onDragStartCallback,
  onDragEnd: onDragEndCallback,
}: {
  label: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (event: React.DragEvent) => {
    setIsDragging(true);

    const dragData = {
      type: 'hexagon',
      label: label,
    };

    console.log('🔷 [MiniHexagon] Drag start:', dragData);

    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify(dragData)
    );
    event.dataTransfer.effectAllowed = 'move';

    // Prevent card click event
    event.stopPropagation();

    // Call parent's drag start handler
    console.log('🔷 [MiniHexagon] Calling parent onDragStart callback');
    onDragStartCallback?.();
  };

  const onDragEnd = () => {
    setIsDragging(false);
    console.log('🔷 [MiniHexagon] Drag end for:', label);

    // Call parent's drag end handler
    console.log('🔷 [MiniHexagon] Calling parent onDragEnd callback');
    onDragEndCallback?.();
  };

  return (
    <Box
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: 'relative',
        width: 60,
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.2s',
        flexShrink: 0,
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      {/* SVG with rounded hexagon */}
      <svg
        width="60"
        height="58"
        viewBox="0 0 178 174"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id="round-mini">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>

        {/* Hexagon fill */}
        <path
          fill="#d0d0d0"
          d="M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z"
          filter="url(#round-mini)"
        />

        {/* Hexagon border */}
        <path
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeOpacity="1.0"
          d="M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z"
          filter="url(#round-mini)"
        />
      </svg>

      {/* Icon instead of text for smaller size */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="solar:add-circle-bold" width={20} />
      </Box>
    </Box>
  );
};

// ----------------------------------------------------------------------

export function PathChatDrawer({ open, onClose, conversationId: propConversationId }: PathChatDrawerProps) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('Sonnet 4.5');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(propConversationId || null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragTimerRef = useRef<NodeJS.Timeout | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isUserScrollingRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const menuOpen = Boolean(anchorEl);

  // Get JWT token from sessionStorage (fallback to auth context)
  const token = typeof window !== 'undefined'
    ? (sessionStorage.getItem(JWT_STORAGE_KEY) || user?.accessToken || '')
    : (user?.accessToken || '');

  // Initialize AI Streaming
  const {
    streamingMessages,
    currentStreamingId,
    handleStreamStart,
    handleStreamChunk,
    handleStreamComplete,
    getStreamingMessage,
    isMessageStreaming,
  } = useAIStreaming();

  // Initialize Socket.IO
  const {
    connected,
    messages,
    setMessages,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    stopTyping,
  } = useSocket({
    token,
    onMessage: (message: SocketMessage) => {
      // Message is already added to state by the hook
    },
    onError: (error) => {
      toast.error(error.message || 'Socket error occurred');
    },
    onTyping: (data) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.userId, { userId: data.userId, name: data.name });
        return newMap;
      });
    },
    onStoppedTyping: (data) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    },
    onStreamStart: handleStreamStart,
    onStreamChunk: handleStreamChunk,
    onStreamComplete: handleStreamComplete,
  });

  // Lock body scroll when drawer is open
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

  // Initialize or fetch conversation
  useEffect(() => {
    if (!open || !token) {
      console.log('[PathChatDrawer] Skipping init - open:', open, 'token:', !!token);
      return;
    }

    const initializeConversation = async () => {
      try {
        console.log('[PathChatDrawer] Starting conversation initialization...');
        setIsLoadingConversation(true);

        // If no conversation ID, create a new one
        if (!conversationId) {
          console.log('[PathChatDrawer] No conversation ID, creating new one...');
          const response = await conversationAPI.startConversation({
            title: `Chat - ${new Date().toLocaleDateString()}`,
          });

          console.log('[PathChatDrawer] Conversation API response:', response);

          if (response.success && response.data?.id) {
            console.log('[PathChatDrawer] Conversation created with ID:', response.data.id);
            setConversationId(response.data.id);
            // Join will be called in the next effect
          } else {
            console.error('[PathChatDrawer] Failed to start conversation - response:', response);
            toast.error('Failed to start conversation');
          }
        } else {
          console.log('[PathChatDrawer] Using existing conversation ID:', conversationId);
        }
      } catch (error) {
        console.error('[PathChatDrawer] Error during initialization:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to initialize conversation');
      } finally {
        setIsLoadingConversation(false);
      }
    };

    initializeConversation();
  }, [open, token]);

  // Join conversation when ID is available and socket is connected
  useEffect(() => {
    console.log('[PathChatDrawer] Join effect - conversationId:', conversationId, 'connected:', connected);
    if (!conversationId || !connected) {
      console.log('[PathChatDrawer] Skipping join - conversationId:', !!conversationId, 'connected:', connected);
      return;
    }
    console.log('[PathChatDrawer] Joining conversation:', conversationId);
    joinConversation(conversationId);
  }, [conversationId, connected, joinConversation]);

  // Cleanup on drawer close
  useEffect(() => {
    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, leaveConversation]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'chat' | 'search') => {
    setActiveTab(newValue);
  };

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const isAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Consider "at bottom" if within 100px of the bottom
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Handle scroll events to detect user scrolling
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const currentScrollTop = messagesContainerRef.current.scrollTop;

    // If user scrolls upward (scrollTop decreases), detach auto-scroll
    if (currentScrollTop < lastScrollTopRef.current) {
      isUserScrollingRef.current = true;
    }
    // If user scrolls back to bottom, reattach auto-scroll
    else if (isAtBottom()) {
      isUserScrollingRef.current = false;
    }

    lastScrollTopRef.current = currentScrollTop;
  }, [isAtBottom]);

  // Auto-scroll when messages change (if user is at bottom)
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages, typingUsers, scrollToBottom]);

  // Auto-scroll when streaming messages change (if user is at bottom)
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [streamingMessages, scrollToBottom]);

  const handleSend = () => {
    console.log('[PathChatDrawer] handleSend - input:', input, 'conversationId:', conversationId);
    if (!input.trim() || !conversationId) {
      console.log('[PathChatDrawer] Skipping send - input empty or no conversationId');
      return;
    }

    console.log('[PathChatDrawer] Sending message:', input);
    sendMessage(conversationId, input, {
      generateAIResponse: true,
      onSuccess: () => {
        console.log('[PathChatDrawer] Message sent successfully');
        setInput('');
        stopTyping(conversationId);
      },
      onError: (error: string) => {
        console.error('[PathChatDrawer] Failed to send message:', error);
        toast.error(`Failed to send message: ${error}`);
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('[PathChatDrawer] Enter key pressed');
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[PathChatDrawer] Input changed:', e.target.value, 'conversationId:', conversationId);
    setInput(e.target.value);
    if (conversationId) {
      sendTyping(conversationId);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    handleMenuClose();
  };

  // Start timer on drag start
  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    console.log('🎯 [Hexagon Drag] Started - drawer will close in 0.5s');
    console.log('🎯 [Hexagon Drag] Active tab:', activeTab);

    // Start 0.5s timer to close drawer
    dragTimerRef.current = setTimeout(() => {
      console.log('✅ [Hexagon Drag] 0.5s elapsed - closing drawer now');
      onClose();
      dragTimerRef.current = null;
    }, 500);
  }, [onClose, activeTab]);

  // Clear timer on drag end
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    console.log('🏁 [Hexagon Drag] Ended');

    // Clear timer if drag ended before 0.5s
    if (dragTimerRef.current) {
      console.log('⏹️ [Hexagon Drag] Clearing timer (drag ended early)');
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
      }
    };
  }, []);

  // Search Result Card Component
  const SearchResultCard = ({
    title,
    description,
    tags,
    onHexDragStart,
    onHexDragEnd,
  }: {
    title: string;
    description: string;
    tags: string[];
    onHexDragStart?: () => void;
    onHexDragEnd?: () => void;
  }) => (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        height: 'auto',
        overflow: 'visible',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent
        sx={{
          '&:last-child': {
            paddingBottom: '24px !important',
          },
        }}
      >
        {/* Title with Mini Hexagon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              flex: 1,
            }}
          >
            {title}
          </Typography>

          {/* Mini Draggable Hexagon */}
          <MiniHexagon
            label={title}
            onDragStart={onHexDragStart}
            onDragEnd={onHexDragEnd}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        {/* Tags/Chips */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            pb: 1,
          }}
        >
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="soft"
              color="primary"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderHeader = () => (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'saturate(150%) blur(20px)',
        backgroundColor: (theme) =>
          varAlpha(theme.vars.palette.background.paperChannel, 0.9),
      }}
    >
      {/* Tabs navigation - Dynamic width */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          minHeight: 48,
          '& .MuiTabs-indicator': {
            height: 2,
          },
        }}
      >
        <Tab
          value="chat"
          icon={<ChatBubbleOutlineIcon />}
          iconPosition="start"
          label="Chat"
          sx={{
            minHeight: 48,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            px: 2,
          }}
        />
        <Tab
          value="search"
          icon={<SearchIcon />}
          iconPosition="start"
          label="Search"
          sx={{
            minHeight: 48,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            px: 2,
          }}
        />
      </Tabs>

      {/* Close button */}
      <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );

  const renderChatContent = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Card with Hex Node */}
      <Card
        sx={{
          mx: 3,
          mt: 3,
          mb: 2,
          overflow: 'visible',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 3,
            '&:last-child': {
              paddingBottom: '24px !important',
            },
          }}
        >
          {/* Centered Hex Node */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <StandaloneHexagon
              label="Current Goal"
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Messages Container */}
      <Box
        ref={messagesContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          py: 2,
        }}
      >
        {isLoadingConversation ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {messages.map((message) => (
              <Box key={message.id} sx={{ display: 'flex', gap: 2 }}>
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    bgcolor: message.senderType === 'USER' ? 'grey.700' : 'primary.main',
                  }}
                >
                  <Iconify
                    icon={message.senderType === 'USER' ? 'solar:user-bold' : 'solar:chat-round-line-bold'}
                    width={20}
                  />
                </Avatar>

                {/* Message Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {message.senderName || (message.senderType === 'USER' ? 'You' : 'AI Assistant')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                    {isMessageStreaming(message.id) && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          gap: 0.5,
                          ml: 'auto',
                        }}
                      >
                        {[0, 150, 300].map((delay, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 6,
                              height: 6,
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              animation: 'bounce 1.4s infinite ease-in-out',
                              animationDelay: `${delay}ms`,
                              '@keyframes bounce': {
                                '0%, 80%, 100%': {
                                  transform: 'scale(0)',
                                },
                                '40%': {
                                  transform: 'scale(1)',
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Message Text - Markdown Support */}
                  <MarkdownMessage content={message.content} />
                </Box>
              </Box>
            ))}

            {/* Streaming Messages - Show in-progress AI responses */}
            {Array.from(streamingMessages.values()).map((streamingMsg) => (
              <Box key={streamingMsg.messageId} sx={{ display: 'flex', gap: 2 }}>
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    bgcolor: 'primary.main',
                  }}
                >
                  <Iconify icon="solar:chat-round-line-bold" width={20} />
                </Avatar>

                {/* Message Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      AI Assistant
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                    {streamingMsg.isStreaming && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          gap: 0.5,
                          ml: 'auto',
                        }}
                      >
                        {[0, 150, 300].map((delay, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 6,
                              height: 6,
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              animation: 'bounce 1.4s infinite ease-in-out',
                              animationDelay: `${delay}ms`,
                              '@keyframes bounce': {
                                '0%, 80%, 100%': {
                                  transform: 'scale(0)',
                                },
                                '40%': {
                                  transform: 'scale(1)',
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Message Text - Markdown Support */}
                  <MarkdownMessage content={streamingMsg.content} />
                </Box>
              </Box>
            ))}

            {/* Typing Indicator - Show who is typing */}
            {typingUsers.size > 0 && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    bgcolor: 'primary.main',
                  }}
                >
                  <Iconify icon="solar:chat-round-line-bold" width={20} />
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {Array.from(typingUsers.values())
                      .map((u) => u.name)
                      .join(', ')}{' '}
                    {typingUsers.size === 1 ? 'is' : 'are'} typing...
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[0, 150, 300].map((delay, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: 'grey.400',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: `${delay}ms`,
                          '@keyframes bounce': {
                            '0%, 80%, 100%': {
                              transform: 'scale(0)',
                            },
                            '40%': {
                              transform: 'scale(1)',
                            },
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

      {/* Input Area */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          px: 3,
          py: 2,
        }}
      >
        {/* Current User Display */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar
              src={user.photoURL}
              alt={user.displayName}
              sx={{ width: 32, height: 32 }}
            >
              {user.displayName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Sending as
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user.displayName}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Text Input Container */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            p: 1.5,
            boxShadow: '0px 10px 20px 0px rgba(44, 42, 202, 0.2), 0px 5px 8px 0px rgba(218, 152, 235, 0.1)',
          }}
        >
          {/* TextField */}
          <TextField
            fullWidth
            multiline
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '1.125rem',
                color: '#374151',
                padding: 0,
                margin: 0,
                minHeight: '32px',
                display: 'flex',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                '& textarea': {
                  resize: 'none',
                  overflow: 'hidden !important',
                  minHeight: '32px !important',
                  maxHeight: '160px',
                  padding: 0,
                  margin: 0,
                  lineHeight: 1.5,
                  flex: 1,
                },
                '& textarea::placeholder': {
                  color: '#9ca3af',
                  opacity: 1,
                },
              },
            }}
            sx={{
              mb: 0.5,
              '& .MuiInputBase-root': {
                padding: 0,
                margin: 0,
              },
            }}
          />

          {/* Bottom toolbar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left side buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                sx={{
                  p: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
                aria-label="Add"
              >
                <AddIcon sx={{ fontSize: 18, color: '#374151' }} />
              </IconButton>

              <IconButton
                size="small"
                sx={{
                  p: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
                aria-label="Settings"
              >
                <TuneIcon sx={{ fontSize: 18, color: '#374151' }} />
              </IconButton>

              <IconButton
                size="small"
                sx={{
                  p: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                }}
                aria-label="Schedule"
              >
                <AccessTimeIcon sx={{ fontSize: 18, color: '#374151' }} />
              </IconButton>
            </Box>

            {/* Right side - model selector and send button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  color: '#374151',
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
                aria-label="Select model"
              >
                <Box component="span" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                  {selectedModel}
                </Box>
                <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: -1,
                      minWidth: 160,
                      borderRadius: '12px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  },
                }}
              >
                {models.map((model) => (
                  <MenuItem
                    key={model}
                    selected={model === selectedModel}
                    onClick={() => handleModelSelect(model)}
                    sx={{
                      fontSize: '0.8125rem',
                      py: 0.75,
                      px: 1.5,
                      minHeight: 'auto',
                    }}
                  >
                    {model}
                  </MenuItem>
                ))}
              </Menu>

              <IconButton
                size="small"
                onClick={handleSend}
                disabled={!input.trim()}
                sx={{
                  bgcolor: '#fdba74',
                  borderRadius: '8px',
                  p: 1,
                  '&:hover': {
                    bgcolor: '#fb923c',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#e5e7eb',
                    color: '#9ca3af',
                  },
                }}
                aria-label="Send message"
              >
                <ArrowUpwardIcon sx={{ fontSize: 20, color: 'white' }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderSearchContent = () => {
    // Sample search results data
    const searchResults = [
      {
        id: 1,
        title: 'React Flow Documentation',
        description: 'Learn how to build interactive node-based diagrams with React Flow. Includes guides on custom nodes, edges, and layouts.',
        tags: ['React', 'Flow', 'Diagrams'],
      },
      {
        id: 2,
        title: 'Material-UI Components',
        description: 'Comprehensive guide to using Material-UI components in your React applications. Covers theming, styling, and customization.',
        tags: ['MUI', 'Components', 'Styling'],
      },
      {
        id: 3,
        title: 'Framer Motion Animations',
        description: 'Create smooth, performant animations with Framer Motion. Learn about variants, gestures, and layout animations.',
        tags: ['Animation', 'Motion', 'Transitions'],
      },
      {
        id: 4,
        title: 'Node Context Drawer',
        description: 'Implement a context drawer for displaying detailed node information with blur effects and smooth animations.',
        tags: ['Drawer', 'Context', 'UI'],
      },
      {
        id: 5,
        title: 'Custom Edge Paths',
        description: 'Design artistic and animated edge paths that dynamically connect nodes based on their positions in the flow.',
        tags: ['Edges', 'Paths', 'Animation'],
      },
    ];

    return (
      <Box
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="Search..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Search Results */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
          }}
        >
          {searchResults.map((result) => (
            <SearchResultCard
              key={result.id}
              {...result}
              onHexDragStart={handleDragStart}
              onHexDragEnd={handleDragEnd}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return renderChatContent();
      case 'search':
        return renderSearchContent();
      default:
        return renderChatContent();
    }
  };

  return (
    <Drawer
      anchor="right"
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
            maxWidth: 480,
            m: 2,
            borderRadius: 2,
            maxHeight: 'calc(100vh - 32px)',
            bgcolor: 'background.paper',
            boxShadow: '-40px 40px 80px -8px rgba(0, 0, 0, 0.24)',
          },
        },
      }}
    >
      <m.div
        ref={drawerRef}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
      >
        {renderHeader()}
        {renderContent()}
      </m.div>
    </Drawer>
  );
}

