import type { Metadata } from "next"
import Link from "next/link"
import { Accessibility, ArrowRight, ArrowUpRight, Palette, SlidersHorizontal } from "lucide-react"

import { CodeBlock } from "@/components/docs/code-block"
import { docs, docsByCategory } from "@/lib/docs"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Getting started",
  description: `Install ${siteConfig.name} components with the shadcn CLI in three steps.`,
}

const STEPS = [
  {
    title: "Set up shadcn/ui",
    body: "Relic UI components install with the shadcn CLI. Skip this if your project already uses shadcn/ui.",
    code: "npx shadcn@latest init",
  },
  {
    title: "Add a component",
    body: "Copy the command from any component's page. Install from the website or straight from GitHub.",
    code: `npx shadcn@latest add ${siteConfig.url}/r/stretch-switch.json\n# or\nnpx shadcn@latest add relicui/relic-ui/stretch-switch`,
  },
  {
    title: "Make it yours",
    body: "The source lands in components/ui. Import it, use it, and change anything you like.",
    code: `import { StretchSwitch } from "@/components/ui/stretch-switch"\n\n<StretchSwitch defaultChecked />`,
  },
]

const PROMISES = [
  { icon: Accessibility, title: "Accessible", body: "Keyboard support, screen reader labels and reduced motion, in every component." },
  { icon: Palette, title: "Themeable", body: "Built on shadcn/ui color tokens, so it follows your colors in light and dark mode." },
  { icon: SlidersHorizontal, title: "Customizable", body: "Sizes, variants and timings as props, with a live playground on every page." },
]

export default function GettingStarted() {
  return (
    <article className="max-w-3xl">
      {/* Header */}
      <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Documentation</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">Getting started</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        {siteConfig.name} is a collection of {docs.length} animated React components. You
        don&apos;t install a package: you add the components you need, and the code is yours.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {["React 19", "Tailwind CSS v4", "shadcn/ui", "Motion", "TypeScript"].map((tech) => (
          <span key={tech} className="rounded-full border bg-muted/40 px-2.5 py-1 font-mono text-muted-foreground">
            {tech}
          </span>
        ))}
      </div>

      {/* Steps: a vertical path, each step marked by a caret. */}
      <h2 className="mt-16 text-xl font-semibold tracking-tight">Installation</h2>
      <ol className="mt-6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="relative grid grid-cols-[2rem_1fr] gap-x-4 pb-10 last:pb-0">
            {i < STEPS.length - 1 && (
              <span aria-hidden className="absolute top-9 bottom-1 left-4 w-px -translate-x-1/2 bg-border" />
            )}
            <span className="relative flex size-8 items-center justify-center rounded-full border bg-background font-mono text-sm">
              {i + 1}
            </span>
            <div className="min-w-0 pt-1">
              <h3 className="font-medium">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              <CodeBlock className="mt-4" code={step.code} />
            </div>
          </li>
        ))}
      </ol>

      {/* Categories */}
      <div className="mt-20 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Browse by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {docsByCategory.length} categories, {docs.length} components.
          </p>
        </div>
        <Link href="/components" className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          See them live <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {docsByCategory.map((group) => (
          <Link
            key={group.id}
            href={`/docs/${group.items[0].name}`}
            className="group rounded-xl border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{group.label}</span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {group.items.length}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {group.items.map((item) => item.title).join(" · ")}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
              Open <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        ))}
      </div>

      {/* Promises */}
      <h2 className="mt-20 text-xl font-semibold tracking-tight">Every component is</h2>
      <div className="mt-6 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        {PROMISES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-background p-5">
            <Icon aria-hidden className="size-5" />
            <p className="mt-3 font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      {/* License callout */}
      <div className="mt-20 flex flex-col gap-4 rounded-xl border border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Open source under the MIT License</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Free for personal and commercial projects. A credit link is appreciated, never required.
          </p>
        </div>
        <Link
          href="/license"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted/60 sm:self-auto"
        >
          Read the license <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  )
}
