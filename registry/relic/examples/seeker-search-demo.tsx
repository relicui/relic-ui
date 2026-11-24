"use client"

import { useState } from "react"

import { SeekerSearch, type SeekerItem } from "@/registry/relic/ui/seeker-search"

const items: SeekerItem[] = [
  { value: "buttons", label: "Buttons", description: "Hold to confirm, shimmer", keywords: ["click"] },
  { value: "inputs", label: "Inputs", description: "Caret input, tags, dial", keywords: ["form", "text"] },
  { value: "switches", label: "Switches", description: "Stretch, rocker", keywords: ["toggle", "on off"] },
  { value: "checkbox", label: "Checkbox", description: "Ink checkbox", keywords: ["toggle", "tick"] },
  { value: "loaders", label: "Loaders", description: "Caret loader, skeleton", keywords: ["spinner", "progress"] },
  { value: "tabs", label: "Tabs", description: "Stretch tabs", keywords: ["navigation"] },
  { value: "toast", label: "Toast", description: "Ticket toast", keywords: ["notification", "alert"] },
]

export default function SeekerSearchDemo() {
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <SeekerSearch
        items={items}
        placeholders={["Search buttons…", "Search switches…", "Search loaders…"]}
        onSelect={(item) => setPicked(item.label)}
      />
      <p className="h-5 text-center text-sm text-muted-foreground">
        {picked ? `You picked ${picked}` : "Try typing “to”, then use ↑ ↓ and Enter"}
      </p>
    </div>
  )
}
