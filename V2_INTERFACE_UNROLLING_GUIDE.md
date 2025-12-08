# V2 Interface - Unrolling Animation Implementation Guide

A comprehensive guide for integrating the Three.js unrolling image effect with the V2 Interface React Flow canvas.

---

## Overview

The V2 Interface combines React Flow's canvas capabilities with a stunning Three.js WebGL "unrolling" effect. Images/cards appear rolled up like scrolls and dramatically unroll into view, creating an engaging visual experience.

### Goals

- **Dramatic Entrance** - Nodes/cards unroll into view when appearing on canvas
- **Configurable Angles** - Vertical (90°), horizontal (0°), or angled (17°) unroll directions
- **Smooth Animations** - GSAP-powered transitions with customizable easing
- **React Integration** - Clean hooks-based API for the Three.js effect

---

## Architecture

```
src/
├── app/
│   └── v2-interface/
│       └── page.tsx                 # Main page component
├── sections/
│   └── v2-interface/
│       ├── index.ts                 # Barrel exports
│       ├── view.tsx                 # Main view with React Flow + Three.js
│       ├── components/
│       │   ├── unrolling-canvas.tsx # Three.js canvas overlay
│       │   ├── unrolling-item.tsx   # Individual unrolling mesh
│       │   └── index.ts
│       ├── hooks/
│       │   ├── use-unrolling-scene.ts  # Three.js scene management
│       │   ├── use-unrolling-item.ts   # Individual item animation
│       │   └── index.ts
│       └── shaders/
│           ├── vertex.glsl          # Unrolling vertex shader
│           └── fragment.glsl        # Texture + shadow fragment shader
```

---

## Core Concepts

### 1. The Unrolling Effect

The effect works by:
1. Creating a high-subdivision plane geometry (80x80 segments)
2. Using a vertex shader to deform the plane into a "rolled" state
3. Animating a `progress` uniform from 0 (rolled) to 1 (flat)
4. The shader calculates roll position based on angle and progress

### 2. Key Uniforms

```typescript
uniforms: {
  time: { value: 0 },           // For potential time-based effects
  progress: { value: 0 },       // 0 = rolled, 1 = flat
  angle: { value: 0.3 },        // Unroll angle in radians
  texture1: { value: null },    // The image texture
  resolution: { value: vec4 },  // Width, height, aspect ratios
}
```

### 3. Animation Angles

| Angle | Radians | Description |
|-------|---------|-------------|
| Vertical | π/2 (1.57) | Unrolls top-to-bottom |
| Horizontal | 0 | Unrolls left-to-right |
| Angled | ~0.3 (17°) | Diagonal unroll (default) |

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install three @types/three gsap
```

### Step 2: Create Shader Files

#### Vertex Shader (`vertex.glsl`)

```glsl
uniform float time;
uniform float angle;
uniform float progress;
uniform vec4 resolution;
varying vec2 vUv;
varying float vFrontShadow;

uniform sampler2D texture1;
uniform vec2 pixels;

const float pi = 3.1415925;

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat4(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0
  );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

void main() {
  vUv = uv;
  float pi = 3.14159265359;
  float finalAngle = angle;
  vec3 newposition = position;
  
  float rad = 0.1;
  float rolls = 8.;
  
  // Rotate to unroll angle
  newposition = rotate(newposition - vec3(-.5,.5,0.), vec3(0.,0.,1.),-finalAngle) + vec3(-.5,.5,0.);

  float offs = (newposition.x + 0.5)/(sin(finalAngle) + cos(finalAngle));
  float tProgress = clamp((progress - offs*0.99)/0.01, 0., 1.);

  // Shadows
  vFrontShadow = clamp((progress - offs*0.95)/0.05, 0.7, 1.);

  // Roll calculation
  newposition.z = rad + rad*(1. - offs/2.)*sin(-offs*rolls*pi - 0.5*pi);
  newposition.x = -0.5 + rad*(1. - offs/2.)*cos(-offs*rolls*pi + 0.5*pi);
  
  // Rotate back
  newposition = rotate(newposition - vec3(-.5,.5,0.), vec3(0.,0.,1.), finalAngle) + vec3(-.5,.5,0.);
  
  // Unroll animation
  newposition = rotate(newposition - vec3(-.5,0.5,rad), vec3(sin(finalAngle),cos(finalAngle),0.), -pi*progress*rolls);
  newposition += vec3(
    -.5 + progress*cos(finalAngle)*(sin(finalAngle) + cos(finalAngle)), 
    0.5 - progress*sin(finalAngle)*(sin(finalAngle) + cos(finalAngle)),
    rad*(1.-progress/2.)
  );

  vec3 finalposition = mix(newposition, position, tProgress);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalposition, 1.0);
}
```

#### Fragment Shader (`fragment.glsl`)

```glsl
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;

varying vec2 vUv;
varying float vFrontShadow;

void main() {
  vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
  gl_FragColor = texture2D(texture1, newUV);
  gl_FragColor.rgb *= vFrontShadow;
  gl_FragColor.a = clamp(progress * 5., 0., 1.);
}
```

### Step 3: Create the Unrolling Scene Hook

```typescript
// src/sections/v2-interface/hooks/use-unrolling-scene.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

