import type { Node, Edge } from '@xyflow/react';

// ----------------------------------------------------------------------
// Glow Configuration
// ----------------------------------------------------------------------

export type GlowIntensity = 'subtle' | 'medium' | 'intense';

// ----------------------------------------------------------------------
// Shadow Configuration
// ----------------------------------------------------------------------

export type ShadowType = 'none' | 'soft' | 'elevated' | 'layered';

// ----------------------------------------------------------------------
// Animation Configuration
// ----------------------------------------------------------------------

export type EntranceAnimation = 'scale' | 'fade' | 'pop' | 'float';
export type IdleAnimation = 'none' | 'pulse' | 'breathe' | 'float';
export type HoverAnimation = 'none' | 'lift' | 'glow' | 'scale';

// ----------------------------------------------------------------------
// Circular Node Data
// ----------------------------------------------------------------------

export interface CircularNodeData {
  // Content
  label?: string;
  description?: string;
  showDescription?: boolean;

  // Size
  size?: number;

  // Background
  backgroundColor?: string;
  gradientColors?: [string, string];
  gradientDirection?: 'radial' | 'linear';
  gradientAngle?: number;

  // Glow
  glowEnabled?: boolean;
  glowColor?: string;
  glowIntensity?: GlowIntensity;
  glowPulse?: boolean;

  // Border
  borderWidth?: number;
  borderColor?: string;
  borderGradient?: [string, string];
  borderAnimated?: boolean;
  doubleRing?: boolean;
  ringGap?: number;

  // Magic Border (mouse-following gradient)
  magicBorder?: boolean;
  magicGradientSize?: number;
  magicGradientFrom?: string;
  magicGradientTo?: string;

  // Glass Effect
  glassEffect?: boolean;
  glassBlur?: number;
  glassTint?: string;
  glassDistortion?: boolean;
  distortionStrength?: number;

  // Shadow
  shadowType?: ShadowType;
  shadowColor?: string;
  innerShadow?: boolean;

  // Animation
  entranceAnimation?: EntranceAnimation;
  entranceDelay?: number;
  idleAnimation?: IdleAnimation;
  hoverAnimation?: HoverAnimation;
  ringPulse?: boolean;

  // Typography
  textColor?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  textGradient?: [string, string];

  // Icon
  icon?: string;
  iconUrl?: string;
  iconPosition?: 'top' | 'left' | 'center';
  iconSize?: number;

  // Mesh Gradient
  meshGradient?: boolean;
  meshColors?: [string, string, string, string]; // 4 colors for mesh points
  meshSpeed?: number; // Animation speed multiplier (0.1 - 2.0, default 1)
  meshAmplitude?: number; // Wave amplitude (0-100, default 50)

  // Grain
  grainAmount?: number; // 0-100 (0 = no grain, 100 = max grain)
  grainBlendMode?: 'overlay' | 'soft-light' | 'multiply' | 'screen';

  // Light Rays
  lightRays?: boolean; // Enable light rays effect
  lightRaysCount?: number; // Number of rays (default: 7)
  lightRaysColor?: string; // Ray color (default: 'rgba(160, 210, 255, 0.2)')
  lightRaysBlur?: number; // Blur amount in px (default: 36)
  lightRaysSpeed?: number; // Animation cycle duration in seconds (default: 14)
  lightRaysLength?: string; // Ray length (default: '100%')

  // Shine Effect
  shine?: boolean; // Trigger shine animation on the node

  // State (internal)
  index?: number;
  isExiting?: boolean;
  exitAnimationType?: 'slide' | 'shuffle';
}

// ----------------------------------------------------------------------
// Style Presets
// ----------------------------------------------------------------------

export type StylePreset = 'minimal' | 'glassmorphism' | 'neon' | 'gradient-glow' | 'elevated-card';

export const STYLE_PRESETS: Record<StylePreset, Partial<CircularNodeData>> = {
  minimal: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowType: 'soft',
  },
  glassmorphism: {
    glassEffect: true,
    glassBlur: 12,
    glassTint: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  neon: {
    backgroundColor: '#0a0a0a',
    glowEnabled: true,
    glowColor: '#22d3ee',
    glowIntensity: 'intense',
    borderColor: '#22d3ee',
  },
  'gradient-glow': {
    gradientColors: ['#667eea', '#764ba2'],
    glowEnabled: true,
    glowPulse: true,
    borderGradient: ['#a78bfa', '#f472b6'],
  },
  'elevated-card': {
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    shadowType: 'elevated',
    hoverAnimation: 'lift',
  },
};

// ----------------------------------------------------------------------
// Mesh Gradient Presets
// ----------------------------------------------------------------------

export const MESH_GRADIENT_PRESETS = {
  aurora: ['#667eea', '#764ba2', '#f093fb', '#f5576c'] as [string, string, string, string],
  ocean: ['#0077b6', '#00b4d8', '#90e0ef', '#48cae4'] as [string, string, string, string],
  sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#f368e0'] as [string, string, string, string],
  forest: ['#2d6a4f', '#40916c', '#52b788', '#95d5b2'] as [string, string, string, string],
  cosmic: ['#7400b8', '#6930c3', '#5e60ce', '#4ea8de'] as [string, string, string, string],
  fire: ['#ff4d4d', '#ff6b35', '#f7931e', '#ffd23f'] as [string, string, string, string],
};

// ----------------------------------------------------------------------
// Background Configuration
// ----------------------------------------------------------------------

export type BackgroundType = 'dots' | 'lines' | 'cross' | 'interactive-grid';

// ----------------------------------------------------------------------
// V3 Interface Props
// ----------------------------------------------------------------------

export interface V3InterfaceProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  backgroundType?: BackgroundType;
  // Interactive grid options
  gridSquareSize?: number;
  gridSquares?: [number, number];
}

// ----------------------------------------------------------------------
// Floating Chat View Types
// ----------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MentionTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: 'analyze' | 'explain' | 'summarize';
}

export interface FloatingChatViewProps {
  open: boolean;
  onClose: () => void;
  initialMessage?: string | null;
  contextTitle?: string;
  contextSubtitle?: string;
  contextIcon?: string;
}

export interface MentionTabsMenuProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSelect: (tab: MentionTab) => void;
  searchQuery?: string;
}

// ----------------------------------------------------------------------
// Floating Node Form Types
// ----------------------------------------------------------------------

export interface NodeFormData {
  label: string;
  content: any | null; // JSONContent from Novel/Tiptap
  backgroundImage: string | null;
}

export interface FloatingNodeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NodeFormData) => void;
}

