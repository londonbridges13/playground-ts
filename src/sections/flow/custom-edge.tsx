import { memo, useState, useEffect } from 'react';
import type { EdgeProps } from '@xyflow/react';
import { m, useAnimationControls, type Variants } from 'framer-motion';

type HoverAnimationType = "float" | "pulse" | "redraw" | "color" | "sequential";

// Generate a rotatable line path from source to target
function generateRotatableLine(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  options?: {
    lineType?: 'straight' | 'curved' | 'artistic';
    curvature?: number;
    artisticPath?: string;
    targetPadding?: number;
  }
): { path: string; angle: number; distance: number; transform?: string } {
  // Apply padding to target position
  const padding = options?.targetPadding || 0;

  // Calculate direction vector
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Adjust target position by padding (move back along the line)
  const adjustedTargetX = targetX - (dx / distance) * padding;
  const adjustedTargetY = targetY - (dy / distance) * padding;

  // Recalculate with adjusted target
  const adjustedDx = adjustedTargetX - sourceX;
  const adjustedDy = adjustedTargetY - sourceY;
  const angleRadians = Math.atan2(adjustedDy, adjustedDx);
  const angleDegrees = (angleRadians * 180) / Math.PI;
  const adjustedDistance = Math.sqrt(adjustedDx * adjustedDx + adjustedDy * adjustedDy);

  const lineType = options?.lineType || 'straight';
  const curvature = options?.curvature || 0.3;

  let path: string;
  let transform: string | undefined;

  if (lineType === 'artistic' && options?.artisticPath) {
    // Use the artistic path with rotation and scaling

    // Original artistic path dimensions
    const originalStartX = 3.00;
    const originalStartY = 11.67;
    const originalEndX = 409.80;
    const originalEndY = 34.59;

    const originalDx = originalEndX - originalStartX;
    const originalDy = originalEndY - originalStartY;
    const originalDistance = Math.sqrt(originalDx * originalDx + originalDy * originalDy);
    const originalAngle = Math.atan2(originalDy, originalDx) * 180 / Math.PI;

    // Calculate transformation
    const scaleFactor = adjustedDistance / originalDistance;
    const rotationAngle = angleDegrees - originalAngle;

    // Use the artistic path as-is
    path = options.artisticPath;

    // Apply transform: translate to source, rotate around start point, scale
    transform = `translate(${sourceX - originalStartX} ${sourceY - originalStartY}) rotate(${rotationAngle} ${originalStartX} ${originalStartY}) scale(${scaleFactor})`;

  } else if (lineType === 'curved') {
    // Midpoint
    const midX = sourceX + adjustedDx / 2;
    const midY = sourceY + adjustedDy / 2;

    // Perpendicular offset (for curve)
    const perpX = -adjustedDy / adjustedDistance;
    const perpY = adjustedDx / adjustedDistance;

    // Control point
    const controlX = midX + perpX * adjustedDistance * curvature;
    const controlY = midY + perpY * adjustedDistance * curvature;

    // Quadratic bezier curve
    path = `M ${sourceX} ${sourceY} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)}, ${adjustedTargetX} ${adjustedTargetY}`;
  } else {
    // Straight line
    path = `M ${sourceX} ${sourceY} L ${adjustedTargetX} ${adjustedTargetY}`;
  }

  return {
    path,
    angle: angleDegrees,
    distance: adjustedDistance,
    transform,
  };
}

// Custom artistic path generator
function generateArtisticPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  curviness: number = 0.5,
  complexity: number = 3
): string {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Number of curve segments
  const segments = Math.max(2, Math.min(complexity, 5));

  let path = `M ${sourceX} ${sourceY}`;

  // Generate multiple cubic Bezier curves for organic flow
  for (let i = 0; i < segments; i++) {
    const t1 = (i + 1) / (segments + 1);
    const t2 = (i + 2) / (segments + 1);

    // Calculate intermediate points
    const x1 = sourceX + dx * t1;
    const y1 = sourceY + dy * t1;
    const x2 = sourceX + dx * t2;
    const y2 = sourceY + dy * t2;

    // Add perpendicular offset for curves
    const perpX = -dy / distance;
    const perpY = dx / distance;

    // Alternating curve direction for wave effect
    const direction = i % 2 === 0 ? 1 : -1;
    const offset = distance * curviness * direction * (0.3 + Math.sin(i) * 0.2);

    // Control points with artistic variation
    const cp1x = x1 + perpX * offset * 0.8;
    const cp1y = y1 + perpY * offset * 0.8;
    const cp2x = x1 + perpX * offset * 1.2 + dx * 0.1;
    const cp2y = y1 + perpY * offset * 1.2 + dy * 0.1;

    // End point of this segment
    const endX = i === segments - 1 ? targetX : x2;
    const endY = i === segments - 1 ? targetY : y2;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  }

  return path;
}

