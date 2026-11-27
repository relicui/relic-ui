"use client"

/**
 * Relic UI · Chord Matrix
 * https://relic-ui.vercel.app/docs/chord-matrix
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useCallback, useEffect, useState } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { playSynthNote } from "@/registry/relic/ui/acoustics-audio"

export type ScalePreset = "maj7" | "pentatonic" | "bass"

export interface ChordMatrixProps {
  /** Voicing preset. */
  defaultScale?: ScalePreset
  /** Silence synth output. */
  mute?: boolean
  /** Callback when a pad is struck. */
  onPadTrigger?: (note: string, frequency: number) => void
  className?: string
}

const KEY_LABELS = ["1", "2", "3", "4", "Q", "W", "E", "R", "A", "S", "D", "F", "Z", "X", "C", "V"]

const SCALES: Record<ScalePreset, { label: string; wave: OscillatorType; pads: { note: string; freq: number }[] }> = {
  maj7: {
    label: "Lo-Fi Maj7",
    wave: "triangle",
    pads: [
      { note: "C4", freq: 261.63 },
      { note: "E4", freq: 329.63 },
      { note: "G4", freq: 392.0 },
      { note: "B4", freq: 493.88 },
      { note: "D4", freq: 293.66 },
      { note: "F#4", freq: 369.99 },
      { note: "A4", freq: 440.0 },
      { note: "C#5", freq: 554.37 },
      { note: "F4", freq: 349.23 },
      { note: "A4", freq: 440.0 },
      { note: "C5", freq: 523.25 },
      { note: "E5", freq: 659.25 },
      { note: "G4", freq: 392.0 },
      { note: "B4", freq: 493.88 },
      { note: "D5", freq: 587.33 },
      { note: "F#5", freq: 739.99 },
    ],
  },
  pentatonic: {
    label: "Pentatonic",
    wave: "sine",
    pads: [
      { note: "C4", freq: 261.63 },
      { note: "D4", freq: 293.66 },
      { note: "E4", freq: 329.63 },
      { note: "G4", freq: 392.0 },
      { note: "A4", freq: 440.0 },
      { note: "C5", freq: 523.25 },
      { note: "D5", freq: 587.33 },
      { note: "E5", freq: 659.25 },
      { note: "G5", freq: 783.99 },
      { note: "A5", freq: 880.0 },
      { note: "C6", freq: 1046.5 },
      { note: "D6", freq: 1174.66 },
      { note: "G3", freq: 196.0 },
      { note: "A3", freq: 220.0 },
      { note: "E6", freq: 1318.51 },
      { note: "G6", freq: 1567.98 },
    ],
  },
  bass: {
    label: "Warm Sub",
    wave: "sawtooth",
    pads: [
      { note: "C2", freq: 65.41 },
      { note: "D2", freq: 73.42 },
      { note: "Eb2", freq: 77.78 },
      { note: "F2", freq: 87.31 },
      { note: "G2", freq: 98.0 },
      { note: "Ab2", freq: 103.83 },
      { note: "Bb2", freq: 116.54 },
      { note: "C3", freq: 130.81 },
      { note: "D3", freq: 146.83 },
      { note: "Eb3", freq: 155.56 },
      { note: "F3", freq: 174.61 },
      { note: "G3", freq: 196.0 },
      { note: "Ab3", freq: 207.65 },
      { note: "Bb3", freq: 233.08 },
      { note: "C4", freq: 261.63 },
      { note: "G4", freq: 392.0 },
    ],
  },
}

/**
 * A 4x4 MPC-style polyphonic pad matrix. Silent until the user taps a pad
 * or presses keyboard shortcuts (1-4, Q-R, A-F, Z-V).
 */
export function ChordMatrix({
  defaultScale = "maj7",
  mute = false,
  onPadTrigger,
  className,
}: ChordMatrixProps) {
  const [scale, setScale] = useState<ScalePreset>(defaultScale)
  const [activePads, setActivePads] = useState<Record<number, boolean>>({})
  const [lastNote, setLastNote] = useState<string>("—")

  const current = SCALES[scale]

  const triggerPad = useCallback(
    (index: number) => {
      const pad = current.pads[index]
      if (!pad) return

      setActivePads((prev) => ({ ...prev, [index]: true }))
      setLastNote(pad.note)
      if (!mute) playSynthNote(pad.freq, current.wave)
      onPadTrigger?.(pad.note, pad.freq)

      window.setTimeout(() => {
        setActivePads((prev) => ({ ...prev, [index]: false }))
      }, 220)
    },
    [current, mute, onPadTrigger]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return

      const idx = KEY_LABELS.indexOf(e.key.toUpperCase())
      if (idx !== -1) {
        triggerPad(idx)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [triggerPad])

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="chord-matrix"
        className={cn(
          "relative flex w-full max-w-sm flex-col rounded-xl border border-border/60 bg-muted/20 p-4 select-none",
          className
        )}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2.5 font-mono text-xs">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="size-2 rounded-full bg-primary" />
            <span className="font-semibold tracking-wider uppercase text-foreground">Chord Matrix</span>
          </div>
          <span className="rounded border border-border/60 bg-background/70 px-2 py-0.5 font-semibold text-foreground tabular-nums whitespace-nowrap">
            NOTE: {lastNote}
          </span>
        </div>

        {/* Scale Switcher */}
        <div className="mb-3.5 flex items-center gap-1.5 font-mono text-[11px]">
          {(Object.keys(SCALES) as ScalePreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setScale(key)}
              className={cn(
                "flex-1 rounded-md border py-1 transition-colors cursor-pointer whitespace-nowrap",
                scale === key
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
                  : "border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {SCALES[key].label}
            </button>
          ))}
        </div>

        {/* 4x4 Tactile Pad Grid */}
        <div className="grid grid-cols-4 gap-2">
          {current.pads.map((pad, idx) => {
            const lit = !!activePads[idx]
            return (
              <motion.button
                key={`${scale}-${idx}`}
                type="button"
                aria-label={`Pad ${pad.note} (${KEY_LABELS[idx]})`}
                onPointerDown={() => triggerPad(idx)}
                animate={{ scale: lit ? 0.93 : 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 24 }}
                className={cn(
                  "relative flex aspect-square cursor-pointer flex-col justify-between rounded-lg border p-2 text-left font-mono transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  lit
                    ? "border-primary bg-primary/15 text-foreground shadow-xs"
                    : "border-border/70 bg-background/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                <span className="flex items-center justify-between w-full">
                  <span className="text-[9px] opacity-60">{KEY_LABELS[idx]}</span>
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      lit ? "bg-primary shadow-[0_0_6px_var(--primary)]" : "bg-muted-foreground/30"
                    )}
                  />
                </span>
                <span className="text-xs font-semibold text-foreground">{pad.note}</span>
              </motion.button>
            )
          })}
        </div>

        <div className="mt-2.5 text-center font-mono text-[10px] text-muted-foreground whitespace-nowrap">
          Tap pads or keys 1–4, Q–R, A–F, Z–V
        </div>
      </div>
    </MotionConfig>
  )
}
