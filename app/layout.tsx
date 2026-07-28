import './globals.css';
import type { Metadata } from 'next';
import { LanguageProvider } from '@/components/LanguageProvider';

export const metadata: Metadata = {
  title: {
    default: 'Nowhere Mark — Private Image Studio',
    template: '%s · Nowhere Mark',
  },
  description: 'Resize, crop, adjust, remove backgrounds and watermark images privately in your browser.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
