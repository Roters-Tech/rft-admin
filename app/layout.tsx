import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { DevPanel } from '@/components/DevPanel';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'RFT Admin Portal',
  description: 'RFT — Learn. Grow. Succeed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${dmSans.variable} font-body antialiased`}>
        <ToastProvider>
          {children}
          <DevPanel />
        </ToastProvider>
      </body>
    </html>
  );
}
