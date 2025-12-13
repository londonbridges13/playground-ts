'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m, useAnimation } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { CircularNodeData, GlowIntensity, ShadowType } from '../types';
import { MagicCircleBorder } from '../components/magic-border';

// ----------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------

const GLOW_SHADOWS: Record<GlowIntensity, (color: string) => string> = {
  subtle: (color) => `0 0 20px 5px ${color}`,
  medium: (color) => `0 0 40px 10px ${color}`,
  intense: (color) => `0 0 60px 20px ${color}`,
};

const SHADOW_PRESETS: Record<ShadowType, (color: string) => string> = {
  none: () => 'none',
  soft: (color) => `0 8px 32px ${color}`,
  elevated: (color) => `0 4px 6px -1px ${color}, 0 10px 20px -2px ${color}`,
  layered: (color) => `0 2px 4px ${color}, 0 8px 16px ${color}, 0 16px 32px ${color}`,
};

const ENTRANCE_ANIMATIONS = {
  scale: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  pop: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  },
  float: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
};

// Idle animations are applied via a separate wrapper to avoid transition conflicts

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

function getBackground(data: CircularNodeData): string {
  if (data.gradientColors) {
    const [color1, color2] = data.gradientColors;
    if (data.gradientDirection === 'linear') {
      const angle = data.gradientAngle ?? 135;
      return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }
    return `radial-gradient(circle, ${color1}, ${color2})`;
  }
  return data.backgroundColor ?? '#1a1a2e';
}

function getShadow(data: CircularNodeData, selected: boolean): string {
  const shadowColor = data.shadowColor ?? 'rgba(0, 0, 0, 0.2)';
  const shadowType = data.shadowType ?? 'soft';
  const baseShadow = SHADOW_PRESETS[shadowType](shadowColor);

  const glowShadow =
    data.glowEnabled && data.glowColor
      ? GLOW_SHADOWS[data.glowIntensity ?? 'medium'](data.glowColor)
      : '';

  const innerShadow = data.innerShadow ? 'inset 0 0 20px -5px rgba(255, 255, 255, 0.3)' : '';

  const selectionShadow = selected ? '0 0 0 3px rgba(25, 118, 210, 0.5)' : '';

  return [baseShadow, glowShadow, innerShadow, selectionShadow].filter(Boolean).join(', ');
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------

interface GlowPulseRingProps {
  size: number;
  glowColor: string;
}

const GlowPulseRing = memo(({ size, glowColor }: GlowPulseRingProps) => (
  <m.div
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      border: `2px solid ${glowColor}`,
      pointerEvents: 'none',
    }}
    animate={{
      scale: [1, 1.3, 1.5],
      opacity: [0.6, 0.3, 0],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
));
GlowPulseRing.displayName = 'GlowPulseRing';

interface RingPulseProps {
  size: number;
  color: string;
}

const RingPulse = memo(({ size, color }: RingPulseProps) => (
  <>
    <m.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${color}`,
        pointerEvents: 'none',
      }}
      animate={{
        scale: [1, 1.4],
        opacity: [0.5, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
    <m.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${color}`,
        pointerEvents: 'none',
      }}
      animate={{
        scale: [1, 1.4],
        opacity: [0.5, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut',
        delay: 0.75,
      }}
    />
  </>
));
RingPulse.displayName = 'RingPulse';

interface GradientBorderProps {
  size: number;
  borderWidth: number;
  gradientColors: [string, string];
  animated?: boolean;
}

const GradientBorder = memo(({ size, borderWidth, gradientColors, animated }: GradientBorderProps) => {
  const [color1, color2] = gradientColors;

  return (
    <m.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        padding: borderWidth,
        pointerEvents: 'none',
      }}
      animate={animated ? { rotate: 360 } : undefined}
      transition={
        animated
          ? {
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }
          : undefined
      }
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'inherit',
        }}
      />
    </m.div>
  );
});
GradientBorder.displayName = 'GradientBorder';

