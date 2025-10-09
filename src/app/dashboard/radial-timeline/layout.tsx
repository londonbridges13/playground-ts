// Override the dashboard layout for the radial timeline page
// This allows the timeline to be full-screen without dashboard chrome

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <>{children}</>;
}

