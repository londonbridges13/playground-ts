'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, useConnection, useNodeId, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { NodeCheckbox } from '../components/node-checkbox';

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

  // Checkbox
  const hasCheckbox = (data.hasCheckbox as boolean) ?? false;
  const checked = (data.checked as boolean) ?? false;

  // ReactFlow instance for updating node data
  const { setNodes } = useReactFlow();

  // Handle checkbox change
  const handleCheckboxChange = useCallback((newChecked: boolean) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, checked: newChecked } }
          : node
      )
    );
  }, [id, setNodes]);

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

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            position: 'relative',
            zIndex: 3,
          }}
        >
          {hasCheckbox && (
            <NodeCheckbox
              checked={checked}
              onChange={handleCheckboxChange}
              size={14}
              activeColor="#ff4d00"
              tickColor="#ffffff"
              borderColor="rgba(255, 255, 255, 0.5)"
            />
          )}
          <Typography
            variant="body2"
            component="span"
            sx={{
              textAlign: 'center',
              px: 2,
              fontWeight: 600,
              color: textColor,
              opacity: hasCheckbox && checked ? 0.7 : 1,
              transition: 'opacity 0.3s',
            }}
          >
            <Box component="span" sx={{ position: 'relative' }}>
              {data.label as string}
              {hasCheckbox && (
                <Box
                  component={m.span}
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: checked ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 20,
                    mass: 0.1,
                    delay: checked ? 0.4 : 0,
                  }}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    textDecoration: 'line-through',
                    textDecorationColor: textColor,
                    color: 'transparent',
                    pointerEvents: 'none',
                  }}
                >
                  {data.label as string}
                </Box>
              )}
            </Box>
          </Typography>
        </Box>

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

