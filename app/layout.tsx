import type { Metadata } from 'next';
import Script from 'next/script';
import { Fraunces, Newsreader } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import AnalyticsInit from '@/components/AnalyticsInit';
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

const OG_BASE = 'https://cca.thevibe.works';

export const metadata: Metadata = {
  metadataBase: new URL(OG_BASE),
  title: {
    default: 'CCA Тренажер — підготовка до Claude Certified Architect Foundations',
    template: '%s | CCA Тренажер',
  },
  description: 'Україномовний симулятор екзамену Claude Certified Architect Foundations. 96 питань за 5 доменами, режими практики та екзамену, scaled score.',
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: 'CCA Тренажер',
    images: [{ url: `${OG_BASE}/api/og?title=CCA+%D0%A2%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${OG_BASE}/api/og?title=CCA+%D0%A2%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80`],
  },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'theVibe.works',
  url: 'https://thevibe.works',
  sameAs: ['https://thevibe.works'],
  description: 'AI-автоматизація бізнес-процесів для компаній',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${fraunces.variable} ${newsreader.variable}`}>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html:
          `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-K6LJ9CK5');`
        }} />
        {/* End Google Tag Manager */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K6LJ9CK5"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <JsonLd data={orgSchema} />
        <AnalyticsInit />
        <Header />
        <div className="wrap">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
