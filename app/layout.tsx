import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

import "./globals.css"
import { CopyToast } from "@/components/copy-toast"
import { SmoothScroll } from "@/components/smooth-scroll"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  // Makes generated image URLs (link previews) absolute.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s – ${siteConfig.name}`,
  },
  description: siteConfig.description,
}

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Editorial accent, used sparingly (the animated word in the hero).
const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        fontSerif.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>
          {children}
          <CopyToast />
          <SmoothScroll />
        </ThemeProvider>
      </body>
    </html>
  )
}
