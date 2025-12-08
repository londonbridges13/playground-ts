'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

interface CircularNodeData {
  label?: string;
  description?: string;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  opacity?: number;
  index?: number;
  isExiting?: boolean;
  [key: string]: unknown;
}

// ----------------------------------------------------------------------

export const CircularNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  const {
    label = '',
    description = '',
    size = 120,
    backgroundColor = '#1a1a2e',
    borderColor = 'rgba(255, 255, 255, 0.2)',
    textColor = '#ffffff',
    opacity = 1,
    index = 0,
    isExiting = false,
  } = data as CircularNodeData;

  return (
    <m.div
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isExiting
          ? { scale: 0.5, opacity: 0 }
          : { scale: 1, opacity: 1 }
      }
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      style={{ width: size, height: size }}
    >
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor,
          border: `2px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity,
          boxShadow: selected
            ? '0 0 0 3px rgba(25, 118, 210, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.2)',
          transition: 'box-shadow 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3), 0 12px 40px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        {/* Label */}
        <Typography
          variant="body2"
          sx={{
            color: textColor,
            fontWeight: 600,
            textAlign: 'center',
            px: 1.5,
            fontSize: size > 100 ? '0.875rem' : '0.75rem',
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>

        {/* Description (if provided and size is large enough) */}
        {description && size >= 100 && (
          <Typography
            variant="caption"
            sx={{
              color: textColor,
              opacity: 0.7,
              textAlign: 'center',
              px: 1,
              mt: 0.5,
              fontSize: '0.65rem',
              lineHeight: 1.2,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            background: borderColor,
            border: 'none',
            width: 8,
            height: 8,
            top: -4,
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            background: borderColor,
            border: 'none',
            width: 8,
            height: 8,
            bottom: -4,
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={{
            background: borderColor,
            border: 'none',
            width: 8,
            height: 8,
            left: -4,
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={{
            background: borderColor,
            border: 'none',
            width: 8,
            height: 8,
            right: -4,
          }}
        />
      </Box>
    </m.div>
  );
});

CircularNode.displayName = 'CircularNode';

