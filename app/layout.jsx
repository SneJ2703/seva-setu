import '../styles/globals.css';
import '../styles/theme.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Seva-Setu: Your Ward, Your Voice. Fixed by AI.',
  description: 'Municipal issue management platform',
  manifest: '/manifest.json',
};

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=5';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta charSet="utf-8" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Seva-Setu" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
