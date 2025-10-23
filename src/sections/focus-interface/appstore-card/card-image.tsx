import { m, useMotionValue } from 'framer-motion';
import { useInvertedBorderRadius } from './use-inverted-border-radius';

interface CardImageProps {
  id: string;
  isSelected: boolean;
  pointOfInterest?: number;
  backgroundColor?: string;
  imageUrl?: string;
}

export function CardImage({ 
  id, 
  isSelected, 
  pointOfInterest = 50, 
  backgroundColor = '#814A0E',
  imageUrl 
}: CardImageProps) {
  const inverted = useInvertedBorderRadius(20);

  const cardImageMotionValue = useMotionValue(pointOfInterest);

  return (
    <m.div
      className={`card-image-container ${id}`}
      style={{
        ...inverted,
        backgroundColor,
        originX: 0,
        originY: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {imageUrl ? (
        <m.img
          src={imageUrl}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            x: isSelected ? '0%' : cardImageMotionValue,
          }}
        />
      ) : (
        <m.div
          style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${backgroundColor} 0%, ${adjustBrightness(backgroundColor, -20)} 100%)`,
          }}
        />
      )}
    </m.div>
  );
}

// Helper to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

