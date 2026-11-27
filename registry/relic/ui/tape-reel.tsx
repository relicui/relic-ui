"use client"

/**
 * Relic UI · Tape Reel
 * https://relic-ui.vercel.app/docs/tape-reel
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useRef, useState } from "react"
import { MotionConfig } from "motion/react"

import { cn } from "@/lib/utils"
import { playMechanicalLatch, playTapeScrub } from "@/registry/relic/ui/acoustics-audio"

export interface TapeReelProps {
  /** Total tape duration in seconds. */
  duration?: number
  /** Tape label printed on the deck plate. */
  label?: string
  /** Mute mechanical latch & scrub flutter sounds. */
  mute?: boolean
  /** Callback when playback position changes (0 to 1). */
  onProgressChange?: (progress: number) => void
  className?: string
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * A dual-spool reel-to-reel magnetic tape transport. Starts silently in standby;
 * press Play, FF/REW, or drag the tape scrub bar to hear mechanical latches
 * and head flutter while magnetic tape transfers between spools.
 */
export function TapeReel({
  duration = 180,
  label = "Master Reel · 15 IPS",
  mute = false,
  onProgressChange,
  className,
}: TapeReelProps) {
  const [mode, setMode] = useState<"stopped" | "play" | "ff" | "rew">("stopped")
  const [progress, setProgress] = useState(0.28)
  const [rotation, setRotation] = useState(0)
  const lastScrubAudioRef = useRef(0)

  // The animation loop reads the latest mode from here. Declared before the
  // loop's effect, so it's current when the loop starts.
  const modeRef = useRef(mode)
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (mode === "stopped") return

    let raf = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now

      const speedMult = modeRef.current === "play" ? 1 : modeRef.current === "ff" ? 6 : -6
      const deltaProgress = (dt * speedMult) / duration

      setProgress((prev) => {
        const next = Math.min(1, Math.max(0, prev + deltaProgress))
        if (next === 0 || next === 1) {
          setMode("stopped")
          if (!mute) playMechanicalLatch()
        }
        onProgressChange?.(next)
        return next
      })

      setRotation((r) => (r + dt * 95 * speedMult) % 360)
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [mode, duration, mute, onProgressChange])

  const switchMode = (next: "stopped" | "play" | "ff" | "rew") => {
    if (!mute) playMechanicalLatch()
    setMode((curr) => (curr === next ? "stopped" : next))
  }

  const handleScrub = (nextProgress: number) => {
    const delta = nextProgress - progress
    setProgress(nextProgress)
    setRotation((r) => (r + delta * 1400) % 360)
    onProgressChange?.(nextProgress)

    const now = performance.now()
    if (!mute && now - lastScrubAudioRef.current > 45) {
      lastScrubAudioRef.current = now
      playTapeScrub(Math.abs(delta) * 120)
    }
  }

  const leftTapeRadius = 22 + (1 - progress) * 18
  const rightTapeRadius = 22 + progress * 18

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="tape-reel"
        className={cn(
          "relative flex w-full max-w-md flex-col rounded-xl border border-border/60 bg-muted/20 p-4 select-none",
          className
        )}
      >
        {/* Top Deck Plate */}
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/50 pb-2.5 font-mono text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full transition-colors",
                mode !== "stopped"
                  ? "bg-primary shadow-[0_0_8px_var(--primary)]"
                  : "bg-muted-foreground/40"
              )}
            />
            <span className="truncate font-semibold tracking-wider uppercase text-foreground">{label}</span>
          </div>
          <span className="shrink-0 whitespace-nowrap tabular-nums text-[11px] text-muted-foreground">
            {formatTime(progress * duration)} / {formatTime(duration)}
          </span>
        </div>

        {/* Aluminum Reels Stage */}
        <div className="relative flex items-center justify-around rounded-lg border border-border/60 bg-background/70 px-4 py-5 shadow-inner overflow-hidden">
          {[
            { id: "left", radius: leftTapeRadius, rot: rotation },
            { id: "right", radius: rightTapeRadius, rot: rotation * 1.1 },
          ].map((reel) => (
            <div key={reel.id} className="relative flex size-24 sm:size-28 items-center justify-center">
              <svg viewBox="0 0 100 100" className="size-full overflow-visible">
                {/* Magnetic Tape Pack */}
                <circle cx="50" cy="50" r={reel.radius} className="fill-muted-foreground/30 stroke-border" strokeWidth="1" />
                {/* Rotating Flange */}
                <g style={{ transform: `rotate(${reel.rot}deg)`, transformOrigin: "50px 50px" }}>
                  <circle cx="50" cy="50" r="44" fill="none" className="stroke-border" strokeWidth="1.5" />
                  {[0, 120, 240].map((deg) => (
                    <path
                      key={deg}
                      d="M 50 50 L 38 14 A 38 38 0 0 1 62 14 Z"
                      className="fill-foreground/10 stroke-foreground/20"
                      strokeWidth="0.8"
                      transform={`rotate(${deg} 50 50)`}
                    />
                  ))}
                  {/* Center Spindle Hub */}
                  <circle cx="50" cy="50" r="10" className="fill-foreground/80 stroke-border" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="3.5" className="fill-background" />
                </g>
              </svg>
            </div>
          ))}

          {/* Tape Head & Tension Rollers */}
          <div className="pointer-events-none absolute inset-x-10 bottom-2 flex items-center justify-between">
            <span className="size-2 rounded-full border border-border bg-muted-foreground/60" />
            <div className="h-2.5 w-10 rounded-t border border-border bg-muted flex items-center justify-center">
              <span className={cn("h-0.5 w-5 rounded-full transition-colors", mode !== "stopped" ? "bg-primary" : "bg-muted-foreground/40")} />
            </div>
            <span className="size-2 rounded-full border border-border bg-muted-foreground/60" />
          </div>
        </div>

        {/* Tactile Scrub Bar */}
        <div className="mt-3.5 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={1}
            step={0.002}
            value={progress}
            aria-label="Scrub tape position"
            onChange={(e) => handleScrub(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Mechanical Transport Keys */}
        <div className="mt-3 grid grid-cols-4 gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => switchMode("rew")}
            aria-pressed={mode === "rew"}
            className={cn(
              "rounded-lg border py-1.5 font-medium transition-all active:translate-y-0.5 cursor-pointer",
              mode === "rew"
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/70 bg-background/60 hover:bg-muted text-foreground"
            )}
          >
            « REW
          </button>
          <button
            type="button"
            onClick={() => switchMode("play")}
            aria-pressed={mode === "play"}
            className={cn(
              "col-span-2 rounded-lg border py-1.5 font-semibold transition-all active:translate-y-0.5 cursor-pointer",
              mode === "play"
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/70 bg-background/60 hover:bg-muted text-foreground"
            )}
          >
            {mode === "play" ? "❚❚ PAUSE" : "▶ PLAY"}
          </button>
          <button
            type="button"
            onClick={() => switchMode("ff")}
            aria-pressed={mode === "ff"}
            className={cn(
              "rounded-lg border py-1.5 font-medium transition-all active:translate-y-0.5 cursor-pointer",
              mode === "ff"
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/70 bg-background/60 hover:bg-muted text-foreground"
            )}
          >
            FF »
          </button>
        </div>
      </div>
    </MotionConfig>
  )
}
