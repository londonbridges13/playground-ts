'use client';

import { memo, useMemo } from 'react';
import { EdgeLabelRenderer, useNodes, BezierEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import { getSmartEdge, svgDrawSmoothLinePath } from '@tisoap/react-flow-smart-edge';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import type { IconifyName } from 'src/components/iconify/register-icons';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface SmartPulseButtonEdgeData {
  // Stroke styling
  strokeColor?: string;
  strokeWidth?: number;
  // Dotted line
  dashArray?: string;
  dashOffset?: number;
  // Button
  buttonIcon?: IconifyName;
  buttonSize?: number;
  buttonColor?: string;
  buttonBgColor?: string;
  onButtonClick?: (edgeId: string) => void;
  // Smart edge options
  nodePadding?: number;
  gridRatio?: number;
  // Handle offset: adjusts edge endpoints to match floating handles
  handleOffset?: number;
}

// ----------------------------------------------------------------------
// Dotted Path Component
// ----------------------------------------------------------------------

interface DottedPathProps {
  path: string;
  strokeColor: string;
  strokeWidth: number;
  dashArray?: string;
  dashOffset?: number;
}

const DottedPath = memo(({
  path,
  strokeColor,
  strokeWidth,
  dashArray = '6 8',
  dashOffset = 0,
}: DottedPathProps) => (
  <path
    d={path}
    fill="none"
    stroke={strokeColor}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeDasharray={dashArray}
    strokeDashoffset={dashOffset}
  />
));

DottedPath.displayName = 'DottedPath';

// ----------------------------------------------------------------------
// Edge Button Component
// ----------------------------------------------------------------------

interface EdgeButtonProps {
  labelX: number;
  labelY: number;
  icon: IconifyName;
  size: number;
  color: string;
  bgColor: string;
  onClick: () => void;
}

const EdgeButton = memo(({
  labelX,
  labelY,
  icon,
  size,
  color,
  bgColor,
  onClick,
}: EdgeButtonProps) => (
  <EdgeLabelRenderer>
    <Box
      sx={{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        pointerEvents: 'all',
      }}
    >
      <m.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3, type: 'spring' }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconButton
          size="small"
          onClick={onClick}
          sx={{
            width: size,
            height: size,
            backgroundColor: bgColor,
            color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: bgColor,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            },
          }}
        >
          <Iconify icon={icon} width={size * 0.5} />
        </IconButton>
      </m.div>
    </Box>
  </EdgeLabelRenderer>
));

EdgeButton.displayName = 'EdgeButton';

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export const SmartPulseButtonEdge = memo((props: EdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  } = props;

  const nodes = useNodes();
  const edgeData = data as SmartPulseButtonEdgeData | undefined;

  // Extract props with defaults
  const strokeColor = edgeData?.strokeColor ?? 'rgba(158, 122, 255, 0.8)';
  const strokeWidth = edgeData?.strokeWidth ?? 2;
  const dashArray = edgeData?.dashArray ?? '6 8';
  const dashOffset = edgeData?.dashOffset ?? 0;
  const buttonIcon = edgeData?.buttonIcon ?? 'solar:close-circle-bold';
  const buttonSize = edgeData?.buttonSize ?? 28;
  const buttonColor = edgeData?.buttonColor ?? '#ffffff';
  const buttonBgColor = edgeData?.buttonBgColor ?? 'rgba(158, 122, 255, 0.9)';
  const onButtonClick = edgeData?.onButtonClick;
  const nodePadding = edgeData?.nodePadding ?? 15;
  const gridRatio = edgeData?.gridRatio ?? 10;
  const handleOffset = edgeData?.handleOffset ?? 0;

  // Adjust source/target positions to account for floating handles
  const adjustedSourceX = sourceX + handleOffset;
  const adjustedTargetX = targetX - handleOffset;

  // Get smart edge path using pathfinding
  const smartEdgeResult = useMemo(() => {
    try {
      // Only run pathfinding if we have nodes
      if (!nodes || nodes.length === 0) {
        return null;
      }
      const result = getSmartEdge({
        sourcePosition,
        targetPosition,
        sourceX: adjustedSourceX,
        sourceY,
        targetX: adjustedTargetX,
        targetY,
        nodes,
        options: {
          nodePadding,
          gridRatio,
          drawEdge: svgDrawSmoothLinePath,
        },
      });
      return result;
    } catch (error) {
      console.error('Smart edge error:', error);
      return null;
    }
  }, [
    sourcePosition,
    targetPosition,
    adjustedSourceX,
    sourceY,
    adjustedTargetX,
    targetY,
    nodes,
    nodePadding,
    gridRatio,
  ]);

  // Handle button click
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(id);
    }
  };

  // Calculate fallback path values (used if smart edge fails or has no path)
  const midX = (adjustedSourceX + adjustedTargetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const fallbackPath = `M ${adjustedSourceX} ${sourceY} Q ${midX} ${midY}, ${adjustedTargetX} ${targetY}`;

  // Check if smart edge result is valid
  const isSmartEdgeValid = smartEdgeResult &&
    !(smartEdgeResult instanceof Error) &&
    typeof smartEdgeResult === 'object' &&
    'svgPathString' in smartEdgeResult &&
    smartEdgeResult.svgPathString;

  // If smart edge fails, fall back to a simple curved path
  if (!isSmartEdgeValid) {
    return (
      <>
        <DottedPath
          path={fallbackPath}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          dashArray={dashArray}
          dashOffset={dashOffset}
        />
        <EdgeButton
          labelX={midX}
          labelY={midY}
          icon={buttonIcon}
          size={buttonSize}
          color={buttonColor}
          bgColor={buttonBgColor}
          onClick={handleButtonClick}
        />
      </>
    );
  }

  const { svgPathString, edgeCenterX, edgeCenterY } = smartEdgeResult;

  return (
    <>
      <DottedPath
        path={svgPathString}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        dashArray={dashArray}
        dashOffset={dashOffset}
      />

      <EdgeButton
        labelX={edgeCenterX}
        labelY={edgeCenterY}
        icon={buttonIcon}
        size={buttonSize}
        color={buttonColor}
        bgColor={buttonBgColor}
        onClick={handleButtonClick}
      />
    </>
  );
});

SmartPulseButtonEdge.displayName = 'SmartPulseButtonEdge';

