import { m } from 'framer-motion';

interface CardContentProps {
  isSelected: boolean;
}

export function CardContent({ isSelected }: CardContentProps) {
  if (!isSelected) return null;

  return (
    <m.div
      className="content-container"
      style={{
        padding: '0 24px 24px',
        fontSize: '16px',
        lineHeight: '1.6',
        color: 'rgba(0, 0, 0, 0.7)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <p style={{ margin: '0 0 16px' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lobortis
        interdum porttitor. Nam lorem justo, aliquam id feugiat quis, malesuada sit
        amet massa.
      </p>
      <p style={{ margin: '0 0 16px' }}>
        Sed consectetur lorem quis odio laoreet, vel malesuada lacus finibus. Proin
        molestie, nisi id vehicula venenatis, ex ante viverra neque, a viverra lorem
        nulla ut orci.
      </p>
      <p style={{ margin: '0 0 16px' }}>
        Vestibulum vitae ipsum eget justo fringilla facilisis eget quis magna. Proin
        feugiat tellus et magna venenatis, id venenatis nunc dictum.
      </p>
      <p style={{ margin: '0 0 16px' }}>
        Nullam sed ex auctor, lobortis eros id, iaculis justo. Mauris porta ipsum vel
        nisl euismod, non consectetur eros varius.
      </p>
      <p style={{ margin: '0' }}>
        Curabitur consectetur, sapien a pulvinar consectetur, nisi nunc dignissim
        risus, at elementum magna urna sit amet tellus.
      </p>
    </m.div>
  );
}

