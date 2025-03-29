import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import Script from 'next/script'
require('dotenv').config()

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Travomad | Ultimate Guide to Travel Tips & Exclusive Deals',
  description: 'Discover breathtaking destinations and expert travel tips with our ultimate guide. Let us assist you in planning your dream vacation with exclusive deals from top travel agencies to ensure you get the best offers available.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-VV2RLH8MSE`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VV2RLH8MSE', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navigation />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
