import { useEffect } from 'react';
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
};

export function NodeDialog({ node, open, onClose }: NodeDialogProps) {
  // Reset scroll position and manage body overflow when dialog opens
  useEffect(() => {
    if (open) {
      // Reset scroll to top when opening
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;

      // Allow body to scroll for the radial timeline
      document.body.style.overflow = 'auto';
      document.body.style.overflowX = 'hidden';
    } else {
      // Restore body overflow when closing
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
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
            minHeight: '100vh',
            zIndex: 9999,
            margin: 0,
            padding: 0,
            backgroundColor: 'var(--color-bg, #fff)',
          }}
        >
          <RadialTimeline
            onClose={onClose}
            nodeLabel={(node?.data?.label as string) || 'Timeline'}
          />
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
