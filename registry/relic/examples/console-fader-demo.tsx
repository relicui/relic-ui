"use client"

import { ConsoleFader } from "@/registry/relic/ui/console-fader"

export default function ConsoleFaderDemo() {
  return (
    <div className="flex items-center justify-center gap-6">
      <ConsoleFader label="Master Output" defaultValue={0} />
    </div>
  )
}
