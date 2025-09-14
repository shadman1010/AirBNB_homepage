import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Airbnb Clone',
  description: 'Homepage clone built with Next.js + TS'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
