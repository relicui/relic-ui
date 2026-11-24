import { SiteHeaderClient } from "@/components/site-header-client"
import { getGitHubStars } from "@/lib/github"

/**
 * Fetches the GitHub star count on the server (refreshed at most once an
 * hour) and hands it to the interactive header.
 */
export async function SiteHeader() {
  const stars = await getGitHubStars()
  return <SiteHeaderClient stars={stars} />
}
