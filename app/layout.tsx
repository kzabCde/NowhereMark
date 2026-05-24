import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nowhere Mark',
  description: 'Add your mark. Protect your image.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
