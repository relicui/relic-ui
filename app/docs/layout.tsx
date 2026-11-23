import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { docs } from "@/lib/docs"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const items = docs.map(({ name, title }) => ({ name, title }))

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:gap-12 md:py-12">
        <aside className="md:sticky md:top-24 md:h-fit md:w-52 md:shrink-0">
          <DocsSidebar items={items} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <SiteFooter />
    </>
  )
}
