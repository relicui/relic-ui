import type { Metadata } from "next"
import Link from "next/link"

import { autoDemos } from "@/components/autoplay/auto-demo-map"
import { AutoplayFrame } from "@/components/autoplay/autoplay-frame"
import {
  ComponentGallery,
  type GalleryItem,
} from "@/components/gallery/component-gallery"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { categoryLabel, docs, docsByCategory } from "@/lib/docs"
import { NEW_COMPONENTS, WIDE_COMPONENTS } from "@/lib/docs-shared"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Components",
  description: `Browse every ${siteConfig.name} component, live. Search, filter by category, and try each one right on the page.`,
}

export default function ComponentsPage() {
  // The demos render here on the server and are handed to the gallery,
  // so the filtering code stays small.
  const items: GalleryItem[] = docsByCategory.flatMap((group) =>
    group.items.map(({ name, title, description, category, Demo }) => {
      // Prefer the self-playing version, so visitors see it move on its own.
      const Preview = autoDemos[name] ?? Demo
      return {
        name,
        title,
        description,
        category,
        categoryLabel: categoryLabel(category),
        isNew: NEW_COMPONENTS.has(name),
        wide: WIDE_COMPONENTS.has(name),
        preview: (
          <AutoplayFrame>
            <Preview />
          </AutoplayFrame>
        ),
      }
    })
  )

  const categories = docsByCategory.map(({ id, label, items }) => ({
    id,
    label,
    count: items.length,
  }))

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24">
        <section className="pt-16 pb-10 md:pt-24">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            The collection
          </p>
          <h1 className="mt-3 flex items-start gap-2 text-4xl font-semibold tracking-tighter md:text-6xl">
            Components
            <span className="mt-1 font-mono text-base font-normal tracking-normal text-muted-foreground md:mt-2 md:text-lg">
              {docs.length}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
            Every piece is live. Type in them, toggle them, tear them. When
            one feels right, open its docs for the install command and every
            option.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/docs" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Getting started
            </Link>
            <Link href="/license" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Open source · MIT
            </Link>
          </div>
        </section>

        <ComponentGallery items={items} categories={categories} />
      </main>
      <SiteFooter />
    </>
  )
}
