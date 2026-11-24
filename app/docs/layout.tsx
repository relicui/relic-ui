import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { docsByCategory } from "@/lib/docs"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const groups = docsByCategory.map(({ id, label, items }) => ({
    id,
    label,
    items: items.map(({ name, title }) => ({ name, title })),
  }))

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:gap-12 md:py-12">
        <aside className="md:sticky md:top-20 md:max-h-[calc(100svh-6rem)] md:w-52 md:shrink-0 md:overflow-y-auto md:pb-8">
          <DocsSidebar groups={groups} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <SiteFooter />
    </>
  )
}
