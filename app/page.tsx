import Link from "next/link"
import {
  Accessibility,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code,
  Keyboard,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"

import { BrowseButton } from "@/components/browse-button"
import { CodeBlock } from "@/components/docs/code-block"
import { CaretField } from "@/components/landing/caret-field"
import { TypedWord } from "@/components/landing/typed-word"
import { RelicMark } from "@/components/relic-logo"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { docs } from "@/lib/docs"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"
import { ElasticDivider } from "@/registry/relic/ui/elastic-divider"
import { FoldAccordion } from "@/registry/relic/ui/fold-accordion"
import { HoldToConfirmButton } from "@/registry/relic/ui/hold-to-confirm-button"
import { PerforatedCard } from "@/registry/relic/ui/perforated-card"
import { ShimmerButton } from "@/registry/relic/ui/shimmer-button"
import { SmoothCaretInput } from "@/registry/relic/ui/smooth-caret-input"
import { StretchTabs } from "@/registry/relic/ui/stretch-tabs"

const HERO_WORDS = ["alive", "tactile", "crafted", "human", "yours"]

/* -------------------------------------------------------------------------- */
/*                                Small pieces                                */
/* -------------------------------------------------------------------------- */

function Eyebrow({ index, children }: { index: string; children: string }) {
  return (
    <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
      <span className="text-foreground">{index}</span> — {children}
    </p>
  )
}

function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <ElasticDivider className="h-16" bend={28} />
    </div>
  )
}

