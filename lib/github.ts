import { cacheLife } from "next/cache"

import { siteConfig } from "@/lib/site"

/** "owner/repo" from the GitHub URL in the site config. */
const repoSlug = siteConfig.github.replace(/^https?:\/\/github\.com\//, "")

/**
 * The repository's star count, refreshed at most every 5 minutes.
 * Returns null if GitHub can't be reached, so the page never breaks on it.
 */
export async function getGitHubStars(): Promise<number | null> {
  "use cache"
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 })
  try {
    const res = await fetch(`https://api.github.com/repos/${repoSlug}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const data: { stargazers_count?: unknown } = await res.json()
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null
  } catch {
    return null
  }
}
