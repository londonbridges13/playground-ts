'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import gsap from 'gsap';

import { useUnrollingScene, type UnrollingMesh } from '../hooks/use-unrolling-scene';

// ----------------------------------------------------------------------

export interface UnrollingItem {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number; // 0 = horizontal, π/2 = vertical, 0.3 = angled (default)
  mode?: number; // 0 = single direction, 1 = center-out
}

interface UnrollingCanvasProps {
  items?: UnrollingItem[];
  defaultAngle?: number;
  defaultMode?: number; // 0 = single direction, 1 = center-out
  animationDuration?: number;
  animationEase?: string;
  onItemAnimationComplete?: (itemId: string) => void;
}

// ----------------------------------------------------------------------

export function UnrollingCanvas({
  items = [],
  defaultAngle = 0.3,
  defaultMode = 0,
  animationDuration = 1.7,
  animationEase = 'power2.out',
  onItemAnimationComplete,
}: UnrollingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const meshMapRef = useRef<Map<string, UnrollingMesh>>(new Map());

  const { createMesh, removeMesh, render, screenToWorld } = useUnrollingScene({
    container: isReady ? containerRef.current : null,
  });

  // Set ready state after mount
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Handle items changes
  useEffect(() => {
    if (!isReady) return;

    const currentIds = new Set(items.map((item) => item.id));
    const existingIds = new Set(meshMapRef.current.keys());

    // Remove meshes for items that no longer exist
    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        const mesh = meshMapRef.current.get(id);
        if (mesh) {
          // Animate roll back before removing
          gsap.to(mesh.material.uniforms.progress, {
            duration: animationDuration,
            value: 0,
            ease: 'power2.inOut',
            onUpdate: render,
            onComplete: () => {
              removeMesh(mesh);
              meshMapRef.current.delete(id);
              render();
            },
          });
        }
      }
    });

    // Add meshes for new items
    items.forEach((item) => {
      if (!meshMapRef.current.has(item.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Convert screen position to world coordinates
          const worldPos = screenToWorld(item.x + item.width / 2, item.y + item.height / 2);

          const mesh = createMesh({
            image: img,
            width: item.width,
            height: item.height,
            x: worldPos.x,
            y: worldPos.y,
            angle: item.angle ?? defaultAngle,
            mode: item.mode ?? defaultMode,
          });

          if (mesh) {
            meshMapRef.current.set(item.id, mesh);

            // Animate unroll
            gsap.to(mesh.material.uniforms.progress, {
              duration: animationDuration,
              value: 1,
              ease: animationEase,
              onUpdate: render,
              onComplete: () => {
                onItemAnimationComplete?.(item.id);
              },
            });
          }
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${item.imageUrl}`);
        };
        img.src = item.imageUrl;
      }
    });
  }, [
    items,
    isReady,
    createMesh,
    removeMesh,
    render,
    screenToWorld,
    defaultAngle,
    defaultMode,
    animationDuration,
    animationEase,
    onItemAnimationComplete,
  ]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      meshMapRef.current.forEach((mesh) => {
        removeMesh(mesh);
      });
      meshMapRef.current.clear();
    },
    [removeMesh]
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    />
  );
}

// ----------------------------------------------------------------------

// Utility function to trigger unroll animation on a specific item
export function triggerUnroll(
  mesh: UnrollingMesh,
  options?: {
    duration?: number;
    ease?: string;
    onUpdate?: () => void;
    onComplete?: () => void;
  }
) {
  gsap.to(mesh.material.uniforms.progress, {
    duration: options?.duration ?? 1.7,
    value: 1,
    ease: options?.ease ?? 'power2.out',
    onUpdate: options?.onUpdate,
    onComplete: options?.onComplete,
  });
}

// Utility function to trigger roll back animation on a specific item
export function triggerRollBack(
  mesh: UnrollingMesh,
  options?: {
    duration?: number;
    ease?: string;
    onUpdate?: () => void;
    onComplete?: () => void;
  }
) {
  gsap.to(mesh.material.uniforms.progress, {
    duration: options?.duration ?? 1.7,
    value: 0,
    ease: options?.ease ?? 'power2.inOut',
    onUpdate: options?.onUpdate,
    onComplete: options?.onComplete,
  });
}

// Utility function to change the unroll angle
export function setUnrollAngle(mesh: UnrollingMesh, angle: number) {
  mesh.material.uniforms.angle.value = angle;
}

// Utility function to change the unroll mode
export function setUnrollMode(mesh: UnrollingMesh, mode: number) {
  mesh.material.uniforms.mode.value = mode;
}

// Preset angles (for single-direction mode)
export const UNROLL_ANGLES = {
  HORIZONTAL: 0,
  VERTICAL: Math.PI / 2,
  ANGLED: 0.3, // ~17 degrees
  ANGLED_STEEP: Math.PI / 4, // 45 degrees
} as const;

// Unroll modes
export const UNROLL_MODES = {
  SINGLE: 0, // Single direction unroll (uses angle)
  CENTER_OUT: 1, // Center-outward double unroll (horizontal)
} as const;
