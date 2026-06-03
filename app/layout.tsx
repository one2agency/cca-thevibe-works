import type { Metadata } from 'next';
import { Fraunces, Newsreader } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cca.thevibe.works'),
  title: {
    default: 'CCA Тренажер — підготовка до Claude Certified Architect Foundations',
    template: '%s | CCA Тренажер',
  },
  description: 'Україномовний симулятор екзамену Claude Certified Architect Foundations. 96 питань за 5 доменами, режими практики та екзамену, scaled score.',
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: 'CCA Тренажер',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${fraunces.variable} ${newsreader.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <div className="wrap">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
