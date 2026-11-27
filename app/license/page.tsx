import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import { cacheLife } from "next/cache"
import { Check, Heart, Info } from "lucide-react"

import { CodeBlock } from "@/components/docs/code-block"
import { LicenseScroll } from "@/components/license-scroll"
import { RelicMark } from "@/components/relic-logo"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "License",
  description: `${siteConfig.name} is open source under the ${siteConfig.license}.`,
}

const CAN = [
  "Use the components in personal and commercial projects",
  "Change them however you like",
  "Ship them in closed-source and paid products",
  "Use them in client work and templates you sell",
]

const FAQ = [
  {
    q: "Do I have to credit Relic UI?",
    a: "No. A credit link is appreciated and helps the project grow, but it's never required.",
  },
  {
    q: "Can I use it at work, for clients?",
    a: "Yes. The MIT License allows commercial use with no fees and no extra permission.",
  },
  {
    q: "What does “keep the notice” mean?",
    a: "If you share the component source files themselves (for example in a public repo), keep the copyright and license text with them. Using the components inside your app needs nothing extra.",
  },
  {
    q: "Is the Relic UI name or logo covered too?",
    a: "No. The license covers the code only. Please don't use the name or logo for your own project.",
  },
]

const creditSnippet = `<a href="${siteConfig.url}">UI components by ${siteConfig.name}</a>`

// Read the real LICENSE file so this page can never disagree with it.
// It only changes on deploy, so the read is cached for good.
async function readLicense() {
  "use cache"
  cacheLife("max")
  return readFile(path.join(process.cwd(), "LICENSE"), "utf8")
}

export default async function LicensePage() {
  const license = await readLicense()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-16 pb-24 md:pt-24">
        {/* Header: the license as a sealed certificate. */}
        <div className="flex flex-col items-center text-center">
          <span className="relative flex size-20 items-center justify-center rounded-full border-2 border-dashed border-border">
            <span className="flex size-16 items-center justify-center rounded-full bg-foreground text-background shadow-lg">
              <RelicMark className="size-8" title="" />
            </span>
          </span>
          <p className="mt-6 font-mono text-xs tracking-wide text-muted-foreground uppercase">License</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tighter md:text-5xl">MIT License</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            {siteConfig.name} is free and open source. Use it in anything you build, personal or
            commercial.
          </p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            © 2026 {siteConfig.operator} · Last updated {siteConfig.legalUpdated}
          </p>
        </div>

        {/* At a glance */}
        <div className="mt-14 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border p-6">
            <h2 className="flex items-center gap-2 font-medium">
              <Check className="size-4 text-primary" aria-hidden /> You can
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {CAN.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <div className="grid gap-4">
            <section className="rounded-2xl border p-6">
              <h2 className="flex items-center gap-2 font-medium">
                <Info className="size-4" aria-hidden /> You must
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Keep the copyright and license notice if you share the source code itself.
              </p>
            </section>
            <section className="rounded-2xl border border-dashed p-6">
              <h2 className="flex items-center gap-2 font-medium">
                <Heart className="size-4" aria-hidden /> Appreciated
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">A credit link, if you&apos;d like:</p>
            </section>
          </div>
        </div>
        <CodeBlock className="mt-4" code={creditSnippet} />

        {/* FAQ */}
        <h2 className="mt-16 text-xl font-semibold tracking-tight">Common questions</h2>
        <dl className="mt-6 divide-y rounded-2xl border">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="p-5">
              <dt className="font-medium">{q}</dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>

        {/* Full text, on a scroll you unroll. */}
        <h2 className="mt-16 text-xl font-semibold tracking-tight">The full text</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is what legally applies. Unroll the scroll to read it.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <LicenseScroll text={license} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
