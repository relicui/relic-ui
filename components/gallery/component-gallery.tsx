"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { ScrollRail } from "@/components/gallery/scroll-rail"
import { cn } from "@/lib/utils"
import { SmoothCaretInput } from "@/registry/relic/ui/smooth-caret-input"
import { StretchTabs } from "@/registry/relic/ui/stretch-tabs"

export type GalleryItem = {
  name: string
  title: string
  description: string
  category: string
  categoryLabel: string
  isNew: boolean
  wide: boolean
  /** The live demo, rendered on the server and passed in. */
  preview: React.ReactNode
}

export type GalleryCategory = { id: string; label: string; count: number }

const SEARCH_ID = "gallery-search"

export function ComponentGallery({
  items,
  categories,
}: {
  items: GalleryItem[]
  categories: GalleryCategory[]
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false
      if (!q) return true
      return [item.title, item.description, item.categoryLabel]
        .join(" ")
        .toLowerCase()
        .includes(q)
    })
  }, [items, query, category])

  // Arriving from the header's search button (/components#search) focuses the box.
  useEffect(() => {
    if (window.location.hash === "#search") {
      document.getElementById(SEARCH_ID)?.focus()
    }
  }, [])

  // "/" jumps into the search from anywhere on the page.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        document.getElementById(SEARCH_ID)?.focus()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  const tabs = [
    { value: "all", label: <TabLabel text="All" count={items.length} /> },
    ...categories.map((c) => ({
      value: c.id,
      label: <TabLabel text={c.label} count={c.count} />,
    })),
  ]

  function reset() {
    setQuery("")
    setCategory("all")
  }

  return (
    <MotionConfig reducedMotion="user">
      {/* Controls */}
      <div className="sticky top-[76px] z-30 -mx-4 border-b bg-background/85 px-4 py-4 backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="relative max-w-xl">
            <SmoothCaretInput
              id={SEARCH_ID}
              size="lg"
              aria-label="Search components"
              placeholder={`Search ${items.length} components…`}
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("")
              }}
              className="pr-10"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border bg-muted px-1.5 font-mono text-[11px] text-muted-foreground">
              /
            </kbd>
          </div>
          <ScrollRail className="-mx-4 pb-1" watch={category}>
            <StretchTabs
              aria-label="Filter by category"
              variant="underline"
              items={tabs}
              value={category}
              onValueChange={setCategory}
            />
          </ScrollRail>
        </div>
      </div>

      <p
        className="mt-6 font-mono text-xs tracking-wide text-muted-foreground uppercase"
        aria-live="polite"
      >
        {visible.length === items.length
          ? `${items.length} components`
          : `Showing ${visible.length} of ${items.length}`}
      </p>

      {/* Grid */}
      <div className="mt-4 grid grid-flow-row-dense gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <GalleryCard key={item.name} item={item} />
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-20 text-center">
          <p className="font-medium">No components match “{query.trim()}”.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another word, or browse everything.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 h-9 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted/60"
          >
            Show all components
          </button>
        </div>
      )}
    </MotionConfig>
  )
}

function TabLabel({ text, count }: { text: string; count: number }) {
  return (
    <>
      {text}
      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
        {count}
      </span>
    </>
  )
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const href = `/docs/${item.name}`

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
        layout: { type: "spring", stiffness: 380, damping: 38 },
      }}
      className={cn(
        "group flex flex-col rounded-2xl border bg-card transition-colors hover:border-foreground/20",
        item.wide && "lg:col-span-2"
      )}
    >
      {/* Live preview */}
      <div className="relative flex min-h-80 flex-1 items-center justify-center p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-t-2xl bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] opacity-70"
        />
        <div className="relative flex w-full justify-center">{item.preview}</div>
      </div>

      {/* Details */}
      <div className="flex items-start justify-between gap-4 border-t px-5 py-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            {item.categoryLabel}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Link href={href} className="font-medium hover:underline">
              {item.title}
            </Link>
            {item.isNew && (
              <span className="rounded-full bg-foreground px-1.5 py-px font-mono text-[10px] font-medium tracking-wide text-background uppercase">
                New
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        </div>
        <Link
          href={href}
          aria-label={`Open the ${item.title} docs`}
          className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-colors outline-none group-hover:border-foreground/30 group-hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.article>
  )
}
