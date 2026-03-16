import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Manager',
  description: 'Manage events with filtering, sorting, and validation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
