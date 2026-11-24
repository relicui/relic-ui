import type { ComponentType } from "react"

export type PropDoc = {
  name: string
  type: string
  default?: string
  description: string
}

export type DocExtras = {
  Demo: ComponentType
  /** Optional interactive playground shown in a "Customize" section. */
  Playground?: ComponentType
  props?: PropDoc[]
  accessibility?: string[]
}

export const REDUCED_MOTION =
  "Animation turns off automatically for users who enable reduced motion in their system settings."

export const nativeProps = (element: string): PropDoc => ({
  name: "...props",
  type: `React.ComponentProps<"${element}">`,
  description: `All native ${element} props.`,
})

/** Component categories, in the order they appear in the docs. */
export const CATEGORIES = [
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Inputs & Search" },
  { id: "toggles", label: "Toggles & Switches" },
  { id: "loaders", label: "Loading & Progress" },
  { id: "navigation", label: "Navigation" },
  { id: "cards", label: "Cards" },
  { id: "feedback", label: "Feedback" },
  { id: "effects", label: "Text & Effects" },
  { id: "ai", label: "AI" },
  { id: "ancient", label: "Ancient" },
  { id: "physics", label: "Physics" },
  { id: "files", label: "Files & Folders" },
  { id: "data", label: "Data & Analytics" },
  { id: "social", label: "Social & Profiles" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]

/** Shown with a "New" badge in the gallery. Remove names as they age. */
export const NEW_COMPONENTS = new Set([
  "profile-deck",
  "follower-ticker",
  "follow-button",
  "reach-rings",
  "milestone-road",
  "scroll-depth",
  "cohort-tide",
  "correlation-matrix",
  "heat-mosaic",
  "paper-drop",
  "fold-tree",
  "vault-code",
  "crumple-trash",
  "week-pulse",
  "hotspot-map",
  "visitor-count",
  "visitor-map",
  "confidence-text",
  "citation-peek",
  "prompt-deck",
  "temperature-dial",
  "response-versions",
  "suggestion-diff",
  "thought-fold",
  "deliberate-text",
  "context-gauge",
  "agent-steps",
  "rune-decode-text",
  "wax-seal-button",
  "scroll-unroll",
  "hourglass-loader",
  "astrolabe-picker",
  "chisel-input",
  "spring-slider",
  "newtons-cradle-loader",
  "liquid-progress",
  "pull-chain-toggle",
  "jelly-card",
  "orbit-menu",
])

/** Components whose preview needs room: they span two columns in the gallery. */
export const WIDE_COMPONENTS = new Set([
  "smooth-caret-input",
  "seeker-search",
  "caret-field",
  "fold-accordion",
  "suggestion-diff",
  "deliberate-text",
  "citation-peek",
  "prompt-deck",
  "week-pulse",
  "hotspot-map",
  "visitor-map",
  "cohort-tide",
  "heat-mosaic",
  "milestone-road",
])
