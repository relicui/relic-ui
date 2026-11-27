"use client"

import { useState } from "react"
import { GeigerCounter } from "@/registry/relic/ui/geiger-counter"

export default function GeigerCounterDemo() {
  const [rate, setRate] = useState(25)

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <GeigerCounter rate={rate} label="Traffic Radiation Rate" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRate(10)}
          className="rounded-lg border bg-muted/40 px-2.5 py-1 font-mono text-xs hover:bg-muted cursor-pointer"
        >
          Calm (10)
        </button>
        <button
          onClick={() => setRate(50)}
          className="rounded-lg border bg-muted/40 px-2.5 py-1 font-mono text-xs hover:bg-muted cursor-pointer"
        >
          Medium (50)
        </button>
        <button
          onClick={() => setRate(95)}
          className="rounded-lg border border-destructive/50 bg-destructive/10 text-destructive px-2.5 py-1 font-mono text-xs hover:bg-destructive/20 cursor-pointer"
        >
          Critical (95)
        </button>
      </div>
    </div>
  )
}
