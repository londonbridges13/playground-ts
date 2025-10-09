import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Node } from '@xyflow/react';
import { m, AnimatePresence } from 'motion/react';

import RadialTimeline from './radial-timeline/radial-timeline';
import './radial-timeline/system.css';

// ----------------------------------------------------------------------

type NodeDialogProps = {
  node: Node | null;
  open: boolean;
  onClose: () => void;
  disableScrollLock?: boolean;
};

export function NodeDialog({ node, open, onClose, disableScrollLock = true }: NodeDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position and manage body overflow when dialog opens
  useEffect(() => {
    if (open) {
      // Reset container scroll to top when opening
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      // Lock body scroll when dialog is open (container will handle scroll)
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body overflow when closing
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            overflow: 'auto',
            overflowX: 'hidden',
            zIndex: 9999,
            margin: 0,
            padding: 0,
            backgroundColor: 'var(--color-bg, #fff)',
          }}
        >
          <RadialTimeline
            onClose={onClose}
            scrollTargetRef={containerRef}
            nodeLabel={(node?.data?.label as string) || 'Timeline'}
          />
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
