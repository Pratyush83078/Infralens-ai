import './globals.css';
import Navbar from '@/components/Navbar';
import ThemeController from '@/components/ThemeController';

export const metadata = {
  title: 'PAIMANA AI — Infrastructure Risk Intelligence',
  description: 'MoSPI Central Sector Infrastructure Risk Radar & Early Warning Intelligence System. SIH 26103.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <ThemeController />
      </body>
    </html>
  );
}