interface UnrollingSceneOptions {
  container: HTMLElement | null;
  cameraDistance?: number;
}

export function useUnrollingScene({ container, cameraDistance = 400 }: UnrollingSceneOptions) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const baseMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Initialize scene
  useEffect(() => {
    if (!container) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.sortObjects = false;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      300,
      1000
    );
    camera.position.set(0, 0, cameraDistance);
    camera.lookAt(0, 0, 0);

    // Create reusable geometry and material
    const geometry = new THREE.PlaneGeometry(1, 1, 80, 80);
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        angle: { value: 0.3 },
        texture1: { value: null },
        resolution: { value: new THREE.Vector4() },
      },
      transparent: true,
      vertexShader,
      fragmentShader,
    });

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    geometryRef.current = geometry;
    baseMaterialRef.current = material;

    // Handle resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.fov = 2 * Math.atan(width / camera.aspect / (2 * cameraDistance)) * (180 / Math.PI);
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [container, cameraDistance]);

  // Create mesh for an image
  const createMesh = useCallback((options: {
    image: HTMLImageElement;
    width: number;
    height: number;
    x: number;
    y: number;
  }) => {
    if (!geometryRef.current || !baseMaterialRef.current || !sceneRef.current) return null;

    const material = baseMaterialRef.current.clone();
    const texture = new THREE.Texture(options.image);
    texture.needsUpdate = true;

    const imageAspect = options.image.height / options.image.width;
    let a1, a2;
    if (options.height / options.width > imageAspect) {
      a1 = (options.width / options.height) * imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = options.height / options.width / imageAspect;
    }

    material.uniforms.resolution.value.set(options.width, options.height, a1, a2);
    material.uniforms.texture1.value = texture;

    const mesh = new THREE.Mesh(geometryRef.current, material);
    mesh.scale.set(options.width, options.height, options.width / 2);
    mesh.position.set(options.x, options.y, 0);

    sceneRef.current.add(mesh);
    return mesh;
  }, []);

  // Render the scene
  const render = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  return { scene: sceneRef, createMesh, render };
}
```

### Step 4: Create the Unrolling Canvas Component

```typescript
// src/sections/v2-interface/components/unrolling-canvas.tsx
'use client';

import { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import gsap from 'gsap';

import { useUnrollingScene } from '../hooks/use-unrolling-scene';

interface UnrollingCanvasProps {
  items?: Array<{
    id: string;
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  angle?: number; // 0 = horizontal, π/2 = vertical, 0.3 = angled
}

export function UnrollingCanvas({ items = [], angle = 0.3 }: UnrollingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { createMesh, render } = useUnrollingScene({ 
    container: containerRef.current 
  });

  useEffect(() => {
    items.forEach((item) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const mesh = createMesh({
          image: img,
          width: item.width,
          height: item.height,
          x: item.x,
          y: item.y,
        });

        if (mesh) {
          // Animate unroll
          gsap.to(mesh.material.uniforms.progress, {
            duration: 1.7,
            value: 1,
            ease: 'power2.out',
            onUpdate: render,
          });
        }
      };
      img.src = item.imageUrl;
    });
  }, [items, createMesh, render]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
```

---

## Usage in V2 Interface

```typescript
// src/app/v2-interface/page.tsx
'use client';

import Box from '@mui/material/Box';
import { ReactFlow, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { UnrollingCanvas } from 'src/sections/v2-interface/components';

export default function V2InterfacePage() {
  const unrollingItems = [
    {
      id: '1',
      imageUrl: '/assets/images/card1.jpg',
      x: 0,
      y: 0,
      width: 300,
      height: 200,
    },
  ];

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* React Flow Canvas */}
      <ReactFlow nodes={[]} edges={[]} panOnScroll zoomOnPinch>
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Three.js Unrolling Overlay */}
      <UnrollingCanvas items={unrollingItems} angle={0.3} />
    </Box>
  );
}
```

---

## Animation Triggers

### On Node Enter

```typescript
const triggerUnroll = (mesh: THREE.Mesh) => {
  gsap.to(mesh.material.uniforms.progress, {
    duration: 1.7,
    value: 1,
    ease: 'power2.out',
  });
};
```

### On Node Exit (Roll Back)

```typescript
const triggerRollBack = (mesh: THREE.Mesh) => {
  gsap.to(mesh.material.uniforms.progress, {
    duration: 1.7,
    value: 0,
    ease: 'power2.inOut',
  });
};
```

### Change Angle Dynamically

```typescript
const changeAngle = (newAngle: number) => {
  scene.children.forEach((mesh) => {
    if (mesh.material?.uniforms) {
      mesh.material.uniforms.angle.value = newAngle;
    }
  });
};
```

---

## Credits

- Original effect by [Yuriy Artyukh (Akella)](https://twitter.com/akella)
- [Codrops Article](https://tympanus.net/codrops/?p=46712)
- [Demo](https://tympanus.net/Development/UnrollingImages/)
- [GitHub](https://github.com/akella/UnrollingImages)

