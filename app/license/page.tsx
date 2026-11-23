import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"

import { CodeBlock } from "@/components/docs/code-block"
import { LegalPage } from "@/components/legal-page"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "License",
  description: `${siteConfig.name} is free to use under the ${siteConfig.license}.`,
}

const creditSnippet = `<a href="${siteConfig.url}">UI components by ${siteConfig.name}</a>`

export default async function LicensePage() {
  // Read the real LICENSE file so this page can never disagree with it.
  const license = await readFile(path.join(process.cwd(), "LICENSE"), "utf8")

  return (
    <LegalPage
      title="License"
      intro={`${siteConfig.name} is free to use in personal and commercial projects, with a credit link.`}
    >
      <section>
        <h2>How to credit {siteConfig.name}</h2>
        <p>
          Add a visible link to {siteConfig.name} anywhere users can find it,
          such as your footer, an about or credits page, or your README. For
          example:
        </p>
        <CodeBlock className="mt-4" code={creditSnippet} />
      </section>

      <section>
        <h2>Full license text</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
          {license}
        </pre>
      </section>
    </LegalPage>
  )
}
