import { useEffect, useState, RefObject } from 'react';

/**
 * Calculate scroll constraints for the card content
 * Returns the maximum scroll distance based on content height
 */
export function useScrollConstraints(ref: RefObject<HTMLElement>, measureConstraints: boolean) {
  const [constraints, setConstraints] = useState({
    top: 0,
    bottom: 0,
  });

  useEffect(() => {
    if (!measureConstraints || !ref.current) return;

    const element = ref.current;
    const viewportHeight = element.offsetHeight;
    const contentHeight = element.scrollHeight;
    
    setConstraints({
      top: 0,
      bottom: -(contentHeight - viewportHeight),
    });
  }, [measureConstraints, ref]);

  return constraints;
}

