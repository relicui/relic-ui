"use client"

/**
 * Relic UI · Metronome Pendulum
 * https://relic-ui.vercel.app/docs/metronome-pendulum
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import { MotionConfig } from "motion/react"

import { cn } from "@/lib/utils"
import { playWoodblockTick } from "@/registry/relic/ui/acoustics-audio"

export interface MetronomePendulumProps {
  /** Initial tempo in beats per minute (40 to 208). */
  defaultBpm?: number
  /** Beats per bar for beat-1 bell accent (0 disables accent). */
  beatsPerBar?: number
  /** Silence audio output. */
  mute?: boolean
  /** Callback when BPM changes. */
  onBpmChange?: (bpm: number) => void
  className?: string
}

/**
 * A mechanical pyramid metronome with a sliding counterweight.
 * Starts silently in standby until the user releases the pendulum.
 */
export function MetronomePendulum({
  defaultBpm = 104,
  beatsPerBar = 4,
  mute = false,
  onBpmChange,
  className,
}: MetronomePendulumProps) {
  const [bpm, setBpm] = useState(defaultBpm)
  const [running, setRunning] = useState(false)
  const [angle, setAngle] = useState(0)
  const [beatIndex, setBeatIndex] = useState(0)

  const bpmRef = useRef(bpm)
  const muteRef = useRef(mute)
  const beatsPerBarRef = useRef(beatsPerBar)
  // Keep the latest settings where the animation loop can read them.
  // Declared before the loop's effect, so they're current when it starts.
  useEffect(() => {
    bpmRef.current = bpm
    muteRef.current = mute
    beatsPerBarRef.current = beatsPerBar
  })

  // Starting or stopping always begins from rest.
  const toggleRunning = () => {
    setRunning((r) => !r)
    setAngle(0)
    setBeatIndex(0)
  }

  useEffect(() => {
    if (!running) return

    let rafId = 0
    let lastTime = performance.now()
    let phase = 0
    let currentBeat = 0

    if (!muteRef.current) playWoodblockTick(beatsPerBarRef.current > 0)

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now

      const prevHalfCycle = Math.floor(phase / Math.PI)
      phase += dt * (bpmRef.current / 60) * Math.PI
      const nextHalfCycle = Math.floor(phase / Math.PI)

      if (nextHalfCycle > prevHalfCycle) {
        currentBeat += 1
        const barLen = beatsPerBarRef.current
        const beatInBar = barLen > 0 ? currentBeat % barLen : 1
        setBeatIndex(beatInBar)
        if (!muteRef.current) {
          playWoodblockTick(barLen > 0 && beatInBar === 0)
        }
      }

      setAngle(Math.sin(phase) * 28)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [running])

  const updateBpm = (next: number) => {
    const clamped = Math.min(208, Math.max(40, next))
    setBpm(clamped)
    onBpmChange?.(clamped)
  }

  const weightTopPct = 18 + ((bpm - 40) / (208 - 40)) * 52

  const tempoMarking =
    bpm < 60 ? "Largo" : bpm < 76 ? "Adagio" : bpm < 108 ? "Andante" : bpm < 120 ? "Moderato" : bpm < 168 ? "Allegro" : "Presto"

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="metronome-pendulum"
        className={cn(
          "relative flex w-full max-w-xs flex-col items-center rounded-xl border border-border/60 bg-muted/20 p-4 select-none",
          className
        )}
      >
        {/* Header */}
        <div className="mb-3 flex w-full items-center justify-between border-b border-border/50 pb-2.5 font-mono text-xs">
          <span className="font-semibold tracking-wider uppercase text-foreground">Metronome</span>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-muted-foreground">{tempoMarking}</span>
            <span className="rounded bg-background/80 border border-border/60 px-1.5 py-0.5 font-bold tabular-nums text-foreground">
              {bpm} BPM
            </span>
          </div>
        </div>

        {/* Beat Indicator Dots */}
        {beatsPerBar > 0 && (
          <div className="mb-2 flex items-center gap-2" aria-hidden>
            {Array.from({ length: beatsPerBar }).map((_, idx) => {
              const active = running && beatIndex === idx
              return (
                <span
                  key={idx}
                  className={cn(
                    "size-2 rounded-full transition-all duration-100",
                    active
                      ? idx === 0
                        ? "scale-125 bg-primary shadow-[0_0_8px_var(--primary)]"
                        : "scale-110 bg-foreground/80"
                      : "bg-muted-foreground/25"
                  )}
                />
              )
            })}
          </div>
        )}

        {/* Pyramid Housing & Swinging Pendulum */}
        <div className="relative flex h-48 w-44 items-end justify-center overflow-hidden">
          <div
            className="relative h-44 w-36 rounded-t-xl border border-border/70 bg-muted/40 shadow-inner"
            style={{ clipPath: "polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)" }}
          >
            <div className="mx-auto mt-3 h-32 w-8 rounded-sm border border-border/50 bg-background/60 flex flex-col justify-between py-2 items-center font-mono text-[8px] text-muted-foreground">
              <span>40</span>
              <span>80</span>
              <span>120</span>
              <span>168</span>
              <span>208</span>
            </div>
          </div>

          {/* Swinging Steel Rod + Counterweight */}
          <button
            type="button"
            aria-label={running ? "Stop metronome" : "Start metronome"}
            aria-pressed={running}
            onClick={toggleRunning}
            className="absolute inset-x-0 bottom-2.5 mx-auto h-40 w-12 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "50% 92%",
            }}
          >
            <span className="mx-auto block h-full w-1 rounded-full bg-foreground/75 shadow-xs" />
            <span
              className="absolute left-1/2 h-5 w-7 -translate-x-1/2 rounded-sm border border-border bg-primary shadow-sm transition-[top] duration-150"
              style={{ top: `${weightTopPct}%` }}
            />
            <span className="absolute bottom-1 left-1/2 size-3.5 -translate-x-1/2 rounded-full border border-border bg-muted-foreground/60" />
          </button>
        </div>

        {/* Tempo Controls */}
        <div className="mt-3 flex w-full items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => updateBpm(bpm - 4)}
            aria-label="Decrease tempo"
            className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            −
          </button>
          <input
            type="range"
            min={40}
            max={208}
            value={bpm}
            aria-label="Tempo BPM"
            onChange={(e) => updateBpm(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <button
            type="button"
            onClick={() => updateBpm(bpm + 4)}
            aria-label="Increase tempo"
            className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={toggleRunning}
          className={cn(
            "mt-3 w-full rounded-lg border py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer",
            running
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border/70 bg-background/60 text-foreground hover:bg-muted"
          )}
        >
          {running ? "Stop Pendulum" : "Start Pendulum"}
        </button>
      </div>
    </MotionConfig>
  )
}