interface DoubleRingProps {
  size: number;
  borderColor: string;
  borderWidth: number;
  ringGap: number;
}

const DoubleRing = memo(({ size, borderColor, borderWidth, ringGap }: DoubleRingProps) => (
  <>
    {/* Outer ring */}
    <div
      style={{
        position: 'absolute',
        width: size + ringGap * 2,
        height: size + ringGap * 2,
        borderRadius: '50%',
        border: `${borderWidth}px solid ${borderColor}`,
        opacity: 0.5,
        pointerEvents: 'none',
      }}
    />
  </>
));
DoubleRing.displayName = 'DoubleRing';

interface GlassEffectProps {
  size: number;
  blur: number;
  tint: string;
  distortion?: boolean;
  distortionStrength?: number;
  filterId: string;
}

const GlassEffect = memo(({ size, blur, tint, distortion, distortionStrength, filterId }: GlassEffectProps) => (
  <>
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        filter: distortion ? `url(#${filterId})` : undefined,
        backgroundColor: tint,
        pointerEvents: 'none',
      }}
    />
    {distortion && (
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="2"
              seed="42"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale={distortionStrength ?? 30}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    )}
  </>
));
GlassEffect.displayName = 'GlassEffect';

// ----------------------------------------------------------------------
// Mesh Gradient Component
// ----------------------------------------------------------------------

interface MeshGradientProps {
  size: number;
  colors: [string, string, string, string];
  speed?: number;
  amplitude?: number;
}

const MeshGradient = memo(({ size, colors, speed = 1, amplitude = 50 }: MeshGradientProps) => {
  const [c1, c2, c3, c4] = colors;

  // Calculate animation duration based on speed (inverse relationship)
  const baseDuration = 8 / speed;

  // Amplitude affects the movement range (0-100 maps to 0-30% movement)
  const moveRange = (amplitude / 100) * 30;

  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Base layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
        }}
      />

      {/* Animated blob 1 */}
      <m.div
        style={{
          position: 'absolute',
          width: '140%',
          height: '140%',
          left: '-20%',
          top: '-20%',
          background: `radial-gradient(circle at center, ${c1} 0%, transparent 70%)`,
          opacity: 0.8,
        }}
        animate={{
          x: [`0%`, `${moveRange}%`, `0%`, `-${moveRange}%`, `0%`],
          y: [`0%`, `-${moveRange}%`, `${moveRange}%`, `0%`, `0%`],
        }}
        transition={{
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated blob 2 */}
      <m.div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          right: '-10%',
          top: '-10%',
          background: `radial-gradient(circle at center, ${c2} 0%, transparent 70%)`,
          opacity: 0.7,
        }}
        animate={{
          x: [`0%`, `-${moveRange}%`, `${moveRange}%`, `0%`, `0%`],
          y: [`0%`, `${moveRange}%`, `0%`, `-${moveRange}%`, `0%`],
        }}
        transition={{
          duration: baseDuration * 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />

      {/* Animated blob 3 */}
      <m.div
        style={{
          position: 'absolute',
          width: '130%',
          height: '130%',
          left: '-15%',
          bottom: '-15%',
          background: `radial-gradient(circle at center, ${c3} 0%, transparent 70%)`,
          opacity: 0.75,
        }}
        animate={{
          x: [`0%`, `${moveRange * 0.8}%`, `-${moveRange * 0.8}%`, `0%`],
          y: [`0%`, `-${moveRange * 0.6}%`, `${moveRange * 0.6}%`, `0%`],
        }}
        transition={{
          duration: baseDuration * 0.9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Animated blob 4 */}
      <m.div
        style={{
          position: 'absolute',
          width: '110%',
          height: '110%',
          right: '-5%',
          bottom: '-5%',
          background: `radial-gradient(circle at center, ${c4} 0%, transparent 70%)`,
          opacity: 0.65,
        }}
        animate={{
          x: [`0%`, `-${moveRange * 0.7}%`, `0%`, `${moveRange * 0.7}%`, `0%`],
          y: [`0%`, `${moveRange * 0.5}%`, `-${moveRange * 0.5}%`, `0%`, `0%`],
        }}
        transition={{
          duration: baseDuration * 1.1,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
      />
    </Box>
  );
});
MeshGradient.displayName = 'MeshGradient';

// ----------------------------------------------------------------------
// Grain Overlay Component
// ----------------------------------------------------------------------

interface GrainOverlayProps {
  size: number;
  amount: number; // 0-100
  blendMode?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
  filterId: string;
}

const GrainOverlay = memo(({ size, amount, blendMode = 'overlay', filterId }: GrainOverlayProps) => {
  if (amount <= 0) return null;

  // Map 0-100 to baseFrequency range (0.5 to 0.9 for visible grain)
  const baseFrequency = 0.5 + (amount / 100) * 0.4;

  // Map 0-100 to opacity (0 to 0.4 for subtle to heavy grain)
  const opacity = (amount / 100) * 0.4;

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves={4}
              seed={Math.floor(Math.random() * 100)}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="mono"
            />
          </filter>
        </defs>
      </svg>
      <Box
        sx={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          filter: `url(#${filterId})`,
          opacity,
          mixBlendMode: blendMode,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    </>
  );
});
GrainOverlay.displayName = 'GrainOverlay';

// ----------------------------------------------------------------------
// Light Rays Component
// ----------------------------------------------------------------------

type LightRay = {
  id: string;
  left: number;
  rotate: number;
  width: number;
  swing: number;
  delay: number;
  duration: number;
  intensity: number;
};

const createRays = (count: number, cycle: number): LightRay[] => {
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const left = 8 + Math.random() * 84;
    const rotate = -28 + Math.random() * 56;
    const width = 20 + Math.random() * 40; // Scaled for circular nodes
    const swing = 0.8 + Math.random() * 1.8;
    const delay = Math.random() * cycle;
    const duration = cycle * (0.75 + Math.random() * 0.5);
    const intensity = 0.6 + Math.random() * 0.5;

    return {
      id: `${index}-${Math.round(left * 10)}`,
      left,
      rotate,
      width,
      swing,
      delay,
      duration,
      intensity,
    };
  });
};

