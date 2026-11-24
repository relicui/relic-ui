"use client"

import { useEffect, useState } from "react"

import { PerforationProgress } from "@/registry/relic/ui/perforation-progress"

export default function PerforationProgressDemo() {
  const [value, setValue] = useState(0)

  // Fake an upload that finishes, pauses, then starts over.
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 130 ? 0 : v + 6))
    }, 160)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <PerforationProgress
        label="Uploading"
        value={Math.min(value, 100)}
        showValue
      />
      <PerforationProgress label="Preparing" />
    </div>
  )
}
