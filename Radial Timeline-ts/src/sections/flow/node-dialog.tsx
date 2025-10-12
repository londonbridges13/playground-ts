import { useEffect, useState } from 'react';
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
  const [isClosing, setIsClosing] = useState(false);
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for radial timeline fadeOut to complete
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Radial timeline fadeOut duration
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.5,
            exit: {
              duration: 0.3,
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg, #fff)',
          }}
        >
          <RadialTimeline
            onClose={handleClose}
            isClosing={isClosing}
            nodeLabel={(node?.data?.label as string) || 'Timeline'}
          />
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
