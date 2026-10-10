import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Locos por los Dardos • Argentina & Darderos Mar del Plata',
  description: 'Plataforma oficial de la comunidad de dardos en Argentina: Anotador en vivo táctil (My Dart Training), Torneos Nakka n01, Ranking nacional y Tienda con Mercado Pago.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logos/logo-mdq.png',
    apple: '/logos/logo-mdq.png',
  },
  keywords: ['dardos argentina', 'darderos mar del plata', 'anotador de dardos', 'nakka n01 torneos', 'my dart training', '501 doble out', 'cricket dardos'],
  authors: [{ name: 'Locos por los Dardos & Darderos MDQ' }],
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/logos/logo-mdq.png" />
      </head>
      <body className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
