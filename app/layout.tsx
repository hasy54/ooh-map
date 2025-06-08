import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Search Outdoor Advertising & Billboards Across India",
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
  ],
  icons: {
    icon: "/favicon.ico", // Replace this with your actual favicon path
  },
  applicationName: "OOH Advertising India",
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
      </head>
      <body>{children}</body>
    </html>
  )
}


import './globals.css'