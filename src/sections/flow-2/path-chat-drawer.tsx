'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

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

import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SearchIcon from '@mui/icons-material/Search';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type PathChatDrawerProps = {
  open: boolean;
  onClose: () => void;
};

// ----------------------------------------------------------------------

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        type: 'hexagon',
        label: label,
      })
    );
    event.dataTransfer.effectAllowed = 'move';
    // Prevent card click event
    event.stopPropagation();

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

export function PathChatDrawer({ open, onClose }: PathChatDrawerProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragTimerRef = useRef<NodeJS.Timeout | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'chat' | 'search') => {
    setActiveTab(newValue);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'This is a demo response. In a real application, this would connect to an AI model.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Start timer on drag start
  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    console.log('Drag started - drawer will close in 0.5s');

    // Start 0.5s timer to close drawer
    dragTimerRef.current = setTimeout(() => {
      console.log('Closing drawer after 0.5s');
      onClose();
      dragTimerRef.current = null;
    }, 500);
  }, [onClose]);

  // Clear timer on drag end
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    console.log('Drag ended');

    // Clear timer if drag ended before 0.5s
    if (dragTimerRef.current) {
      console.log('Clearing timer (drag ended early)');
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
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          py: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {messages.map((message) => (
            <Box key={message.id} sx={{ display: 'flex', gap: 2 }}>
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  bgcolor: message.role === 'user' ? 'grey.700' : 'primary.main',
                }}
              >
                <Iconify
                  icon={message.role === 'user' ? 'solar:user-bold' : 'solar:chat-round-line-bold'}
                  width={20}
                />
              </Avatar>

              {/* Message Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>

                {/* Message Text */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
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
                  AI Assistant
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
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim()}
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            <Iconify icon="custom:send-fill" width={20} />
          </IconButton>
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

