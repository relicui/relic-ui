import * as P from "@/components/playgrounds/social-playgrounds"
import { REDUCED_MOTION, type DocExtras, type PropDoc } from "@/lib/docs-shared"
import FollowButtonDemo from "@/registry/relic/examples/follow-button-demo"
import FollowerTickerDemo from "@/registry/relic/examples/follower-ticker-demo"
import MilestoneRoadDemo from "@/registry/relic/examples/milestone-road-demo"
import ProfileDeckDemo from "@/registry/relic/examples/profile-deck-demo"
import ReachRingsDemo from "@/registry/relic/examples/reach-rings-demo"

const p = (name: string, type: string, description: string, def?: string): PropDoc => ({
  name,
  type,
  description,
  default: def,
})

const PLATFORM_TYPE = '"x" | "instagram" | "youtube" | "github" | "linkedin" | "twitch" | string'
const GLYPH_NOTE = "Platform glyphs are simple marks drawn for Relic UI, not official logos. Pass icon to use your own."

/** Docs for the Social & Profiles components. */
export const socialExtras: Record<string, DocExtras> = {
  "profile-deck": {
    Demo: ProfileDeckDemo,
    Playground: P.ProfileDeckPlayground,
    props: [
      p("profiles", "{ platform; handle; followers; name?; avatar?; bio?; stats?; href?; icon? }[]", "One card per platform."),
      p("name", "string", "Your name, shown on every card."),
      p("avatar", "string", "Your picture URL. Initials are used without one."),
      p("layout", '"stack" | "fan"', "A neat stack, or cards fanned out like a hand.", '"stack"'),
      p("tint", "boolean", "Color each card's band in the platform's color.", "true"),
      p("autoShuffle", "number", "Deal the next card every n seconds. Pauses on hover and focus. 0 for off.", "0"),
      p("index / onIndexChange", "number", "The card on top, if you control it."),
    ],
    accessibility: [
      "The deck is one Tab stop: ← → (or ↑ ↓) deal the cards, and the new top card is announced.",
      "Platform buttons below the deck jump straight to a card and mark the current one with aria-current.",
      "Only the top card is exposed to screen readers. Dragging is optional, and turns off with reduced motion.",
      GLYPH_NOTE,
    ],
  },
  "follower-ticker": {
    Demo: FollowerTickerDemo,
    Playground: P.FollowerTickerPlayground,
    props: [
      p("platform", PLATFORM_TYPE, "Sets the glyph, color and word (subscribers for YouTube)."),
      p("count", "number", "Current followers. Change it and the digits roll."),
      p("handle", "string", "Used in the accessible name."),
      p("label", "string", "The word after the number."),
      p("milestones", "number[]", "Goals to count towards.", "100 … 10M"),
      p("showRing", "boolean", "A ring around the icon that fills towards the next milestone.", "true"),
      p("showNext", "boolean", "“520 to 13K” next to the count.", "true"),
      p("celebrate", "boolean", "Stamp a small celebration when a milestone is crossed.", "true"),
      p("compact", "boolean", "Short numbers like 12.4K.", "false"),
      p("size", '"sm" | "md" | "lg"', "Size of the badge.", '"md"'),
      p("href", "string", "Makes the badge a link to the profile."),
      p("icon", "ReactNode", "Your own icon."),
    ],
    accessibility: [
      "Reads as one sentence: “12,480 followers on X (@mayacodes). 520 to go until 13K.”",
      "Crossing a milestone is announced in a live region.",
      REDUCED_MOTION,
      GLYPH_NOTE,
    ],
  },
  "follow-button": {
    Demo: FollowButtonDemo,
    Playground: P.FollowButtonPlayground,
    props: [
      p("name", "string", "Who you'd follow, for the button's accessible name."),
      p("followers", "number", "Followers not counting you."),
      p("following / defaultFollowing", "boolean", "Following, controlled or at first.", "false"),
      p("onFollowingChange", "(following: boolean) => void", "Called on every follow and unfollow."),
      p("mutuals", "{ name; avatar? }[]", "People you know who follow them."),
      p("mutualCount", "number", "All mutual followers, if more than the avatars shown."),
      p("you", "{ name; avatar? }", "Your avatar, which flies into the stack.", '{ name: "You" }'),
      p("unit", "string", "The word after the count.", '"followers"'),
      p("showCount / showMutuals", "boolean", "Show the count and the “Followed by” line.", "true"),
      p("confirmUnfollow", "boolean", "Hovering Following offers Unfollow, but never right after you click Follow.", "true"),
      p("compact", "boolean", "Short numbers like 12.4K.", "false"),
      p("size", '"sm" | "md"', "Button size.", '"md"'),
    ],
    accessibility: [
      "A real toggle button with aria-pressed, named “Follow Maya Rao”.",
      "Following and unfollowing are announced, and the count is available as plain text.",
      REDUCED_MOTION,
    ],
  },
  "reach-rings": {
    Demo: ReachRingsDemo,
    Playground: P.ReachRingsPlayground,
    props: [
      p("profiles", "{ platform; followers; handle?; color?; icon? }[]", "One ring per platform."),
      p("size", "number", "Diameter in pixels.", "220"),
      p("thickness", "number", "Ring thickness in pixels.", "14"),
      p("gap", "number", "Space between rings.", "5"),
      p("sweep", "number", "How far round the biggest ring goes, in degrees.", "290"),
      p("sort", "boolean", "Biggest audience on the outside.", "true"),
      p("showLegend", "boolean", "A list of platforms with their counts.", "true"),
      p("animate", "boolean", "Draw the rings in when they come into view.", "true"),
      p("label", "string", "Words under the total.", '"total reach"'),
    ],
    accessibility: [
      "The chart is described as “105K total reach across 5 platforms”.",
      "Every legend row is a button that reads the platform, count and share, and lights up its ring on focus.",
      "Ring color is backed by the platform glyph and the printed numbers.",
      REDUCED_MOTION,
      GLYPH_NOTE,
    ],
  },
  "milestone-road": {
    Demo: MilestoneRoadDemo,
    Playground: P.MilestoneRoadPlayground,
    props: [
      p("count", "number", "Followers right now."),
      p("milestones", "number[]", "Goals along the road.", "100 … 1M"),
      p("history", "{ date; count }[]", "Past counts. Dates the milestones you passed and sets the pace for projections."),
      p("visible", "number", "How many milestones fit on the road at once.", "5"),
      p("unit", "string", "Word for what is counted.", '"followers"'),
      p("showProjection", "boolean", "Estimate when the next milestone will be reached, from the last 30 days.", "true"),
      p("marker", "ReactNode", "What travels along the road: initials, an icon, an image. Defaults to the count."),
      p("locale", "string", "Locale for numbers and dates."),
    ],
    accessibility: [
      "Every milestone can be focused and reads like “10K reached on Mar 2” or “50K: about 23 days away at the current pace”.",
      "Dates are formatted in UTC, so the server and browser always agree.",
      REDUCED_MOTION,
    ],
  },
}
