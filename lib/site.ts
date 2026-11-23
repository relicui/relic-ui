export const siteConfig = {
  name: "Relic UI",
  description:
    "Beautiful animated React components built with Tailwind CSS and Motion. Install with the shadcn CLI.",
  // Change this when you deploy or buy a custom domain.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://relic-ui.vercel.app",
  github: "https://github.com/relicui/relic-ui",
  // Shown in the footer and on the legal pages.
  supportEmail: "tambeshubham2004@gmail.com" as string | undefined,

  // Used by the Privacy Policy, Terms of Service and LICENSE page.
  operator: "Shubham Tambe",
  country: "India",
  license: "MIT with attribution and the Commons Clause",
  // Shown on the legal pages. Update it whenever you change them.
  legalUpdated: "November 23, 2026",
  // Used as "last modified" in the sitemap. Update it when you ship changes.
  contentUpdated: "2026-11-23",
}