// Alternative: More complex artistic path with loops and flourishes
function generateComplexArtisticPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  style: 'wavy' | 'loopy' | 'flowing' = 'flowing'
): string {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Perpendicular vector
  const perpX = -dy / distance;
  const perpY = dx / distance;

  if (style === 'wavy') {
    // Wavy path with multiple curves
    const amplitude = distance * 0.3;
    const cp1x = sourceX + dx * 0.25 + perpX * amplitude;
    const cp1y = sourceY + dy * 0.25 + perpY * amplitude;
    const cp2x = sourceX + dx * 0.5 - perpX * amplitude;
    const cp2y = sourceY + dy * 0.5 - perpY * amplitude;
    const cp3x = sourceX + dx * 0.75 + perpX * amplitude * 0.5;
    const cp3y = sourceY + dy * 0.75 + perpY * amplitude * 0.5;

    return `M ${sourceX} ${sourceY} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${midX.toFixed(2)} ${midY.toFixed(2)} C ${cp3x.toFixed(2)} ${cp3y.toFixed(2)}, ${(targetX - dx * 0.1).toFixed(2)} ${(targetY - dy * 0.1).toFixed(2)}, ${targetX} ${targetY}`;
  } else if (style === 'loopy') {
    // Path with a loop in the middle
    const loopSize = distance * 0.4;
    const cp1x = sourceX + dx * 0.3 + perpX * loopSize;
    const cp1y = sourceY + dy * 0.3 + perpY * loopSize;
    const cp2x = midX + perpX * loopSize * 1.5;
    const cp2y = midY + perpY * loopSize * 1.5;
    const cp3x = midX - perpX * loopSize;
    const cp3y = midY - perpY * loopSize;
    const cp4x = targetX - dx * 0.3 + perpX * loopSize * 0.5;
    const cp4y = targetY - dy * 0.3 + perpY * loopSize * 0.5;

    return `M ${sourceX} ${sourceY} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${midX.toFixed(2)} ${midY.toFixed(2)} C ${cp3x.toFixed(2)} ${cp3y.toFixed(2)}, ${cp4x.toFixed(2)} ${cp4y.toFixed(2)}, ${targetX} ${targetY}`;
  } else {
    // Flowing organic path
    const flow = distance * 0.25;
    const cp1x = sourceX + dx * 0.2 + perpX * flow;
    const cp1y = sourceY + dy * 0.2 + perpY * flow;
    const cp2x = sourceX + dx * 0.4 - perpX * flow * 0.5;
    const cp2y = sourceY + dy * 0.4 - perpY * flow * 0.5;
    const cp3x = sourceX + dx * 0.6 + perpX * flow * 0.8;
    const cp3y = sourceY + dy * 0.6 + perpY * flow * 0.8;
    const cp4x = sourceX + dx * 0.8 - perpX * flow * 0.3;
    const cp4y = sourceY + dy * 0.8 - perpY * flow * 0.3;

    return `M ${sourceX} ${sourceY} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${midX.toFixed(2)} ${midY.toFixed(2)} C ${cp3x.toFixed(2)} ${cp3y.toFixed(2)}, ${cp4x.toFixed(2)} ${cp4y.toFixed(2)}, ${targetX} ${targetY}`;
  }
}