function Tile({
  name,
  title,
  description,
  className,
  children,
}: {
  name: string
  title: string
  description: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card",
        className
      )}
    >
      <div className="relative flex min-h-60 flex-1 items-center justify-center p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] opacity-70"
        />
        <div className="relative flex w-full justify-center">{children}</div>
      </div>
      <div className="flex items-end justify-between gap-4 border-t px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Link
          href={`/docs/${name}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Docs <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Data                                    */
/* -------------------------------------------------------------------------- */

const details = [
  {
    icon: Keyboard,
    title: "Keyboard first",
    body: "Every interaction works without a mouse: hold Space to confirm, arrow through tabs, Enter to tear.",
  },
  {
    icon: Accessibility,
    title: "Respects reduced motion",
    body: "If someone asks their device for less motion, every component calms down automatically.",
  },
  {
    icon: Palette,
    title: "Fits your theme",
    body: "Built on shadcn/ui color tokens, so components follow your brand in light and dark mode.",
  },
  {
    icon: SlidersHorizontal,
    title: "Tuned by hand",
    body: "Springs, timings and easing are tuned for how they feel, not just how they look in a GIF.",
  },
  {
    icon: Code,
    title: "Yours to own",
    body: "Components install as source code in your project. Read it, change it, make it yours.",
  },
  {
    icon: ShieldCheck,
    title: "No tracking",
    body: "No accounts, ads, analytics or cookies on this site. The registry is just static files.",
  },
]

const faq = [
  {
    value: "what",
    title: "What is Relic UI?",
    content: "Animated React components you install with the shadcn CLI.",
  },
  {
    value: "free",
    title: "Is it free?",
    content: "Yes, for personal and commercial projects, with a credit link.",
  },
]

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const installUrl = `${siteConfig.url}/r/hold-to-confirm-button.json`

  return (
    <>
      <SiteHeader />

      <main>
        {/* ------------------------------ Hero ------------------------------ */}
        <section className="relative overflow-hidden">
          <CaretField className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black_30%,transparent)]" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-24 pb-16 text-center md:pt-36 md:pb-24">
            <Link
              href="/docs/smooth-caret-input"
              className="group inline-flex items-center gap-2 rounded-full border bg-background/80 py-1 pr-3 pl-1 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
            >
              <span className="rounded-full bg-foreground px-2 py-0.5 font-medium text-background">
                New
              </span>
              Smooth Caret Input
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="mt-8 text-5xl font-semibold tracking-tighter md:text-7xl">
              <span className="sr-only">Interfaces that feel alive.</span>
              <span aria-hidden className="block">
                Interfaces that feel
              </span>
              <span aria-hidden className="mt-1 block">
                <TypedWord
                  words={HERO_WORDS}
                  className="font-serif font-normal tracking-normal italic"
                />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-balance text-muted-foreground md:text-lg">
              Original, animated React components with physics you can feel.
              Built on shadcn/ui, tuned by hand, installed with one command.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <BrowseButton />
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted/60"
              >
                GitHub <ArrowUpRight className="size-4" />
              </a>
            </div>

            <p className="mt-8 font-mono text-xs text-muted-foreground">
              {docs.length} components · free to use · keyboard &amp;
              reduced-motion ready
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* ---------------------------- Showcase ---------------------------- */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Eyebrow index="01">Components</Eyebrow>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-lg text-3xl font-semibold tracking-tight md:text-4xl">
              Don&apos;t take our word for it. Touch them.
            </h2>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              All components <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Tile
              name="smooth-caret-input"
              title="Smooth Caret Input"
              description="The caret glides. Letters ease in and out."
              className="lg:col-span-2"
            >
              <div className="w-full max-w-md">
                <SmoothCaretInput
                  size="lg"
                  aria-label="Try the smooth caret input"
                  placeholder="Type, delete, paste — feel the caret"
                  autoComplete="off"
                />
              </div>
            </Tile>

            <Tile
              name="perforated-card"
              title="Perforated Card"
              description="Pull the stub down to tear it off."
              className="lg:row-span-2"
            >
              <div className="w-full max-w-60">
                <PerforatedCard
                  stub={
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Pull to tear</span>
                      <span aria-hidden>↓</span>
                    </div>
                  }
                  reveal={
                    <p className="font-mono text-base font-semibold tracking-widest">
                      RELIC-2026
                    </p>
                  }
                >
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    Gift card
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    20% off
                  </p>
                </PerforatedCard>
              </div>
            </Tile>

            <Tile
              name="hold-to-confirm-button"
              title="Hold to Confirm"
              description="No more accidental deletes."
            >
              <HoldToConfirmButton
                variant="destructive"
                confirmedChildren={
                  <>
                    <Check /> Deleted
                  </>
                }
              >
                <Trash2 /> Hold to delete
              </HoldToConfirmButton>
            </Tile>

            <Tile
              name="stretch-tabs"
              title="Stretch Tabs"
              description="The indicator stretches as it travels."
            >
              <StretchTabs
                aria-label="Example tabs"
                items={[
                  { value: "design", label: "Design" },
                  { value: "code", label: "Code" },
                  { value: "ship", label: "Ship" },
                ]}
              />
            </Tile>

            <Tile
              name="fold-accordion"
              title="Fold Accordion"
              description="Panels unfold like paper."
              className="lg:col-span-2"
            >
              <div className="w-full max-w-md">
                <FoldAccordion items={faq} defaultValue={["what"]} />
              </div>
            </Tile>

            <Tile
              name="elastic-divider"
              title="Elastic Divider"
              description="Pluck the line with your cursor."
            >
              <div className="w-full">
                <p className="text-center text-sm text-muted-foreground">
                  above
                </p>
                <ElasticDivider bend={30} damping={6} />
                <p className="text-center text-sm text-muted-foreground">
                  below
                </p>
              </div>
            </Tile>

            <Tile
              name="shimmer-button"
              title="Shimmer Button"
              description="A quiet sweep of light."
            >
              <ShimmerButton>
                Get started <ArrowRight />
              </ShimmerButton>
            </Tile>

            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-dashed p-8 lg:col-span-2">
              <div>
                <p className="text-lg font-medium">More relics on the way.</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  New components ship regularly, each one original and tuned
                  to the same standard. Have an idea for one?
                </p>
              </div>
              <a
                href={`${siteConfig.github}/issues`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 self-start text-sm font-medium hover:underline"
              >
                Suggest a component <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ------------------------------ Craft ----------------------------- */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Eyebrow index="02">Craft</Eyebrow>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
            Crafted down to the last detail.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The animation is the part you see. The rest is what makes it safe
            to ship.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {details.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-background p-6">
                <Icon className="size-5" aria-hidden />
                <h3 className="mt-4 font-medium">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* ----------------------------- Install ---------------------------- */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Eyebrow index="03">Install</Eyebrow>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
            From zero to alive in three steps.
          </h2>

          <ol className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Set up shadcn/ui",
                body: "Skip this if your project already uses it.",
                code: "npx shadcn@latest init",
              },
              {
                title: "Add a component",
                body: "The source lands in components/ui.",
                code: `npx shadcn@latest add ${installUrl}`,
              },
              {
                title: "Make it yours",
                body: "Use it, then change anything you like.",
                code: `<HoldToConfirmButton onConfirm={deleteProject}>\n  Hold to delete\n</HoldToConfirmButton>`,
              },
            ].map((step, i) => (
              <li key={step.title} className="flex min-w-0 flex-col gap-3">
                <span className="flex size-8 items-center justify-center rounded-full border font-mono text-sm">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
                <CodeBlock code={step.code} />
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------ Ticket ---------------------------- */}
        <section className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Your ticket is ready.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tear it off to get started.
            </p>

            <div className="mt-10 w-full max-w-sm text-left">
              <PerforatedCard
                exitEffect="fly"
                stub={
                  <div className="flex items-center justify-between font-mono text-xs tracking-wide text-muted-foreground uppercase">
                    <span>Pull down to tear</span>
                    <span aria-hidden>↓</span>
                  </div>
                }
                reveal={
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                      Start with any component:
                    </p>
                    <CodeBlock code={`npx shadcn@latest add ${installUrl}`} />
                    <Link
                      href="/docs"
                      className="inline-flex items-center gap-1 self-start text-sm font-medium hover:underline"
                    >
                      Browse all components <ArrowRight className="size-4" />
                    </Link>
                  </div>
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                      Admit one · No. {String(docs.length).padStart(3, "0")}
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight">
                      {siteConfig.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Interfaces that feel{" "}
                      <span className="font-serif text-base italic">
                        alive
                      </span>
                      .
                    </p>
                  </div>
                  <RelicMark blink className="size-10" title="" />
                </div>
              </PerforatedCard>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
