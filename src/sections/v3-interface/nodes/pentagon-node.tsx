'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, useConnection, useNodeId, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { NodeCheckbox } from '../components/node-checkbox';

// ----------------------------------------------------------------------
// Pentagon Node Component - 5-sided polygon using SVG clip-path
// ----------------------------------------------------------------------

export const PentagonNode = memo(({ data, isConnectable, selected, id }: NodeProps) => {
  const nodeIndex = (data.index as number) ?? 0;
  const isExiting = data.isExiting ?? false;

  // Dimensions
  const size = (data.size as number) ?? 140;

  // Background
  const backgroundImage = (data.backgroundImage as string) ?? null;
  const backgroundColor = (data.backgroundColor as string) ?? '#10b981';

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

  // Pentagon clip-path (regular pentagon pointing up)
  const clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';

  return (
    <m.div
      initial={{ scale: 0.3 }}
      animate={
        isExiting
          ? { scale: 0.3, opacity: 0 }
          : {
              scale: isConnectionTarget ? 1.1 : 1,
              boxShadow: isConnectionTarget
                ? ['0 0 0 3px rgba(16, 185, 129, 0.6)', '0 0 0 8px rgba(16, 185, 129, 0.3)']
                : '0 0 0 0px rgba(16, 185, 129, 0)',
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
          outlineOffset: 8,
          filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.25))',
        }}
      >
        {/* Pentagon shape with clip-path */}
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
        {/* Border overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: borderWidth,
            clipPath,
            border: `${borderWidth}px solid ${borderColor}`,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            position: 'relative',
            zIndex: 3,
            mt: 1,
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
              px: 1,
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

        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#10b981', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#10b981', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#10b981', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', top: '40%',
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={{
            width: 10, height: 10, background: '#10b981', border: '2px solid #fff',
            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', top: '40%',
          }}
        />
      </Box>
    </m.div>
  );
});

PentagonNode.displayName = 'PentagonNode';

