'use client';

import React, { useMemo, useState, useEffect, memo } from 'react';
import { AnimatePresence, m, MotionProps } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Animated List Item
// ----------------------------------------------------------------------

function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations: MotionProps = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: 'spring', stiffness: 350, damping: 40 },
  };

  return (
    <m.div {...animations} layout style={{ width: '100%' }}>
      {children}
    </m.div>
  );
}

// ----------------------------------------------------------------------
// Animated List
// ----------------------------------------------------------------------

export interface AnimatedListProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedList = memo(({ children, delay = 1000 }: AnimatedListProps) => {
  const [index, setIndex] = useState(0);
  const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

  useEffect(() => {
    if (index < childrenArray.length - 1) {
      const timeout = setTimeout(() => {
        setIndex((prevIndex) => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [index, delay, childrenArray.length]);

  const itemsToShow = useMemo(() => {
    return childrenArray.slice(0, index + 1).reverse();
  }, [index, childrenArray]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <AnimatePresence>
        {itemsToShow.map((item) => (
          <AnimatedListItem key={(item as React.ReactElement).key}>
            {item}
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </Box>
  );
});

AnimatedList.displayName = 'AnimatedList';

// ----------------------------------------------------------------------
// Notification Item (Sample list item component)
// ----------------------------------------------------------------------

export interface NotificationItemProps {
  name: string;
  description: string;
  icon?: string;
  color?: string;
  time?: string;
}

export const NotificationItem = memo(({
  name,
  description,
  icon = '💬',
  color = '#00C9A7',
  time = '15m ago',
}: NotificationItemProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      width: '100%',
      bgcolor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
      borderRadius: 2,
      border: '1px solid rgba(255, 255, 255, 0.15)',
      color: 'white',
      pointerEvents: 'auto',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: 'rgba(0, 0, 0, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateX(-4px)',
      },
    }}
  >
    {/* Icon */}
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        bgcolor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>

    {/* Content */}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.5,
            flexShrink: 0,
          }}
        >
          {time}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{
          opacity: 0.7,
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {description}
      </Typography>
    </Box>
  </Box>
));

NotificationItem.displayName = 'NotificationItem';

