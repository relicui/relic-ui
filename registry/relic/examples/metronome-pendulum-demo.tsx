"use client"

import { MetronomePendulum } from "@/registry/relic/ui/metronome-pendulum"

export default function MetronomePendulumDemo() {
  return (
    <div className="flex w-full justify-center">
      <MetronomePendulum defaultBpm={104} beatsPerBar={4} />
    </div>
  )
}
