"use client"

import { useState } from "react"

import { PerforatedCard } from "@/registry/relic/ui/perforated-card"

export default function PerforatedCardDemo() {
  // Changing the key remounts the card, which puts the stub back.
  const [round, setRound] = useState(0)
  const [torn, setTorn] = useState(false)

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <PerforatedCard
        key={round}
        onTear={() => setTorn(true)}
        stub={
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Pull down to tear</span>
            <span aria-hidden>↓</span>
          </div>
        }
        reveal={
          <div>
            <p className="text-xs text-muted-foreground">Your discount code</p>
            <p className="mt-1 font-mono text-lg font-semibold tracking-widest">
              RELIC-7F3K
            </p>
          </div>
        }
      >
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          Gift card
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">20% off</p>
        <p className="mt-1 text-muted-foreground">Valid on any order.</p>
      </PerforatedCard>

      {torn && (
        <button
          type="button"
          onClick={() => {
            setTorn(false)
            setRound((r) => r + 1)
          }}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Reset
        </button>
      )}
    </div>
  )
}
