'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

import { m, useSpring } from 'motion/react';
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

import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TuneIcon from '@mui/icons-material/Tune';

import { Iconify } from 'src/components/iconify';

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
  onCreateNode?: (clientX: number, clientY: number, nodeData: any) => void;
};

// ----------------------------------------------------------------------

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ----------------------------------------------------------------------

// Spring configuration for smooth animations
const SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 40,
  mass: 0.1,
};

// Standalone Hexagon Component with spring-based drag animation
const StandaloneHexagon = ({
  label,
  onDragStart: onDragStartCallback,
  onDragEnd: onDragEndCallback,
  onCapture,
}: {
  label: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onCapture?: (data: any) => void;
}) => {
  const referenceRef = useRef<HTMLDivElement | null>(null);
  const [flash, setFlash] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });

  const capture = () => {
    setFlash(true);
    const id = setTimeout(() => {
      setFlash(false);

      // Get initial position
      const dimensions = referenceRef?.current?.getBoundingClientRect();
      if (!dimensions) return;

      // Notify parent with capture data
      onCapture?.({
        type: 'hexagon',
        label: label,
        backgroundImage: '/copy_paste/ocean.jpg',
        textColor: 'white',
        textWeight: 'bold',
        fontFamily: 'Public Sans Variable',
        showBorder: true,
        initialPosition: {
          x: dimensions.x,
          y: dimensions.y,
          width: dimensions.width,
          height: dimensions.height,
        },
        mousePosition: mouse.current,
      });

      onDragStartCallback?.();
      clearTimeout(id);
    }, 200);
  };

  return (
    <m.div
      ref={referenceRef}
      onMouseDown={capture}
      onPointerMove={(e) => {
        mouse.current = { x: e.clientX, y: e.clientY };
      }}
      animate={{
        filter: flash
          ? "brightness(1.5) blur(2px) drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))"
          : "brightness(1) blur(0px) drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))",
      }}
      transition={{
        type: "spring",
        stiffness: 600,
        damping: 60,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      style={{
        position: 'relative',
        width: 178,
        height: 174,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'copy',
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
        {/* Image pattern for ocean background */}
        <pattern id="ocean-pattern-standalone" patternUnits="objectBoundingBox" width="1" height="1">
          <image
            xlinkHref="/copy_paste/ocean.jpg"
            x="0"
            y="0"
            width="178"
            height="174"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>

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

      {/* Hexagon fill with ocean image */}
      <path
        fill="url(#ocean-pattern-standalone)"
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
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Public Sans Variable',
      }}
    >
      {label}
    </Typography>
  </m.div>
  );
};

// ----------------------------------------------------------------------

// Floating Hexagon Clone Component
const FloatingHexagonClone = ({
  captured,
  x,
  y,
  width,
  height,
  label,
  showBorder = false,
}: {
  captured: boolean;
  x: any;
  y: any;
  width: any;
  height: any;
  label: string;
  showBorder?: boolean;
}) => {
  return (
    <m.div
      className="fixed select-none pointer-events-none"
      aria-hidden
      initial={false}
      animate={{
        opacity: captured ? 1 : 0,
        filter: captured ? "blur(0px)" : "blur(2px)",
      }}
      style={{
        width,
        height,
        x,
        y,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        zIndex: 9999,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 40,
      }}
    >
      {/* SVG with rounded hexagon */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 178 174"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          {/* Image pattern for ocean background */}
          <pattern id="ocean-pattern-floating" patternUnits="objectBoundingBox" width="1" height="1">
            <image
              xlinkHref="/copy_paste/ocean.jpg"
              x="0"
              y="0"
              width="178"
              height="174"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          <filter id="round-floating">
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

        {/* Hexagon fill with ocean image */}
        <path
          fill="url(#ocean-pattern-floating)"
          d="M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z"
          filter="url(#round-floating)"
        />

        {/* Hexagon border - conditionally rendered */}
        {showBorder && (
          <path
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeOpacity="1.0"
            d="M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z"
            filter="url(#round-floating)"
          />
        )}
      </svg>
    </m.div>
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

export function PathChatDrawer({ open, onClose, onCreateNode }: PathChatDrawerProps) {
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
  const [selectedModel, setSelectedModel] = useState('Sonnet 4.5');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragTimerRef = useRef<NodeJS.Timeout | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const menuOpen = Boolean(anchorEl);

  // Spring-based drag state
  const [captured, setCaptured] = useState(false);
  const [capturedData, setCapturedData] = useState<any>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const width = useSpring(0, SPRING);
  const height = useSpring(0, SPRING);

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

  // Handle hexagon capture (copy)
  const handleCapture = useCallback((data: any) => {
    console.log('🎯 [Hexagon Capture] Data:', data);
    setCapturedData(data);

    // Set initial position and size IMMEDIATELY without animation using .jump()
    // This prevents the clone from animating from (0,0) to the hexagon position
    if (data.initialPosition) {
      x.jump(data.initialPosition.x);
      y.jump(data.initialPosition.y);
      width.jump(data.initialPosition.width);
      height.jump(data.initialPosition.height);
    }

    // Now show the clone at the correct position
    setCaptured(true);

    // Shrink and move to cursor WITH spring animation
    setTimeout(() => {
      width.set(60);
      height.set(58);
      x.set(data.mousePosition.x + 16);
      y.set(data.mousePosition.y + 16);
    }, 200);

    // Start 0.5s timer to close drawer
    dragTimerRef.current = setTimeout(() => {
      console.log('✅ [Hexagon Drag] 0.5s elapsed - closing drawer now');
      onClose();
      dragTimerRef.current = null;
    }, 500);
  }, [onClose, x, y, width, height]);

  // Handle paste (drop)
  const handlePaste = useCallback((clientX: number, clientY: number) => {
    console.log('🏁 [Hexagon Paste] at position:', clientX, clientY);

    // Create the node at the click position
    if (capturedData && onCreateNode) {
      console.log('✅ [Hexagon Paste] Creating node with data:', capturedData);
      onCreateNode(clientX, clientY, {
        type: capturedData.type,
        label: capturedData.label,
        backgroundImage: capturedData.backgroundImage,
        textColor: capturedData.textColor,
        textWeight: capturedData.textWeight,
        fontFamily: capturedData.fontFamily,
        showBorder: capturedData.showBorder,
      });
    }

    // Clean up state
    setCaptured(false);
    setCapturedData(null);
    sessionStorage.removeItem('capturedHexagonData');

    // Clear timer if drag ended before 0.5s
    if (dragTimerRef.current) {
      console.log('⏹️ [Hexagon Drag] Clearing timer (drag ended early)');
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }
  }, [capturedData, onCreateNode]);

  // Handle canceling the drag with Escape key
  const handleCancelDrag = useCallback(() => {
    console.log('❌ [Hexagon Drag] Cancelled with Escape key');

    // Clean up state
    setCaptured(false);
    setCapturedData(null);
    sessionStorage.removeItem('capturedHexagonData');

    // Clear timer if active
    if (dragTimerRef.current) {
      console.log('⏹️ [Hexagon Drag] Clearing timer (drag cancelled)');
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }

    // Reset spring values
    x.set(0);
    y.set(0);
    width.set(0);
    height.set(0);
  }, [x, y, width, height]);

  // Listen for Escape key to cancel drag
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && captured) {
        event.preventDefault();
        handleCancelDrag();
      }
    };

    // Add event listener when captured
    if (captured) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [captured, handleCancelDrag]);

  // Start timer on drag start (legacy support)
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

  // Clear timer on drag end (legacy support)
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
              onCapture={handleCapture}
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
            onChange={(e) => setInput(e.target.value)}
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
    <>
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

      {/* Floating hexagon clone that follows cursor */}
      <Box
        onPointerMove={(e) => {
          mouse.current = { x: e.clientX, y: e.clientY };
          if (captured) {
            const newX = e.clientX + 16;
            const newY = e.clientY + 16;
            x.set(newX);
            y.set(newY);
          }
        }}
        onClick={(e) => {
          if (captured) {
            handlePaste(e.clientX, e.clientY);
          }
        }}
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: captured ? 'auto' : 'none',
          zIndex: 9998,
        }}
      >
        {capturedData && (
          <FloatingHexagonClone
            captured={captured}
            x={x}
            y={y}
            width={width}
            height={height}
            label={capturedData.label}
            showBorder={capturedData.showBorder}
          />
        )}
      </Box>
    </>
  );
}

