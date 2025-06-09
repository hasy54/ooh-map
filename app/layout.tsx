import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"

export const metadata: Metadata = {
  title: {
    default: "Search Outdoor Advertising & Billboards Across India | OOH Advertising India",
    template: "%s | OOH Advertising India",
  },
  description:
    "Discover top hoardings, bus stop ads, and digital billboards across major Indian cities. Plan, view locations, and book outdoor ads online. India's easiest way to explore OOH advertising.",
  keywords: [
    "OOH Advertising India",
    "Hoarding in Mumbai",
    "Billboards in Delhi",
    "Outdoor ads in India",
    "Book hoardings online",
    "Bus stop ads",
    "Advertising in Bangalore",
    "OOH media booking",
    "Hoardings near me",
    "Out-of-home marketing India",
    "Digital billboards India",
    "Transit advertising",
    "Street furniture advertising",
    "Mall advertising India",
  ],
  authors: [{ name: "OOH Advertising India" }],
  creator: "OOH Advertising India",
  publisher: "OOH Advertising India",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ooh-advertising-india.vercel.app",
    siteName: "OOH Advertising India",
    title: "Search Outdoor Advertising & Billboards Across India",
    description:
      "Discover top hoardings, bus stop ads, and digital billboards across major Indian cities. Plan, view locations, and book outdoor ads online.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OOH Advertising India - Find & Book Billboards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Outdoor Advertising & Billboards Across India",
    description: "Discover top hoardings, bus stop ads, and digital billboards across major Indian cities.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  applicationName: "OOH Advertising India",
  category: "business",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics Script */}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-6J95NBZ43V" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6J95NBZ43V');
            `,
          }}
        />

        {/* Additional SEO Meta Tags */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://ooh-advertising-india.vercel.app" />
      </head>
      <body>{children}</body>
    </html>
  )
}


import './globals.css'