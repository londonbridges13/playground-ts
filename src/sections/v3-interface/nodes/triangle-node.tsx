'use client';

import { memo, useState } from 'react';
import { Handle, Position, useConnection, useNodeId } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Triangle Node Component - 3-sided polygon using SVG clip-path
// ----------------------------------------------------------------------

export const TriangleNode = memo(({ data, isConnectable, selected, id }: NodeProps) => {
  const nodeIndex = (data.index as number) ?? 0;
  const isExiting = data.isExiting ?? false;

  // Dimensions
  const size = (data.size as number) ?? 140;

  // Background
  const backgroundImage = (data.backgroundImage as string) ?? null;
  const backgroundColor = (data.backgroundColor as string) ?? '#f59e0b';

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

  // Triangle points (equilateral, pointing up)
  const height = size * 0.866; // sqrt(3)/2 for equilateral triangle
  const clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';

  return (
    <m.div
      initial={{ scale: 0.3 }}
      animate={
        isExiting
          ? { scale: 0.3, opacity: 0 }
          : {
              scale: isConnectionTarget ? 1.1 : 1,
              boxShadow: isConnectionTarget
                ? ['0 0 0 3px rgba(245, 158, 11, 0.6)', '0 0 0 8px rgba(245, 158, 11, 0.3)']
                : '0 0 0 0px rgba(245, 158, 11, 0)',
            }
      }
      transition={{
        duration: 0.5,
        delay: nodeIndex * 0.08,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      style={{ width: size, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        sx={{
          position: 'relative',
          width: size,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: selected ? '2px solid #1976d2' : 'none',
          outlineOffset: 8,
          filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.25))',
        }}
      >
        {/* Triangle shape with clip-path */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            clipPath,
            ...(backgroundImage
              ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : { backgroundColor }),
          }}
        />
        {/* Border (slightly smaller triangle behind) */}
        <Box
          sx={{
            position: 'absolute',
            inset: borderWidth,
            clipPath,
            border: `${borderWidth}px solid ${borderColor}`,
            pointerEvents: 'none',
          }}
        />

        <Typography
          variant="body2"
          sx={{
            position: 'relative',
            zIndex: 3,
            textAlign: 'center',
            mt: 3,
            px: 1,
            fontWeight: 600,
            color: textColor,
            fontSize: '0.75rem',
          }}
        >
          {data.label as string}
        </Typography>

        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#f59e0b', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#f59e0b', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#f59e0b', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', top: '70%',
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#f59e0b', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', top: '70%',
          }}
        />
      </Box>
    </m.div>
  );
});

TriangleNode.displayName = 'TriangleNode';

