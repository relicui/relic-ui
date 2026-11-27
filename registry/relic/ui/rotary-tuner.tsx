"use client"

/**
 * Relic UI · Rotary Tuner
 * https://relic-ui.vercel.app/docs/rotary-tuner
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo, useRef, useState } from "react"
import { MotionConfig } from "motion/react"

import { cn } from "@/lib/utils"
import { playRadioStaticBurst, playStationLockTone } from "@/registry/relic/ui/acoustics-audio"

export interface RadioStation {
  freq: number
  callSign: string
  genre: string
  toneFreq: number
}

export interface RotaryTunerProps {
  /** Initial FM frequency (88.0 - 108.0 MHz). */
  defaultFrequency?: number
  /** Preset FM stations along the band. */
  stations?: RadioStation[]
  /** Silence FM static and station lock tones. */
  mute?: boolean
  /** Callback when frequency changes. */
  onFrequencyChange?: (freq: number, station: RadioStation | null) => void
  className?: string
}

const DEFAULT_STATIONS: RadioStation[] = [
  { freq: 91.5, callSign: "KEXP", genre: "Ambient Drift", toneFreq: 392.0 },
  { freq: 96.4, callSign: "WNYC", genre: "Late Jazz", toneFreq: 440.0 },
  { freq: 101.2, callSign: "NTS-1", genre: "Dub & Tape", toneFreq: 523.25 },
  { freq: 106.1, callSign: "BBC-6", genre: "Synth Lab", toneFreq: 587.33 },
]

/**
 * An analog FM radio dial with signal strength meter and preset stations.
 * Silent on mount; sweeping the dial synthesizes FM inter-station static that
 * clears into a clean chime when locking onto a station.
 */
