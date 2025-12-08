'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

// ----------------------------------------------------------------------

interface UnrollingSceneOptions {
  container: HTMLElement | null;
  cameraDistance?: number;
  backgroundColor?: string;
}

interface CreateMeshOptions {
  image: HTMLImageElement;
  width: number;
  height: number;
  x: number;
  y: number;
  angle?: number;
  mode?: number; // 0 = single direction, 1 = center-out
}

export interface UnrollingMesh extends THREE.Mesh {
  material: THREE.ShaderMaterial;
}

// ----------------------------------------------------------------------

export function useUnrollingScene({
  container,
  cameraDistance = 400,
  backgroundColor = '#FFFFFF',
}: UnrollingSceneOptions) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const baseMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize scene
  useEffect(() => {
    if (!container) return;
    containerRef.current = container;

    const scene = new THREE.Scene();
    // Set scene background to match the theme
    scene.background = new THREE.Color(backgroundColor);

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

    // Create reusable geometry (high subdivision for smooth rolling)
    const geometry = new THREE.PlaneGeometry(1, 1, 80, 80);

    // Create base shader material
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        angle: { value: 0.3 },
        mode: { value: 0 }, // 0 = single direction, 1 = center-out
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
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.fov =
        2 * Math.atan(width / cameraRef.current.aspect / (2 * cameraDistance)) * (180 / Math.PI);
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Initial render
    renderer.render(scene, camera);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [container, cameraDistance, backgroundColor]);

  // Create mesh for an image
  const createMesh = useCallback(
    (options: CreateMeshOptions): UnrollingMesh | null => {
      if (!geometryRef.current || !baseMaterialRef.current || !sceneRef.current) return null;

      const material = baseMaterialRef.current.clone();
      const texture = new THREE.Texture(options.image);
      texture.needsUpdate = true;

      // Calculate aspect ratio for proper image cover
      const imageAspect = options.image.height / options.image.width;
      let a1: number;
      let a2: number;
      if (options.height / options.width > imageAspect) {
        a1 = (options.width / options.height) * imageAspect;
        a2 = 1;
      } else {
        a1 = 1;
        a2 = options.height / options.width / imageAspect;
      }

      texture.minFilter = THREE.LinearFilter;
      material.uniforms.resolution.value.set(options.width, options.height, a1, a2);
      material.uniforms.texture1.value = texture;
      material.uniforms.progress.value = 0;
      material.uniforms.angle.value = options.angle ?? 0.3;
      material.uniforms.mode.value = options.mode ?? 0;

      const mesh = new THREE.Mesh(geometryRef.current, material) as UnrollingMesh;
      mesh.scale.set(options.width, options.height, options.width / 2);
      mesh.position.set(options.x, options.y, 0);

      sceneRef.current.add(mesh);
      return mesh;
    },
    []
  );

  // Remove a mesh from the scene
  const removeMesh = useCallback((mesh: UnrollingMesh) => {
    if (!sceneRef.current) return;
    sceneRef.current.remove(mesh);
    mesh.geometry.dispose();
    if (mesh.material.uniforms.texture1.value) {
      mesh.material.uniforms.texture1.value.dispose();
    }
    mesh.material.dispose();
  }, []);

  // Render the scene
  const render = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  // Get viewport dimensions for positioning
  const getViewportDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 0, height: 0 };
    return {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    };
  }, []);

  // Convert screen coordinates to Three.js world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const { width, height } = getViewportDimensions();
      // Three.js uses center as origin, so we need to offset
      const worldX = screenX - width / 2;
      const worldY = height / 2 - screenY; // Y is inverted
      return { x: worldX, y: worldY };
    },
    [getViewportDimensions]
  );

  return {
    scene: sceneRef,
    renderer: rendererRef,
    camera: cameraRef,
    createMesh,
    removeMesh,
    render,
    getViewportDimensions,
    screenToWorld,
  };
}

