import React from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import Header from './components/Header'
import Footer from './components/Footer'
import './styles.css'

export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' as any, depth: 1 })

  const favicon =
    siteSettings?.favicon && typeof siteSettings.favicon === 'object' && siteSettings.favicon.url
      ? siteSettings.favicon.url
      : undefined
 
  return {
    description: 'SamarthX — National School Platform',
    title: 'SamarthX',
    icons: favicon
      ? {
          icon: [{ url: favicon }],
          shortcut: [{ url: favicon }],
          apple: [{ url: favicon }],
        }
      : undefined,
  }
} 

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config })

  const headerData = await payload.findGlobal({ slug: 'header' as any, depth: 2 })
  const footerData = await payload.findGlobal({ slug: 'footer' as any })
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' as any })

  const primaryColor = siteSettings?.themeColors?.primaryColor || '#1E40AF'
  const secondaryColor = siteSettings?.themeColors?.secondaryColor || '#9333EA'
  const accentColor = siteSettings?.themeColors?.accentColor || '#F59E0B'
  const backgroundColor = siteSettings?.themeColors?.backgroundColor || '#FFFFFF'
  const surfaceColor = siteSettings?.themeColors?.surfaceColor || '#FFFFFF'
  const mutedBackgroundColor = siteSettings?.themeColors?.mutedBackgroundColor || '#F1F5F9'
  const textColor = siteSettings?.themeColors?.textColor || '#111827'

  const themeStyle = {
    '--cms-primary': primaryColor,
    '--cms-secondary': secondaryColor,
    '--cms-accent': accentColor,
    '--cms-bg': backgroundColor,
    '--cms-surface': surfaceColor,
    '--cms-muted-bg': mutedBackgroundColor,
    '--cms-text': textColor,
  } as React.CSSProperties

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex flex-col min-h-screen" style={themeStyle}>
        <Header data={headerData} />
        <main className="site-main flex-1">{children}</main>
        <Footer data={footerData} siteSettings={siteSettings} />
      </body>
    </html>
  )
}
