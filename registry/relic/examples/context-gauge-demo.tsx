"use client"

import { useEffect, useState } from "react"

import { ContextGauge } from "@/registry/relic/ui/context-gauge"

export default function ContextGaugeDemo() {
  const [used, setUsed] = useState(48_000)

  // A conversation slowly filling the window, then starting fresh.
  useEffect(() => {
    const id = setInterval(() => {
      setUsed((u) => (u >= 196_000 ? 24_000 : u + 9_000))
    }, 700)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-md">
      <ContextGauge used={used} max={200_000} />
    </div>
  )
}
