import { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence, useMotionValue } from 'framer-motion';
import type { Node } from '@xyflow/react';

import Box from '@mui/material/Box';

import { CardImage } from './appstore-card/card-image';
import { CardTitle } from './appstore-card/card-title';
import { CardContent } from './appstore-card/card-content';
import { useScrollConstraints } from './appstore-card/use-scroll-constraints';
import { useWheelScroll } from './appstore-card/use-wheel-scroll';
import { openSpring, closeSpring } from './appstore-card/animations';

// ----------------------------------------------------------------------

const dismissDistance = 150;

interface AppStoreCardDialogProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
}

export function AppStoreCardDialog({ open, node, onClose }: AppStoreCardDialogProps) {
  const y = useMotionValue(0);
  const zIndex = useMotionValue(open ? 2 : 0);

  const cardRef = useRef<HTMLDivElement>(null);
  const constraints = useScrollConstraints(cardRef, open);

  // Enable wheel scroll when dialog is open
  useWheelScroll(cardRef, y, constraints, open);

  // Lock body scroll when dialog is open
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

  // Handle swipe to dismiss
  const checkSwipeToDismiss = useCallback(() => {
    if (y.get() > dismissDistance) {
      onClose();
    }
  }, [y, onClose]);

  // Handle z-index updates
  const checkZIndex = useCallback(() => {
    if (open) {
      zIndex.set(2);
    } else {
      zIndex.set(0);
    }
  }, [open, zIndex]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!node) return null;

  const backgroundColor = node.data?.backgroundColor || '#814A0E';
  const category = node.data?.category || 'App';
  const title = node.data?.label || 'Untitled';
  const pointOfInterest = node.data?.pointOfInterest || 50;
  const imageUrl = node.data?.imageUrl;

  // Get the captured screen position
  const screenPosition = (node as any)._screenPosition;

  // Calculate initial position relative to viewport center
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;

  const initialX = screenPosition ? screenPosition.x + screenPosition.width / 2 - viewportCenterX : 0;
  const initialY = screenPosition ? screenPosition.y + screenPosition.height / 2 - viewportCenterY : 0;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Card Dialog */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <m.div
              ref={cardRef}
              layoutId={`appstore-card-${node.id}-${node.data?.layoutTimestamp}`}
              initial={screenPosition ? {
                x: initialX,
                y: initialY,
                width: screenPosition.width,
                height: screenPosition.height,
                scale: 1,
              } : {
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                x: 0,
                y: 0,
                width: '90%',
                height: 'auto',
                scale: 1,
                opacity: 1,
              }}
              exit={screenPosition ? {
                x: initialX,
                y: initialY,
                width: screenPosition.width,
                height: screenPosition.height,
                scale: 1,
              } : {
                scale: 0.8,
                opacity: 0,
              }}
              transition={open ? openSpring : closeSpring}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDrag={checkSwipeToDismiss}
              style={{
                y,
                zIndex,
                maxWidth: '600px',
                maxHeight: '85vh',
                backgroundColor: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0px 24px 64px rgba(0, 0, 0, 0.3)',
                pointerEvents: 'auto',
                position: 'relative',
              }}
            >
              {/* Scrollable Content */}
              <Box
                sx={{
                  width: '100%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {/* Card Image */}
                <Box sx={{ width: '100%', height: '300px' }}>
                  <CardImage
                    id={node.id}
                    isSelected={open}
                    pointOfInterest={pointOfInterest}
                    backgroundColor={backgroundColor}
                    imageUrl={imageUrl}
                  />
                </Box>

                {/* Card Title */}
                <CardTitle
                  title={title}
                  category={category}
                  isSelected={open}
                />

                {/* Card Content */}
                <CardContent isSelected={open} />
              </Box>
            </m.div>
          </Box>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

