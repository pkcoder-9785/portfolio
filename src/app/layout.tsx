import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Your Name — Creative Developer',
  description: 'Portfolio preview for a full-stack web developer, 3D website developer, AI agent developer, and creative technologist.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
