import type { Metadata, Viewport } from 'next';
import { Wix_Madefor_Text, Wix_Madefor_Display, Heebo } from 'next/font/google';
import './globals.css';

// Wix Madefor Text - Primary body font
const wixText = Wix_Madefor_Text({
  subsets: ['latin'],
  variable: '--font-wix-text',
  weight: ['400', '500', '600'],
  display: 'swap',
});

// Wix Madefor Display - Headers and display text
const wixDisplay = Wix_Madefor_Display({
  subsets: ['latin'],
  variable: '--font-wix-display',
  weight: ['600', '700', '800'],
  display: 'swap',
});

// Heebo - Hebrew fallback font
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Base44 עוזר קהילתי',
  description: 'שאל שאלות על Base44 וקבל תשובות מהקהילה',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Base44 Q&A',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FF6B35',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <head>
        {/* PWA & Mobile Optimizations */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Base44 Q&A" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* Prevent phone number detection */}
        <meta name="format-detection" content="telephone=no" />

        {/* MS Tile */}
        <meta name="msapplication-TileColor" content="#FF6B35" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`
          ${wixText.variable}
          ${wixDisplay.variable}
          ${heebo.variable}
          font-sans antialiased
          h-full
          overflow-hidden
        `}
      >
        {children}
      </body>
    </html>
  );
}