export function RotaryTuner({
  defaultFrequency = 96.4,
  stations = DEFAULT_STATIONS,
  mute = false,
  onFrequencyChange,
  className,
}: RotaryTunerProps) {
  const [freq, setFreq] = useState(defaultFrequency)
  const lastStaticRef = useRef(0)
  const lockedStationRef = useRef<string | null>(
    DEFAULT_STATIONS.find((s) => Math.abs(s.freq - defaultFrequency) < 0.25)?.callSign ?? null
  )

  const { activeStation, signal } = useMemo(() => {
    let best: RadioStation | null = null
    let minDiff = Infinity
    for (const s of stations) {
      const diff = Math.abs(s.freq - freq)
      if (diff < minDiff) {
        minDiff = diff
        best = s
      }
    }
    const sig = best ? Math.max(0.08, 1 - minDiff / 0.85) : 0.08
    const locked = best && minDiff <= 0.2 ? best : null
    return { activeStation: locked, signal: sig }
  }, [freq, stations])

  const handleTune = (nextFreq: number) => {
    const rounded = Math.round(nextFreq * 10) / 10
    setFreq(rounded)

    let best: RadioStation | null = null
    let minDiff = Infinity
    for (const s of stations) {
      const diff = Math.abs(s.freq - rounded)
      if (diff < minDiff) {
        minDiff = diff
        best = s
      }
    }
    const clarity = best ? Math.max(0, 1 - minDiff / 0.85) : 0
    const locked = best && minDiff <= 0.2 ? best : null
    onFrequencyChange?.(rounded, locked)

    if (mute) return

    if (locked && lockedStationRef.current !== locked.callSign) {
      lockedStationRef.current = locked.callSign
      playStationLockTone(locked.toneFreq)
    } else if (!locked) {
      lockedStationRef.current = null
      const now = performance.now()
      if (now - lastStaticRef.current > 55) {
        lastStaticRef.current = now
        playRadioStaticBurst(clarity)
      }
    }
  }

  const needlePct = ((freq - 88) / (108 - 88)) * 100
  const knobAngle = (freq - 88) * 32

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="rotary-tuner"
        className={cn(
          "relative flex w-full max-w-md flex-col rounded-xl border border-border/60 bg-muted/20 p-4 select-none",
          className
        )}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-bold border transition-colors",
                activeStation
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/60 bg-background/60 text-muted-foreground"
              )}
            >
              STEREO
            </span>
            <span className="font-semibold tracking-wider uppercase text-foreground">FM Receiver</span>
          </div>
          <span className="tabular-nums font-bold text-foreground whitespace-nowrap">{freq.toFixed(1)} MHz</span>
        </div>

        {/* Backlit Glass Frequency Window */}
        <div className="relative overflow-hidden rounded-lg border border-border/70 bg-background/80 px-3.5 pt-3.5 pb-4 shadow-inner">
          {/* Subtle glow behind active needle */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 w-20 -translate-x-1/2 bg-primary/10 blur-xl transition-[left] duration-75"
            style={{ left: `${needlePct}%` }}
          />

          {/* Station Name & Signal Bars */}
          <div className="mb-2.5 flex items-center justify-between gap-2 font-mono text-[11px]">
            <div className="flex min-w-0 items-center gap-1.5 truncate">
              <span className={cn("font-bold", activeStation ? "text-foreground" : "text-muted-foreground")}>
                {activeStation ? activeStation.callSign : "INTER-STATION STATIC"}
              </span>
              {activeStation && <span className="truncate text-muted-foreground">· {activeStation.genre}</span>}
            </div>
            {/* 5-segment Signal S-Meter */}
            <div className="flex shrink-0 items-end gap-0.5 h-3" aria-label={`Signal strength ${Math.round(signal * 100)}%`}>
              {[0.2, 0.4, 0.6, 0.8, 0.95].map((thresh, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1 rounded-t-xs transition-colors",
                    signal >= thresh ? "bg-primary" : "bg-muted-foreground/25"
                  )}
                  style={{ height: `${(i + 1) * 20}%` }}
                />
              ))}
            </div>
          </div>

          {/* Tick Marks */}
          <div className="relative h-7 border-t border-border/60 pt-1">
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
              {[88, 92, 96, 100, 104, 108].map((mhz) => (
                <span key={mhz}>{mhz}</span>
              ))}
            </div>

            {/* Station Dots on Scale */}
            {stations.map((s) => (
              <span
                key={s.callSign}
                aria-hidden
                style={{ left: `${((s.freq - 88) / 20) * 100}%` }}
                className="absolute bottom-1 size-1.5 -translate-x-1/2 rounded-full bg-muted-foreground/45"
              />
            ))}

            {/* Dial Needle */}
            <div
              aria-hidden
              style={{ left: `${needlePct}%` }}
              className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 bg-primary shadow-[0_0_6px_var(--primary)] transition-[left] duration-75"
            />
          </div>
        </div>

        {/* Tuning Flywheel + Range Slider */}
        <div className="mt-3.5 flex items-center gap-3.5">
          <div
            aria-hidden
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 shadow-sm"
            style={{ transform: `rotate(${knobAngle}deg)` }}
          >
            <span className="absolute top-1 h-2 w-0.5 rounded-full bg-primary" />
            <span className="size-4 rounded-full border border-border/70 bg-background/80" />
          </div>

          <div className="flex-1">
            <input
              type="range"
              min={88.0}
              max={108.0}
              step={0.1}
              value={freq}
              aria-label="Tune FM frequency"
              onChange={(e) => handleTune(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Station Preset Buttons */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 font-mono text-[11px]">
          {stations.map((s) => {
            const isLocked = activeStation?.callSign === s.callSign
            return (
              <button
                key={s.callSign}
                type="button"
                onClick={() => handleTune(s.freq)}
                className={cn(
                  "rounded-md border py-1 transition-colors cursor-pointer",
                  isLocked
                    ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                    : "border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {s.freq.toFixed(1)}
              </button>
            )
          })}
        </div>
      </div>
    </MotionConfig>
  )
}
