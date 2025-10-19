import { m } from 'framer-motion';
import { useInvertedBorderRadius } from './use-inverted-border-radius';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CardTitleProps {
  title: string;
  category: string;
  isSelected: boolean;
}

export function CardTitle({ title, category, isSelected }: CardTitleProps) {
  const inverted = useInvertedBorderRadius(20);

  return (
    <m.div
      style={{
        ...inverted,
        padding: isSelected ? '24px' : '16px',
        position: 'relative',
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: isSelected ? '0.75rem' : '0.65rem',
          }}
        >
          {category}
        </Typography>
        <Typography
          variant={isSelected ? 'h4' : 'h6'}
          sx={{
            fontWeight: 600,
            mt: 0.5,
          }}
        >
          {title}
        </Typography>
      </Box>
    </m.div>
  );
}

