'use client';

import { memo, useState } from 'react';
import { Handle, Position, useConnection, useNodeId } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Cloud Node Component - Cloud shape using SVG
// ----------------------------------------------------------------------

export const CloudNode = memo(({ data, isConnectable, selected, id }: NodeProps) => {
  const nodeIndex = (data.index as number) ?? 0;
  const isExiting = data.isExiting ?? false;

  // Dimensions
  const width = (data.width as number) ?? 180;
  const height = (data.height as number) ?? 120;

  // Background
  const backgroundImage = (data.backgroundImage as string) ?? null;
  const backgroundColor = (data.backgroundColor as string) ?? '#3b82f6';

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
      initial={{ scale: 0.3 }}
      animate={
        isExiting
          ? { scale: 0.3, opacity: 0 }
          : {
              scale: isConnectionTarget ? 1.1 : 1,
              boxShadow: isConnectionTarget
                ? ['0 0 0 3px rgba(59, 130, 246, 0.6)', '0 0 0 8px rgba(59, 130, 246, 0.3)']
                : '0 0 0 0px rgba(59, 130, 246, 0)',
            }
      }
      transition={{
        duration: 0.5,
        delay: nodeIndex * 0.08,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      style={{ width, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        sx={{
          position: 'relative',
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: selected ? '2px solid #1976d2' : 'none',
          outlineOffset: 8,
          filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.25))',
        }}
      >
        {/* Cloud SVG shape */}
        <svg
          width={width}
          height={height}
          viewBox="0 0 180 120"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <clipPath id={`cloud-clip-${id}`}>
              <path d="M145,90 C165,90 180,75 180,55 C180,35 165,20 145,20 C140,8 125,0 108,0 C88,0 72,12 68,28 C50,28 35,43 35,62 C35,81 50,96 68,96 L145,96 C145,94 145,92 145,90 Z M35,62 C35,62 20,62 15,75 C10,88 20,96 35,96 L68,96" />
            </clipPath>
          </defs>
          <rect
            width={width}
            height={height}
            clipPath={`url(#cloud-clip-${id})`}
            fill={backgroundImage ? `url(#cloud-img-${id})` : backgroundColor}
          />
          {backgroundImage && (
            <defs>
              <pattern id={`cloud-img-${id}`} patternUnits="objectBoundingBox" width="1" height="1">
                <image href={backgroundImage} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
          )}
          <path
            d="M145,90 C165,90 180,75 180,55 C180,35 165,20 145,20 C140,8 125,0 108,0 C88,0 72,12 68,28 C50,28 35,43 35,62 C35,81 50,96 68,96 L145,96 M35,62 C35,62 20,62 15,75 C10,88 20,96 35,96 L68,96"
            fill="none"
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
        </svg>

        <Typography
          variant="body2"
          sx={{
            position: 'relative',
            zIndex: 3,
            textAlign: 'center',
            px: 2,
            fontWeight: 600,
            color: textColor,
          }}
        >
          {data.label as string}
        </Typography>

        <Handle type="target" position={Position.Top} isConnectable={isConnectable}
          style={{ width: 10, height: 10, background: '#3b82f6', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', top: '10%' }} />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}
          style={{ width: 10, height: 10, background: '#3b82f6', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease' }} />
        <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable}
          style={{ width: 10, height: 10, background: '#3b82f6', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease' }} />
        <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable}
          style={{ width: 10, height: 10, background: '#3b82f6', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease' }} />
      </Box>
    </m.div>
  );
});

CloudNode.displayName = 'CloudNode';

