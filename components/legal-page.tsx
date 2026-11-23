import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/site"

/** Shared layout for the Privacy Policy, Terms of Service and License pages. */
export function LegalPage({
  title,
  intro,
  updated = siteConfig.legalUpdated,
  children,
}: {
  title: string
  intro?: string
  updated?: string
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated {updated}
        </p>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_p+ul]:mt-3 [&_ul]:space-y-2 [&_ul+p]:mt-3">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

/** "Contact" paragraph that uses the support email when one is set. */
export function LegalContact() {
  return siteConfig.supportEmail ? (
    <p>
      Questions about these pages, your data or the license? Email{" "}
      <a href={`mailto:${siteConfig.supportEmail}`}>
        {siteConfig.supportEmail}
      </a>
      . We usually reply within a few days.
    </p>
  ) : (
    <p>
      Questions? Open an issue on{" "}
      <a href={siteConfig.github} target="_blank" rel="noreferrer">
        GitHub
      </a>
      .
    </p>
  )
}
