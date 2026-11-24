"use client"

import { useEffect, useState } from "react"

import { LiquidProgress } from "@/registry/relic/ui/liquid-progress"

export default function LiquidProgressDemo() {
  const [value, setValue] = useState(35)

  // Fill up, pause, drain, and again.
  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 10 : v + 15)), 1500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-8">
        <LiquidProgress value={value} />
        <LiquidProgress value={value} shape="tank" size={110} />
      </div>
      <p className="text-xs text-muted-foreground">Move your cursor over the liquid to slosh it.</p>
    </div>
  )
}
