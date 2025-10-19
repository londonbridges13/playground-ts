import { useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Avoid the stretch/squashing of border radius by inverting them
 * throughout the component's layout transition.
 * 
 * Adapted from NodeDetailView for modern Framer Motion API
 */
export function useInvertedBorderRadius(radius: number) {
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  
  // Create inverted scale values
  const invertedScaleX = useTransform(scaleX, (value) => 1 / value);
  const invertedScaleY = useTransform(scaleY, (value) => 1 / value);
  
  const borderRadius = useMotionValue(`${radius}px`);

  useEffect(() => {
    function updateRadius() {
      const latestX = invertedScaleX.get();
      const latestY = invertedScaleY.get();
      const xRadius = latestX * radius + 'px';
      const yRadius = latestY * radius + 'px';

      borderRadius.set(`${xRadius} ${yRadius}`);
    }

    const unsubScaleX = invertedScaleX.on('change', updateRadius);
    const unsubScaleY = invertedScaleY.on('change', updateRadius);

    return () => {
      unsubScaleX();
      unsubScaleY();
    };
  }, [radius, invertedScaleX, invertedScaleY, borderRadius]);

  return {
    scaleX,
    scaleY,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
  };
}