export const CustomAnimatedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const controls = useAnimationControls();

  // The artistic path
  const artisticPathData = "M3.00 11.67 C27.55 31.36, 46.94 39.70, 78.44 38.30 C106.88 37.04, 137.82 23.53, 164.28 13.68 C197.03 1.50, 306.10 -62.73, 280.35 30.77 C295.13 60.89, 272.98 96.91, 238.12 87.11 C224.68 83.33, 217.74 65.39, 223.69 52.94 C230.12 39.50, 249.34 33.02, 262.63 29.92 C298.33 21.59, 322.11 55.03, 354.41 60.90 C384.59 66.39, 407.00 52.87, 429.85 34.59 C431.81 33.02, 430.80 43.44, 430.80 46.05 C430.80 55.60, 432.71 51.36, 432.71 44.14 C432.71 39.49, 435.16 29.61, 428.89 32.25 C424.37 34.16, 414.87 34.59, 409.80 34.59";

  // Check if this edge should use the static artistic path or rotatable line
  const useStaticPath = data?.useStaticPath || false;
  const lineType = data?.lineType || 'straight';
  const curvature = data?.curvature || 0.3;
  const edgePadding = data?.edgePadding !== undefined ? data.edgePadding : 50;

  let edgePath: string;
  let pathTransform: string | undefined;

  if (useStaticPath) {
    // Use EXACT static path - no changes (for Node 1→2)
    edgePath = artisticPathData;
  } else {
    // Generate rotatable line based on source and target positions
    const result = generateRotatableLine(sourceX, sourceY, targetX, targetY, {
      lineType,
      curvature,
      artisticPath: lineType === 'artistic' ? artisticPathData : undefined,
      targetPadding: edgePadding,
    });
    edgePath = result.path;
    pathTransform = result.transform;
  }

  // Extract data props with defaults matching AnimateSvg
  const strokeColor = data?.strokeColor || '#000000';
  const strokeWidth = data?.strokeWidth || 2;
  const animationDuration = data?.animationDuration || 1.5;
  const animationDelay = data?.animationDelay || 0;
  const animationBounce = data?.animationBounce || 0.3;
  const reverseAnimation = data?.reverseAnimation || false;
  const enableHoverAnimation = data?.enableHoverAnimation || false;
  const hoverAnimationType: HoverAnimationType = data?.hoverAnimationType || 'redraw';
  const hoverStrokeColor = data?.hoverStrokeColor || '#4f46e5';
  const initialAnimation = data?.initialAnimation !== false;

  // Path variants matching AnimateSvg
  const pathVariants: Variants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
      pathOffset: reverseAnimation ? 1 : 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      pathOffset: reverseAnimation ? 0 : 0,
      transition: {
        pathLength: {
          type: "spring",
          duration: animationDuration,
          bounce: animationBounce,
          delay: animationDelay,
        },
        pathOffset: {
          duration: animationDuration,
          delay: animationDelay,
        },
        opacity: {
          duration: animationDuration / 4,
          delay: animationDelay,
        },
      },
    },
  };

  // Handle hover animations - exactly like AnimateSvg
  useEffect(() => {
    if (!isHovering) {
      controls.stop();
      if (initialAnimation) {
        controls.start("visible");
      }
      return;
    }

    switch (hoverAnimationType) {
      case "redraw":
        controls.start({
          pathLength: [1, 0, 1],
          transition: {
            pathLength: {
              repeat: Number.POSITIVE_INFINITY,
              duration: 3,
              ease: "easeInOut",
            },
          },
        });
        break;

      case "float":
        controls.start({
          y: [0, -2, 0],
          transition: {
            y: {
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.5,
              ease: "easeInOut",
            },
          },
        });
        break;

      case "pulse":
        controls.start({
          scale: [1, 1.03, 1],
          transition: {
            scale: {
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.3,
              ease: "easeInOut",
            },
          },
        });
        break;

      case "color":
        controls.start({
          stroke: [
            strokeColor,
            hoverStrokeColor,
            strokeColor,
          ],
          transition: {
            stroke: {
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            },
          },
        });
        break;

      case "sequential":
        controls.start({
          pathLength: [1, 0, 1],
          transition: {
            pathLength: {
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              delay: 0,
              ease: "easeInOut",
            },
          },
        });
        break;
    }
  }, [
    isHovering,
    hoverAnimationType,
    controls,
    strokeColor,
    hoverStrokeColor,
    initialAnimation,
  ]);

  return (
    <g
      onMouseEnter={() => enableHoverAnimation && setIsHovering(true)}
      onMouseLeave={() => enableHoverAnimation && setIsHovering(false)}
    >
      <m.path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        markerEnd={markerEnd}
        style={style}
        transform={pathTransform}
        initial={initialAnimation ? "hidden" : "visible"}
        animate={controls}
        variants={pathVariants}
      />
    </g>
  );
});

CustomAnimatedEdge.displayName = 'CustomAnimatedEdge';

