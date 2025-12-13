'use client';

import { memo, useState } from 'react';
import { Handle, Position, useConnection, useNodeId } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Diamond Node Component - Rotated square shape
// ----------------------------------------------------------------------

export const DiamondNode = memo(({ data, isConnectable, selected, id }: NodeProps) => {
  const nodeIndex = (data.index as number) ?? 0;
  const isExiting = data.isExiting ?? false;

  // Dimensions (size of the diamond)
  const size = (data.size as number) ?? 120;

  // Background
  const backgroundImage = (data.backgroundImage as string) ?? null;
  const backgroundColor = (data.backgroundColor as string) ?? '#8b5cf6';

  // Border
  const borderWidth = (data.borderWidth as number) ?? 3;
  const borderColor = (data.borderColor as string) ?? 'rgba(255, 255, 255, 0.6)';

  // Text
  const textColor = (data.textColor as string) ?? '#ffffff';

  // Hover state
  const [isHovered, setIsHovered] = useState(false);

  // Connection target detection
  const connection = useConnection();
  const nodeId = useNodeId();
  const isConnectionTarget = connection.inProgress && connection.toNode?.id === nodeId;

  return (
    <m.div
      initial={{ scale: 0.3, rotate: 45 }}
      animate={
        isExiting
          ? { scale: 0.3, opacity: 0, rotate: 45 }
          : {
              scale: isConnectionTarget ? 1.1 : 1,
              rotate: 45,
              boxShadow: isConnectionTarget
                ? ['0 0 0 3px rgba(139, 92, 246, 0.6)', '0 0 0 8px rgba(139, 92, 246, 0.3)']
                : '0 0 0 0px rgba(139, 92, 246, 0)',
            }
      }
      transition={{
        duration: 0.5,
        delay: nodeIndex * 0.08,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: selected ? '2px solid #1976d2' : 'none',
          outlineOffset: 4,
          filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.25))',
          overflow: 'hidden',
          borderRadius: 8,
          border: `${borderWidth}px solid ${borderColor}`,
          ...(backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { backgroundColor }),
        }}
      >
        {/* Content - counter-rotate to keep text upright */}
        <Typography
          variant="body2"
          sx={{
            position: 'relative',
            zIndex: 3,
            textAlign: 'center',
            px: 1,
            fontWeight: 600,
            color: textColor,
            transform: 'rotate(-45deg)',
            fontSize: size > 100 ? '0.875rem' : '0.75rem',
          }}
        >
          {data.label as string}
        </Typography>

        {/* Handles at corners */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#8b5cf6', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease',
            transform: 'rotate(-45deg)',
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#8b5cf6', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease',
            transform: 'rotate(-45deg)',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#8b5cf6', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease',
            transform: 'rotate(-45deg)',
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#8b5cf6', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease',
            transform: 'rotate(-45deg)',
          }}
        />
      </Box>
    </m.div>
  );
});

DiamondNode.displayName = 'DiamondNode';

