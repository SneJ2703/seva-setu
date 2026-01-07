import '../../styles/globals.css';
import '../../styles/theme.css';
import Navbar from '@/components/Navbar';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  display: 'swap',
});

export const metadata = {
  title: 'Seva-Setu - Admin Dashboard',
  description: 'Administrative dashboard for municipal issue management',
  manifest: '/manifest.json',
};

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=5';

export default function DashboardLayout({ children }) {
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
      <body className="bg-neutral-100">
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
