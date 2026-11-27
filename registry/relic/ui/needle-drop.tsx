"use client"

/**
 * Relic UI · Needle Drop
 * https://relic-ui.vercel.app/docs/needle-drop
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useCallback, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { getSharedAudioContext, playVinylCrackle } from "@/registry/relic/ui/acoustics-audio"

export interface NeedleDropProps {
  /** Active playing state (controlled). */
  playing?: boolean
  /** Initial playing state (uncontrolled). */
  defaultPlaying?: boolean
  onPlayingChange?: (playing: boolean) => void
  /** Label for track / media source. */
  trackTitle?: string
  artist?: string
  /** Mute procedural vinyl stylus crackle. */
  muteCrackle?: boolean
  className?: string
}

/**
 * A tactile play-pause activator modeled after a turntable: toggling 'Play'
 * swings the balanced tonearm and drops the stylus into the vinyl groove with
 * authentic procedural surface crackle.
 */
export function NeedleDrop({
  playing: controlledPlaying,
  defaultPlaying = false,
  onPlayingChange,
  trackTitle = "Acoustic Resonance in D Minor",
  artist = "Relic Audio Works",
  muteCrackle = false,
  className,
}: NeedleDropProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = useState(defaultPlaying)
  const isPlaying = controlledPlaying ?? internal

  const handleToggle = useCallback(() => {
    getSharedAudioContext()

    const next = !isPlaying
    setInternal(next)
    onPlayingChange?.(next)

    if (next && !muteCrackle) {
      playVinylCrackle()
    }
  }, [isPlaying, onPlayingChange, muteCrackle])

  return (
    <div
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      aria-pressed={isPlaying}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleToggle()
        }
      }}
      className={cn(
        "group relative flex w-full flex-col gap-4 p-4 sm:p-5 rounded-xl border bg-muted/20 select-none cursor-pointer transition-all duration-300 hover:border-foreground/30 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isPlaying ? "border-primary/50" : "border-border/60",
        className
      )}
    >
      {/* Top Row: Vinyl Disc + Full Track Metadata */}
      <div className="flex items-center gap-4">
        {/* Vinyl Disc with Rotating Grooves */}
        <div className="relative size-18 shrink-0 rounded-full bg-stone-950 flex items-center justify-center shadow-inner border border-stone-800">
          {/* Micro-groove rings */}
          <div className="absolute inset-1.5 rounded-full border border-dashed border-stone-800/80" />
          <div className="absolute inset-3.5 rounded-full border border-stone-800/60" />
          <div className="absolute inset-5 rounded-full border border-stone-800/40" />

          {/* Spinning Label Hub */}
          <motion.div
            animate={isPlaying && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="relative size-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center shadow-md"
          >
            <div className="size-1.5 rounded-full bg-stone-950" />
          </motion.div>

          {/* Physical Tonearm Pivot & Arm */}
          <motion.div
            className="absolute -top-1 -right-2 origin-top-right w-10 h-11 pointer-events-none"
            animate={{
              rotate: isPlaying ? 24 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 18,
            }}
          >
            {/* Arm bar */}
            <div className="absolute top-1 right-2 w-0.5 h-9 bg-muted-foreground rounded-full shadow-xs origin-top" />
            {/* Stylus Head */}
            <div className="absolute bottom-1 right-1 w-2.5 h-1.5 rounded-xs bg-primary shadow-xs" />
          </motion.div>
        </div>

        {/* Track Metadata */}
        <div className="flex-1 min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1 whitespace-nowrap">
            {isPlaying ? "STYLUS ENGAGED" : "NEEDLE RESTING"}
          </span>
          <div className="font-semibold text-sm text-foreground leading-snug">{trackTitle}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{artist}</div>
        </div>
      </div>

      {/* Bottom Bar: Speed Readout + Action Pill */}
      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
        <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground/70 whitespace-nowrap">
          33⅓ RPM · Vinyl
        </span>
        <div
          className={cn(
            "shrink-0 whitespace-nowrap px-3 py-1 rounded-lg border font-mono text-xs font-medium transition-colors duration-200",
            isPlaying
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-background/80 text-muted-foreground group-hover:text-foreground"
          )}
        >
          {isPlaying ? "PAUSE" : "DROP NEEDLE"}
        </div>
      </div>
    </div>
  )
}
