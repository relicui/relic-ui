"use client"

/**
 * Relic UI · Kalimba Tines
 * https://relic-ui.vercel.app/docs/kalimba-tines
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { playKalimbaPluck } from "@/registry/relic/ui/acoustics-audio"

export interface KalimbaTine {
  note: string
  freq: number
  heightPct: number
}

export interface KalimbaTinesProps {
  /** Silence kalimba pluck synthesis. */
  mute?: boolean
  /** Callback when a tine is plucked. */
  onPluck?: (note: string, frequency: number) => void
  className?: string
}

// Traditional V-arrangement: longest bass tine (C4) in center, alternating ascending left & right
const TINES: KalimbaTine[] = [
  { note: "D5", freq: 587.33, heightPct: 54 },
  { note: "B4", freq: 493.88, heightPct: 62 },
  { note: "G4", freq: 392.0, heightPct: 72 },
  { note: "E4", freq: 329.63, heightPct: 84 },
  { note: "C4", freq: 261.63, heightPct: 96 },
  { note: "D4", freq: 293.66, heightPct: 90 },
  { note: "F4", freq: 349.23, heightPct: 78 },
  { note: "A4", freq: 440.0, heightPct: 67 },
  { note: "C5", freq: 523.25, heightPct: 58 },
]

/**
 * A 9-tine resonant thumb piano. Pluck or swipe across the brushed-steel tines
 * to hear woody chamber resonance and watch acoustic waves radiate from the soundhole.
 */
export function KalimbaTines({ mute = false, onPluck, className }: KalimbaTinesProps) {
  const [vibrating, setVibrating] = useState<Record<number, number>>({})
  const [pulseKey, setPulseKey] = useState(0)
  const [lastNote, setLastNote] = useState("—")

  const pluck = (idx: number) => {
    const tine = TINES[idx]
    if (!tine) return

    setLastNote(tine.note)
    setPulseKey((k) => k + 1)
    setVibrating((prev) => ({ ...prev, [idx]: (prev[idx] ?? 0) + 1 }))
    if (!mute) playKalimbaPluck(tine.freq)
    onPluck?.(tine.note, tine.freq)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="kalimba-tines"
        className={cn(
          "relative flex w-full max-w-sm flex-col rounded-xl border border-border/60 bg-muted/20 p-4 select-none",
          className
        )}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2.5 font-mono text-xs">
          <span className="font-semibold tracking-wider uppercase text-foreground">Kalimba</span>
          <span className="rounded border border-border/60 bg-background/70 px-2 py-0.5 font-semibold text-foreground whitespace-nowrap">
            NOTE: {lastNote}
          </span>
        </div>

        {/* Acoustic Soundboard */}
        <div className="relative flex h-52 flex-col items-center overflow-hidden rounded-xl border border-border/70 bg-background/70 px-3 pt-3 shadow-inner">
          {/* Circular Soundhole + Acoustic Wave Ring */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 flex size-22 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-muted/60 shadow-inner">
            <AnimatePresence>
              {pulseKey > 0 && (
                <motion.span
                  key={pulseKey}
                  initial={{ scale: 0.7, opacity: 0.7 }}
                  animate={{ scale: 2.1, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-primary/50"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Bridge & Pressure Bar */}
          <div className="pointer-events-none relative z-20 h-2.5 w-full rounded-sm border border-border bg-muted-foreground/40 shadow-xs" />

          {/* Brushed Spring-Steel Tines */}
          <div className="relative z-30 -mt-0.5 flex h-36 w-full items-start justify-center gap-1.5">
            {TINES.map((tine, idx) => {
              const strikeCount = vibrating[idx] ?? 0
              return (
                <motion.button
                  key={`${tine.note}-${strikeCount}`}
                  type="button"
                  aria-label={`Pluck kalimba tine ${tine.note}`}
                  onPointerDown={() => pluck(idx)}
                  onPointerEnter={(e) => {
                    if (e.buttons === 1) pluck(idx)
                  }}
                  initial={strikeCount > 0 ? { scaleY: 0.94, rotate: [0, -2.5, 2.5, -1.2, 0] } : false}
                  animate={{ scaleY: 1, rotate: 0 }}
                  transition={{ duration: 0.42, ease: "easeOut" }}
                  style={{ height: `${tine.heightPct}%`, transformOrigin: "50% 0%" }}
                  className="group relative flex w-7 cursor-pointer flex-col items-center justify-end rounded-b-full border border-border bg-gradient-to-b from-muted to-foreground/25 pb-1.5 shadow-sm outline-none hover:border-foreground/50 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-mono text-[8px] font-bold text-foreground">{tine.note}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="mt-2.5 text-center font-mono text-[10px] text-muted-foreground whitespace-nowrap">
          Click or drag across tines for glissando
        </div>
      </div>
    </MotionConfig>
  )
}
