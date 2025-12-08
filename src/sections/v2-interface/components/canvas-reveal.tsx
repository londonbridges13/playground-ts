'use client';

import { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import html2canvas from 'html2canvas';
import gsap from 'gsap';

import { useUnrollingScene, type UnrollingMesh } from '../hooks/use-unrolling-scene';
import { UNROLL_MODES, UNROLL_ANGLES } from './unrolling-canvas';

// ----------------------------------------------------------------------

interface CanvasRevealProps {
  children: React.ReactNode;
  /** Whether the reveal animation is enabled. When false, children are rendered directly. */
  enabled?: boolean;
  duration?: number;
  delay?: number;
  ease?: string;
  onRevealComplete?: () => void;
}

type RevealPhase = 'rendering' | 'captured' | 'animating' | 'complete';

// ----------------------------------------------------------------------

/**
 * CanvasReveal - Wraps content and reveals it with a center-out unroll animation on mount
 *
 * Uses html2canvas to capture the actual React Flow canvas content,
 * then animates it with a Three.js unrolling effect.
 */
export function CanvasReveal({
  children,
  enabled = true,
  duration = 2.0,
  delay = 0.3,
  ease = 'power2.out',
  onRevealComplete,
}: CanvasRevealProps) {
  const theme = useTheme();

  // If disabled, render children in a sized container (ReactFlow requires parent dimensions)
  if (!enabled) {
    return (
      <Box sx={{ position: 'absolute', inset: 0 }}>
        {children}
      </Box>
    );
  }
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<UnrollingMesh | null>(null);
  const capturedImageRef = useRef<string | null>(null);
  const dimensionsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  // Get the background color from the theme
  const bgColor = theme.palette.background.default;

  // Phase-based state machine for the reveal animation
  // 'rendering' - Content is visible, waiting for React Flow to render
  // 'captured' - Screenshot taken, transitioning to animation
  // 'animating' - Content hidden, Three.js unroll animation playing
  // 'complete' - Animation done, content visible again
  const [phase, setPhase] = useState<RevealPhase>('rendering');

  // Only initialize Three.js scene when we're ready to animate
  const { createMesh, removeMesh, render } = useUnrollingScene({
    container: phase === 'animating' ? canvasContainerRef.current : null,
    backgroundColor: bgColor,
  });

  // Step 1: Capture content after initial render
  useEffect(() => {
    if (phase !== 'rendering') return;

    const captureContent = async () => {
      if (!contentRef.current) return;

      // Wait for React Flow to fully initialize and render
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Get dimensions from the content container
      const width = contentRef.current.clientWidth;
      const height = contentRef.current.clientHeight;

      if (width === 0 || height === 0) {
        console.warn('Content has no dimensions, skipping animation');
        setPhase('complete');
        onRevealComplete?.();
        return;
      }

      try {
        // Capture the actual content using html2canvas
        const canvas = await html2canvas(contentRef.current, {
          width,
          height,
          scale: window.devicePixelRatio,
          backgroundColor: bgColor, // Use the theme background color
          ignoreElements: (element) =>
            element instanceof HTMLElement && element.dataset?.threeOverlay === 'true',
        });
        const dataUrl = canvas.toDataURL('image/png');

        // Store the captured data
        capturedImageRef.current = dataUrl;
        dimensionsRef.current = { width, height };

        // Move to next phase - this will trigger Three.js initialization
        setPhase('captured');
      } catch (error) {
        console.error('Failed to capture content:', error);
        setPhase('complete');
        onRevealComplete?.();
      }
    };

    captureContent();
  }, [phase, onRevealComplete, bgColor]);

  // Step 2: After capture, switch to animating phase (which mounts the Three.js container)
  useEffect(() => {
    if (phase !== 'captured') return;

    // Small delay to ensure DOM updates
    const timer = setTimeout(() => {
      setPhase('animating');
    }, 50);

    return () => clearTimeout(timer);
  }, [phase]);

  // Step 3: Once Three.js scene is ready, create mesh and animate
  useEffect(() => {
    if (phase !== 'animating') return;
    if (!capturedImageRef.current || !canvasContainerRef.current) return;

    // Wait for Three.js to initialize (the hook's useEffect needs to run)
    const initAndAnimate = async () => {
      // Wait for Three.js scene to be created
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { width, height } = dimensionsRef.current;
      const dataUrl = capturedImageRef.current;

      if (!dataUrl) return;

      // Load the captured image
      const img = new Image();
      img.onload = () => {
        const mesh = createMesh({
          image: img,
          width,
          height,
          x: 0,
          y: 0,
          angle: UNROLL_ANGLES.HORIZONTAL,
          mode: UNROLL_MODES.CENTER_OUT,
        });

        if (mesh) {
          meshRef.current = mesh;

          // Start with progress = 0 (rolled up)
          mesh.material.uniforms.progress.value = 0;
          render();

          // Animate the unroll
          gsap.to(mesh.material.uniforms.progress, {
            duration,
            delay,
            value: 1,
            ease,
            onUpdate: render,
            onComplete: () => {
              if (canvasContainerRef.current) {
                gsap.to(canvasContainerRef.current, {
                  duration: 0.5,
                  opacity: 0,
                  onComplete: () => {
                    setPhase('complete');
                    if (meshRef.current) {
                      removeMesh(meshRef.current);
                      meshRef.current = null;
                    }
                    capturedImageRef.current = null;
                    onRevealComplete?.();
                  },
                });
              }
            },
          });
        } else {
          // Mesh creation failed, just show content
          console.warn('Failed to create mesh');
          setPhase('complete');
          onRevealComplete?.();
        }
      };

      img.onerror = () => {
        console.error('Failed to load captured image');
        setPhase('complete');
        onRevealComplete?.();
      };

      img.src = dataUrl;
    };

    initAndAnimate();
  }, [phase, createMesh, removeMesh, render, duration, delay, ease, onRevealComplete]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (meshRef.current) {
        removeMesh(meshRef.current);
        meshRef.current = null;
      }
    },
    [removeMesh]
  );

  const isContentVisible = phase === 'rendering' || phase === 'complete';
  const showOverlay = phase === 'captured' || phase === 'animating';

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Actual content - visible during rendering and after complete */}
      <Box
        ref={contentRef}
        sx={{
          width: '100%',
          height: '100%',
          opacity: isContentVisible ? 1 : 0,
          visibility: isContentVisible ? 'visible' : 'hidden',
          transition: phase === 'complete' ? 'opacity 0.3s ease-in' : 'none',
        }}
      >
        {children}
      </Box>

      {/* Three.js unrolling overlay */}
      {showOverlay && (
        <Box
          ref={canvasContainerRef}
          data-three-overlay="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            bgcolor: 'background.default',
          }}
        />
      )}
    </Box>
  );
}

