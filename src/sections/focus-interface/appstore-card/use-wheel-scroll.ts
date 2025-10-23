import { useMotionValue, useSpring } from 'framer-motion';
import { useEffect, RefObject } from 'react';

/**
 * Custom wheel scroll with elastic/rubber-banding behavior
 * Provides Apple Watch crown-style scrolling
 */
export function useWheelScroll(
  ref: RefObject<HTMLElement>,
  y: any,
  constraints: { top: number; bottom: number } | null,
  isActive: boolean
) {
  const momentumY = useMotionValue(0);
  const springY = useSpring(momentumY, { stiffness: 400, damping: 40 });

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      
      const currentY = y.get();
      let newY = currentY - event.deltaY;

      // Apply elastic resistance at boundaries
      if (constraints) {
        if (newY > constraints.top) {
          const overflow = newY - constraints.top;
          newY = constraints.top + overflow * 0.5;
        } else if (newY < constraints.bottom) {
          const overflow = constraints.bottom - newY;
          newY = constraints.bottom - overflow * 0.5;
        }
      }

      momentumY.set(newY);
    }

    element.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', onWheel);
    };
  }, [isActive, ref, y, constraints, momentumY]);

  useEffect(() => {
    const unsubscribe = springY.on('change', (latest) => {
      y.set(latest);
    });

    return unsubscribe;
  }, [springY, y]);

  return momentumY;
}

