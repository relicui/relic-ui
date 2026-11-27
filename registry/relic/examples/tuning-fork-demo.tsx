"use client"

import { useState } from "react"
import { TuningFork } from "@/registry/relic/ui/tuning-fork"

export default function TuningForkDemo() {
  const [active, setActive] = useState(false)

  return (
    <div className="flex flex-col items-center gap-4">
      <TuningFork checked={active} onCheckedChange={setActive} frequency={440} />
      <span className="font-mono text-xs text-muted-foreground">
        Click to strike tines & synthesize 440Hz resonance
      </span>
    </div>
  )
}
