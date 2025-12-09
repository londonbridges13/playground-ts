'use client';

import { memo, useMemo } from 'react';
import { EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import type { IconifyName } from 'src/components/iconify/register-icons';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface PulseButtonEdgeData {
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
  // Line type: catmullRom creates smooth flowing curves
  lineType?: 'straight' | 'curved' | 'bezier' | 'catmullRom';
  // For catmullRom: tension (0.3 = tight, 0.7 = loose). For curved: perpendicular offset ratio
  curvature?: number;
  // Handle offset: adjusts edge endpoints to match floating handles
  handleOffset?: number;
}

// ----------------------------------------------------------------------
// Path Generation
// ----------------------------------------------------------------------

interface Point {
  x: number;
  y: number;
}

/**
 * Generate a Catmull-Rom spline path converted to cubic Bezier for SVG
 * Creates smooth, flowing curves that pass through control points
 */
function generateCatmullRomPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  tension: number = 0.5
): { path: string; labelX: number; labelY: number } {
  // Calculate direction and distance
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  // Create synthetic points before source and after target
  // This gives us 4 points: P0, P1 (source), P2 (target), P3
  const p0: Point = { x: sourceX - dx * 0.5, y: sourceY - dy * 0.5 };
  const p1: Point = { x: sourceX, y: sourceY };
  const p2: Point = { x: targetX, y: targetY };
  const p3: Point = { x: targetX + dx * 0.5, y: targetY + dy * 0.5 };

  // Catmull-Rom to Bezier conversion
  // The tension parameter controls how tight the curve is
  const alpha = Math.max(0.01, tension); // Prevent division by zero

  // Control point 1 (influences curve leaving source)
  const cp1: Point = {
    x: p1.x + (p2.x - p0.x) / (6 * alpha),
    y: p1.y + (p2.y - p0.y) / (6 * alpha),
  };

  // Control point 2 (influences curve arriving at target)
  const cp2: Point = {
    x: p2.x - (p3.x - p1.x) / (6 * alpha),
    y: p2.y - (p3.y - p1.y) / (6 * alpha),
  };

  // Calculate label position at curve midpoint (t = 0.5)
  // Using cubic Bezier formula: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
  const t = 0.5;
  const mt = 1 - t;
  const labelX =
    mt * mt * mt * p1.x +
    3 * mt * mt * t * cp1.x +
    3 * mt * t * t * cp2.x +
    t * t * t * p2.x;
  const labelY =
    mt * mt * mt * p1.y +
    3 * mt * mt * t * cp1.y +
    3 * mt * t * t * cp2.y +
    t * t * t * p2.y;

  // Return cubic Bezier path
  const path = `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;

  return { path, labelX, labelY };
}

function generatePath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  lineType: 'straight' | 'curved' | 'bezier' | 'catmullRom' = 'catmullRom',
  curvature: number = 0.5
): { path: string; labelX: number; labelY: number } {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Midpoint for label
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  if (lineType === 'straight') {
    return {
      path: `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`,
      labelX: midX,
      labelY: midY,
    };
  }

  if (lineType === 'bezier') {
    // Use React Flow's bezier path
    const [path, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
    return { path, labelX, labelY };
  }

  if (lineType === 'catmullRom') {
    // Use Catmull-Rom spline (curvature = tension)
    return generateCatmullRomPath(sourceX, sourceY, targetX, targetY, curvature);
  }

  // Curved path with perpendicular offset (quadratic bezier)
  const perpX = -dy / distance;
  const perpY = dx / distance;
  const offset = distance * curvature;

  const controlX = midX + perpX * offset;
  const controlY = midY + perpY * offset;

  return {
    path: `M ${sourceX} ${sourceY} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)}, ${targetX} ${targetY}`,
    labelX: controlX,
    labelY: controlY,
  };
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

export const PulseButtonEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) => {
  const edgeData = data as PulseButtonEdgeData | undefined;

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
  const lineType = edgeData?.lineType ?? 'curved';
  const curvature = edgeData?.curvature ?? 0.15;
  const handleOffset = edgeData?.handleOffset ?? 0;

  // Adjust source/target positions to account for floating handles
  // Source (right handle) needs offset added, Target (left handle) needs offset subtracted
  const adjustedSourceX = sourceX + handleOffset;
  const adjustedTargetX = targetX - handleOffset;

  // Generate path and label position
  const { path, labelX, labelY } = useMemo(
    () => generatePath(adjustedSourceX, sourceY, adjustedTargetX, targetY, lineType, curvature),
    [adjustedSourceX, sourceY, adjustedTargetX, targetY, lineType, curvature]
  );

  // Handle button click
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(id);
    }
  };

  return (
    <>
      <DottedPath
        path={path}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        dashArray={dashArray}
        dashOffset={dashOffset}
      />

      <EdgeButton
        labelX={labelX}
        labelY={labelY}
        icon={buttonIcon}
        size={buttonSize}
        color={buttonColor}
        bgColor={buttonBgColor}
        onClick={handleButtonClick}
      />
    </>
  );
});

PulseButtonEdge.displayName = 'PulseButtonEdge';

