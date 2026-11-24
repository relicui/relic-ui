import type { MetadataRoute } from "next"

import { docs } from "@/lib/docs"
import { siteConfig } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${siteConfig.url}${path}`
  const lastModified = new Date(siteConfig.contentUpdated)

  return [
    { url: url("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: url("/components"), lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: url("/docs"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    ...docs.map((doc) => ({
      url: url(`/docs/${doc.name}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: url("/license"), lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: url("/privacy"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/terms"), lastModified, changeFrequency: "yearly", priority: 0.3 },
  ]
}
