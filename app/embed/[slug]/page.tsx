import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { autoDemos } from "@/components/autoplay/auto-demo-map"
import { AutoplayFrame } from "@/components/autoplay/autoplay-frame"
import { RelicMark } from "@/components/relic-logo"
import { categoryLabel, docs, getDoc } from "@/lib/docs"
import { siteConfig } from "@/lib/site"

/**
 * One component, alone and self-playing: for screen recordings, videos and
 * embedding a live demo elsewhere. Hidden from search engines.
 */

type Props = { params: Promise<{ slug: string }> }

// Unknown slugs are a 404: the page calls notFound().
export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.name }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = getDoc(slug)
  return {
    title: doc ? `${doc.title} (live)` : "Relic UI",
    robots: { index: false, follow: false },
  }
}

// The slug is read inside <Suspense> so navigation can start instantly.
// Every listed component is still prerendered, so visitors don't see the fallback.
export default function EmbedPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="min-h-svh bg-background" />}>
      <EmbedContent params={params} />
    </Suspense>
  )
}

async function EmbedContent({ params }: Props) {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) notFound()
  const Preview = autoDemos[doc.name] ?? doc.Demo
  const host = siteConfig.url.replace(/^https?:\/\//, "")

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_72%)] opacity-80"
      />
      <div className="relative flex w-full max-w-3xl justify-center">
        <AutoplayFrame>
          <Preview />
        </AutoplayFrame>
      </div>

      <div className="absolute inset-x-8 bottom-6 flex items-end justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border bg-muted/40">
            <RelicMark className="size-5" title="" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">{doc.title}</p>
            <p className="text-xs text-muted-foreground">Relic UI · {categoryLabel(doc.category)}</p>
          </div>
        </div>
        <p className="font-mono text-xs text-muted-foreground">{host}</p>
      </div>
    </main>
  )
}
