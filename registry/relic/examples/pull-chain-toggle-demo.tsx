"use client"

import { useState } from "react"

import { PullChainToggle } from "@/registry/relic/ui/pull-chain-toggle"

export default function PullChainToggleDemo() {
  const [on, setOn] = useState(false)

  return (
    <div className="flex items-start gap-6">
      <PullChainToggle label="Lamp" checked={on} onCheckedChange={setOn} />
      <div className="pt-6 text-sm">
        <p className="font-medium">The lamp is {on ? "on" : "off"}</p>
        <p className="mt-1 text-muted-foreground">Pull the chain down and let go.</p>
      </div>
    </div>
  )
}
