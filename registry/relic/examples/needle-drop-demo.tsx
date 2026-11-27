"use client"

import { useState } from "react"
import { NeedleDrop } from "@/registry/relic/ui/needle-drop"

export default function NeedleDropDemo() {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="w-full max-w-md">
      <NeedleDrop
        playing={playing}
        onPlayingChange={setPlaying}
        trackTitle="Acoustic Resonance in D Minor"
        artist="Relic Audio Lab"
      />
    </div>
  )
}
