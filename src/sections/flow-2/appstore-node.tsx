import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';

export const AppStoreNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  const nodeOpacity = data.opacity ?? 1;
  const nodeIndex = data.index ?? 0;
  const isExiting = data.isExiting ?? false;
  const exitAnimationType = data.exitAnimationType ?? 'slide';
  const backgroundColor = data.backgroundColor || '#814A0E';
  const category = data.category || 'App';
  const imageUrl = data.imageUrl;

  // Only use layoutId when preparing for dialog transition
  // This prevents rendering issues on first load while preserving the App Store morphing animation
  const shouldUseLayoutId = data.useLayoutId ?? false;

  // Define exit animations
  const exitAnimations = {
    slide: {
      opacity: 0,
      scale: 0.4,
      y: 30,
      x: 0,
      rotate: 0,
    },
    shuffle: {
      opacity: 0,
      scale: 0.7,
      x: (nodeIndex % 2 === 0 ? -1 : 1) * 350,
      rotate: (nodeIndex % 2 === 0 ? -1 : 1) * 20,
      y: Math.random() * 120 - 60,
    }
  };

  return (
    <m.div
      layoutId={shouldUseLayoutId ? `appstore-card-${data.id}` : undefined}
      initial={{ opacity: 0, scale: 0.4, x: 0, rotate: 0 }}
      animate={
        isExiting
          ? exitAnimations[exitAnimationType]
          : { opacity: nodeOpacity, scale: 1, x: 0, rotate: 0 }
      }
      transition={{
        duration: isExiting && exitAnimationType === 'shuffle' ? 0.75 : 0.55,
        delay: nodeIndex * 0.09,
        ease: isExiting && exitAnimationType === 'shuffle'
          ? [0.6, 0.01, 0.05, 0.95]
          : [0.43, 0.13, 0.23, 0.96],
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <Box
        data-id={data.id}
        sx={{
          position: 'relative',
          width: 240,
          height: 320,
          display: 'flex',
          flexDirection: 'column',
          outline: selected ? '3px solid #1976d2' : 'none',
          outlineOffset: 4,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#fff',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        {/* Image/Background Section */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '60%',
            backgroundColor,
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt=""
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${backgroundColor} 0%, ${adjustBrightness(backgroundColor, -20)} 100%)`,
              }}
            />
          )}
        </Box>

        {/* Content Section */}
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            backgroundColor: '#fff',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}
          >
            {category}
          </Box>
          <Box
            component="h3"
            sx={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#000',
              lineHeight: 1.2,
            }}
          >
            {data.label}
          </Box>
        </Box>

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{ background: '#555', top: 10, opacity: 0 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{ background: '#555', bottom: 10, opacity: 0 }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={{ background: '#555', left: 30 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={{ background: '#555', right: 30 }}
        />
      </Box>
    </m.div>
  );
});

AppStoreNode.displayName = 'AppStoreNode';

// Helper to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

