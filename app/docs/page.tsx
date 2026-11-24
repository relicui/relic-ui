import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/docs/code-block"
import { docs, docsByCategory } from "@/lib/docs"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Introduction",
}

export default function DocsIntroduction() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Introduction</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        {siteConfig.name} is a collection of animated React components built
        with Tailwind CSS and Motion. You don&apos;t install it as a package:
        you add the components you need straight into your project, and the
        code is yours to change.
      </p>

      <h2 className="mt-12 text-xl font-semibold">Requirements</h2>
      <p className="mt-2 text-muted-foreground">
        Your project needs React, Tailwind CSS and shadcn/ui set up. If you
        haven&apos;t set up shadcn/ui yet, run:
      </p>
      <CodeBlock className="mt-4" code="npx shadcn@latest init" />

      <h2 className="mt-12 text-xl font-semibold">Adding a component</h2>
      <p className="mt-2 text-muted-foreground">
        Each component page has its own install command, for example:
      </p>
      <CodeBlock
        className="mt-4"
        code={`npx shadcn@latest add ${siteConfig.url}/r/shimmer-button.json`}
      />
      <p className="mt-4 text-muted-foreground">
        Or install straight from GitHub:
      </p>
      <CodeBlock
        className="mt-4"
        code="npx shadcn@latest add relicui/relic-ui/shimmer-button"
      />

      <h2 className="mt-12 text-xl font-semibold">License</h2>
      <p className="mt-2 text-muted-foreground">
        Open source under the MIT License: free for personal and commercial
        projects. A credit link to {siteConfig.name} is appreciated, but not
        required.{" "}
        <Link href="/license" className="text-foreground underline underline-offset-4">
          Read the license
        </Link>
        .
      </p>

      <h2 className="mt-12 text-xl font-semibold">
        Components{" "}
        <span className="font-normal text-muted-foreground">
          ({docs.length})
        </span>
      </h2>
      <div className="mt-2 space-y-10">
        {docsByCategory.map((group) => (
          <section key={group.id} aria-labelledby={`category-${group.id}`}>
            <h3
              id={`category-${group.id}`}
              className="mt-6 font-mono text-xs tracking-wide text-muted-foreground uppercase"
            >
              {group.label}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {group.items.map((doc) => (
                <Link
                  key={doc.name}
                  href={`/docs/${doc.name}`}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <p className="font-medium">{doc.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
