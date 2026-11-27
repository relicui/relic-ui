import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import { cacheLife } from "next/cache"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CodeBlock } from "@/components/docs/code-block"
import { ComponentPreview } from "@/components/docs/component-preview"
import { PropsTable } from "@/components/docs/props-table"
import { categoryLabel, docs, getDoc } from "@/lib/docs"
import { siteConfig } from "@/lib/site"

type Props = { params: Promise<{ slug: string }> }

// Only the components listed in lib/docs.ts get pages; anything else is a 404
// (the page calls notFound() for unknown slugs).
export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.name }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) return {}
  return { title: doc.title, description: doc.description }
}

// Paths in registry.json start with "registry/". Scoping the read to that
// folder keeps the bundler from tracing the whole project.
// Source files only change on deploy, so the read is cached for good.
async function readSource(filePath: string) {
  "use cache"
  cacheLife("max")
  const relative = filePath.replace(/^registry\//, "")
  const code = await readFile(
    path.join(process.cwd(), "registry", relative),
    "utf8"
  )
  // Show users the import path the component will have in *their* project.
  return code.replaceAll("@/registry/relic/ui/", "@/components/ui/").trim()
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 mb-4 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  )
}

// The slug is read inside <Suspense> so navigation can start instantly.
// Every listed component is still prerendered, so visitors don't see the fallback.
export default function ComponentDocPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ComponentDoc params={params} />
    </Suspense>
  )
}

async function ComponentDoc({ params }: Props) {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) notFound()

  const { Demo, Playground } = doc
  // Our registered shadcn namespace (registry.json "name": "relic-ui").
  const installCommand = `npx shadcn@latest add @relic-ui/${doc.name}`
  const usage = await readSource(doc.demoPath)
  const source = await readSource(doc.files[0].path)
  const deps = doc.dependencies ?? []

  return (
    <article className="max-w-3xl">
      <p className="mb-2 font-mono text-xs tracking-wide text-muted-foreground uppercase">
        {categoryLabel(doc.category)}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{doc.description}</p>

      <div className="mt-8">
        <ComponentPreview code={usage}>
          <Demo />
        </ComponentPreview>
      </div>

      <SectionHeading>Installation</SectionHeading>
      <CodeBlock code={installCommand} />
      <p className="mt-3 text-sm text-muted-foreground">
        On an older shadcn version? Use the full address:{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs break-all">
          npx shadcn@latest add {siteConfig.url}/r/{doc.name}.json
        </code>
      </p>

      <details className="group mt-4 rounded-lg border">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground select-none hover:text-foreground">
          Manual installation
        </summary>
        <div className="space-y-4 border-t p-4">
          {deps.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                1. Install the dependencies:
              </p>
              <CodeBlock code={`npm install ${deps.join(" ")}`} />
            </>
          )}
          <p className="text-sm text-muted-foreground">
            {deps.length > 0 ? "2. " : ""}Copy this code into{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              components/ui/{doc.name}.tsx
            </code>
            :
          </p>
          <CodeBlock code={source} />
        </div>
      </details>

      <SectionHeading>Usage</SectionHeading>
      <CodeBlock code={usage} />

      {Playground && (
        <>
          <SectionHeading>Customize</SectionHeading>
          <p className="-mt-2 mb-4 text-muted-foreground">
            Try the options below, then copy the code.
          </p>
          <Playground />
        </>
      )}

      {doc.props && doc.props.length > 0 && (
        <>
          <SectionHeading>Props</SectionHeading>
          <PropsTable props={doc.props} />
        </>
      )}

      {doc.accessibility && doc.accessibility.length > 0 && (
        <>
          <SectionHeading>Accessibility</SectionHeading>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            {doc.accessibility.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
