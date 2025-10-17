import { PathInterfaceLayout } from 'src/layouts/path-interface';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

/**
 * Custom layout for path interface
 * Uses PathInterfaceLayout for full-screen, immersive experience
 * No dashboard chrome (header/sidebar) to maximize canvas space
 */
export default function Layout({ children }: Props) {
  return (
    <PathInterfaceLayout
      slotProps={{
        main: {
          sx: {
            // Additional customization if needed
            bgcolor: 'background.default',
          },
        },
      }}
    >
      {children}
    </PathInterfaceLayout>
  );
}

