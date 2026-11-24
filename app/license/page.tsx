import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"

import { CodeBlock } from "@/components/docs/code-block"
import { LegalPage } from "@/components/legal-page"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "License",
  description: `${siteConfig.name} is open source under the ${siteConfig.license}.`,
}

const creditSnippet = `<a href="${siteConfig.url}">UI components by ${siteConfig.name}</a>`

export default async function LicensePage() {
  // Read the real LICENSE file so this page can never disagree with it.
  const license = await readFile(path.join(process.cwd(), "LICENSE"), "utf8")

  return (
    <LegalPage
      title="License"
      intro={`${siteConfig.name} is open source under the MIT License. Use it in any project, personal or commercial.`}
    >
      <section>
        <h2>In short</h2>
        <ul>
          <li>Use, copy and change the components in any project, including paid and closed-source ones.</li>
          <li>If you share the source code itself, keep the copyright and license notice in it.</li>
          <li>
            The license covers the code only. The {siteConfig.name} name and
            logo stay ours.
          </li>
        </ul>
      </section>

      <section>
        <h2>Crediting {siteConfig.name} (appreciated, not required)</h2>
        <p>
          A link back helps the project grow. If you&apos;d like to add one,
          for example in your footer or README:
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
