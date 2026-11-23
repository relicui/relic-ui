"use client"

import { useState } from "react"

import { StretchTabs } from "@/registry/relic/ui/stretch-tabs"

const items = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "settings", label: "Settings" },
]

export default function StretchTabsDemo() {
  const [tab, setTab] = useState("overview")

  return (
    <div className="flex flex-col items-center gap-4">
      <StretchTabs
        aria-label="Dashboard sections"
        items={items}
        value={tab}
        onValueChange={setTab}
      />
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {items.find((item) => item.value === tab)?.label}
        </span>
      </p>
    </div>
  )
}
