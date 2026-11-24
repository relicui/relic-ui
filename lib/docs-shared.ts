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
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]

/** Shown with a "New" badge in the gallery. Remove names as they age. */
export const NEW_COMPONENTS = new Set([
  "seeker-search",
  "caret-tag-input",
  "dial-number-input",
  "stretch-switch",
  "rocker-switch",
  "ink-checkbox",
  "caret-loader",
  "perforation-progress",
  "etch-skeleton",
  "ticket-toast",
  "rewrite-text",
  "caret-field",
])

/** Components whose preview needs room: they span two columns in the gallery. */
export const WIDE_COMPONENTS = new Set([
  "smooth-caret-input",
  "seeker-search",
  "caret-field",
  "fold-accordion",
])