interface LightRaysEffectProps {
  size: number;
  count?: number;
  color?: string;
  blur?: number;
  speed?: number;
  length?: string;
}

const LightRaysEffect = memo(({
  size,
  count = 7,
  color = 'rgba(160, 210, 255, 0.5)',
  blur = 36,
  speed = 14,
  length = '100%',
}: LightRaysEffectProps) => {
  const [rays, setRays] = useState<LightRay[]>([]);

  useEffect(() => {
    setRays(createRays(count, Math.max(speed, 0.1)));
  }, [count, speed]);

  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {/* Ambient glow spots */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.6,
          background: `radial-gradient(circle at 20% 15%, ${color}, transparent 70%)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          background: `radial-gradient(circle at 80% 10%, ${color}, transparent 75%)`,
        }}
      />

      {/* Animated rays */}
      {rays.map((ray) => (
        <m.div
          key={ray.id}
          style={{
            position: 'absolute',
            top: '-12%',
            left: `${ray.left}%`,
            height: length,
            width: ray.width,
            transformOrigin: 'top center',
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: `linear-gradient(to bottom, ${color}, transparent)`,
            filter: `blur(${blur}px)`,
            pointerEvents: 'none',
          }}
          initial={{ rotate: ray.rotate, opacity: 0 }}
          animate={{
            opacity: [0, ray.intensity, 0],
            rotate: [ray.rotate - ray.swing, ray.rotate + ray.swing, ray.rotate - ray.swing],
          }}
          transition={{
            duration: ray.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: ray.delay,
            repeatDelay: ray.duration * 0.1,
          }}
        />
      ))}
    </Box>
  );
});
LightRaysEffect.displayName = 'LightRaysEffect';

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export const CircularNode = memo(({ data, isConnectable, selected, id }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as CircularNodeData;

  // Destructure with defaults
  const {
    label = '',
    description = '',
    showDescription = true,
    size = 140,
    borderWidth = 2,
    borderColor = 'rgba(255, 255, 255, 0.3)',
    borderGradient,
    borderAnimated = false,
    doubleRing = false,
    ringGap = 8,
    // Magic Border
    magicBorder = false,
    magicGradientSize = 200,
    magicGradientFrom = '#9E7AFF',
    magicGradientTo = '#FE8BBB',
    glowEnabled = false,
    glowColor = 'rgba(99, 102, 241, 0.5)',
    glowPulse = false,
    glassEffect = false,
    glassBlur = 8,
    glassTint = 'rgba(255, 255, 255, 0.1)',
    glassDistortion = false,
    distortionStrength = 30,
    entranceAnimation = 'scale',
    entranceDelay = 0,
    idleAnimation = 'none',
    hoverAnimation = 'none',
    ringPulse = false,
    textColor = '#ffffff',
    fontSize = 14,
    fontWeight = 600,
    fontFamily,
    textGradient,
    // Mesh Gradient
    meshGradient = false,
    meshColors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'] as [string, string, string, string],
    meshSpeed = 1,
    meshAmplitude = 50,
    // Grain
    grainAmount = 0,
    grainBlendMode = 'overlay' as const,
    // Light Rays
    lightRays = false,
    lightRaysCount = 7,
    lightRaysColor = 'rgba(160, 210, 255, 0.2)',
    lightRaysBlur = 36,
    lightRaysSpeed = 14,
    lightRaysLength = '100%',
    // Shine Effect
    shine = false,
    index = 0,
  } = nodeData;

  // Memoized values
  const background = useMemo(() => getBackground(nodeData), [nodeData]);
  const boxShadow = useMemo(() => getShadow(nodeData, selected ?? false), [nodeData, selected]);
  const filterId = useMemo(() => `glass-distortion-${id}`, [id]);
  const grainFilterId = useMemo(() => `grain-${id}`, [id]);

  // Animation config
  const entranceConfig = ENTRANCE_ANIMATIONS[entranceAnimation];

  // Idle animation config
  const idleAnimateProps = useMemo(() => {
    switch (idleAnimation) {
      case 'pulse':
        return { scale: [1, 1.03, 1] };
      case 'breathe':
        return { scale: [1, 1.015, 1], opacity: [1, 0.95, 1] };
      case 'float':
        return { y: [0, -5, 0] };
      default:
        return {};
    }
  }, [idleAnimation]);

  const idleTransition = useMemo(() => {
    switch (idleAnimation) {
      case 'pulse':
        return { duration: 2, repeat: Infinity, ease: 'easeInOut' as const };
      case 'breathe':
        return { duration: 3, repeat: Infinity, ease: 'easeInOut' as const };
      case 'float':
        return { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const };
      default:
        return undefined;
    }
  }, [idleAnimation]);

  // Hover styles
  const hoverStyles = useMemo(() => {
    if (!isHovered || hoverAnimation === 'none') return {};
    switch (hoverAnimation) {
      case 'lift':
        return { y: -4 };
      case 'scale':
        return { scale: 1.05 };
      case 'glow':
        return {}; // Handled via boxShadow
      default:
        return {};
    }
  }, [isHovered, hoverAnimation]);

  // Text gradient style
  const textStyle = useMemo(() => {
    if (textGradient) {
      return {
        background: `linear-gradient(135deg, ${textGradient[0]}, ${textGradient[1]})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    }
    return { color: textColor };
  }, [textGradient, textColor]);

  // Combine animations
  const animateProps = useMemo(() => ({
    ...entranceConfig.animate,
    ...idleAnimateProps,
    ...hoverStyles,
  }), [entranceConfig.animate, idleAnimateProps, hoverStyles]);

  // Combine transitions
  const transitionProps = useMemo(() => {
    const baseTransition = {
      duration: 0.5,
      delay: entranceDelay + index * 0.08,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    };
    if (idleTransition) {
      return { ...baseTransition, ...idleTransition };
    }
    return baseTransition;
  }, [entranceDelay, index, idleTransition]);

  return (
    <m.div
      initial={entranceConfig.initial}
      animate={animateProps}
      transition={transitionProps}
      style={{
        width: size + (doubleRing ? ringGap * 2 : 0),
        height: size + (doubleRing ? ringGap * 2 : 0),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ring Pulse Animation */}
      {ringPulse && <RingPulse size={size} color={glowColor} />}

      {/* Glow Pulse Ring */}
      {glowEnabled && glowPulse && <GlowPulseRing size={size} glowColor={glowColor} />}

      {/* Double Ring (outer) */}
      {doubleRing && (
        <DoubleRing size={size} borderColor={borderColor} borderWidth={borderWidth} ringGap={ringGap} />
      )}

      {/* Gradient Border */}
      {borderGradient && (
        <GradientBorder
          size={size}
          borderWidth={borderWidth}
          gradientColors={borderGradient}
          animated={borderAnimated}
        />
      )}

      {/* Glass Effect */}
      {glassEffect && (
        <GlassEffect
          size={size}
          blur={glassBlur}
          tint={glassTint}
          distortion={glassDistortion}
          distortionStrength={distortionStrength}
          filterId={filterId}
        />
      )}

      {/* Mesh Gradient Background */}
      {meshGradient && (
        <MeshGradient
          size={size}
          colors={meshColors}
          speed={meshSpeed}
          amplitude={meshAmplitude}
        />
      )}

      {/* Grain Overlay */}
      {grainAmount > 0 && (
        <GrainOverlay
          size={size}
          amount={grainAmount}
          blendMode={grainBlendMode}
          filterId={grainFilterId}
        />
      )}

      {/* Magic Border */}
      {magicBorder && (
        <MagicCircleBorder
          size={size}
          borderWidth={borderWidth}
          gradientSize={magicGradientSize}
          gradientFrom={magicGradientFrom}
          gradientTo={magicGradientTo}
        />
      )}

      {/* Main Circle */}
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: meshGradient ? 'transparent' : background,
          outline: (borderGradient || magicBorder) ? 'none' : `${borderWidth}px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow,
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          transition: hoverAnimation === 'glow' ? 'box-shadow 0.3s ease' : undefined,
        }}
      >
        {/* Shine Effect Overlay */}
        {shine && (
          <m.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          />
        )}

        {/* Label */}
        <Typography
          sx={{
            ...textStyle,
            fontWeight,
            fontSize,
            fontFamily,
            textAlign: 'center',
            px: 1,
          }}
        >
          {label}
        </Typography>

        {/* Description */}
        {showDescription && description && (
          <Typography
            sx={{
              color: textColor,
              opacity: 0.7,
              fontSize: '0.65rem',
              textAlign: 'center',
              px: 1,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Invisible center handle - covers entire node for easy drop target */}
        <Handle
          type="target"
          position={Position.Top}
          id="center"
          isConnectable={isConnectable}
          style={{
            width: size,
            height: size,
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            pointerEvents: 'all',
          }}
        />
        {/* Handles - visible on hover */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            width: 12,
            height: 12,
            background: '#6366f1',
            border: '2px solid #fff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            width: 12,
            height: 12,
            background: '#6366f1',
            border: '2px solid #fff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={{
            width: 12,
            height: 12,
            background: '#6366f1',
            border: '2px solid #fff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={{
            width: 12,
            height: 12,
            background: '#6366f1',
            border: '2px solid #fff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
      </Box>

      {/* Light Rays Effect - rendered on top */}
      {lightRays && (
        <LightRaysEffect
          size={size}
          count={lightRaysCount}
          color={lightRaysColor}
          blur={lightRaysBlur}
          speed={lightRaysSpeed}
          length={lightRaysLength}
        />
      )}
    </m.div>
  );
});

CircularNode.displayName = 'CircularNode';

