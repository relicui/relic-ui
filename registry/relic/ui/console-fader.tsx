"use client"

/**
 * Relic UI · Console Fader
 * https://relic-ui.vercel.app/docs/console-fader
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { getSharedAudioContext, playFaderFriction } from "@/registry/relic/ui/acoustics-audio"

export interface ConsoleFaderProps {
  /** Decibel level from -60 (Mute) to +6dB (controlled). */
  value?: number
  /** Initial decibel level (uncontrolled). */
  defaultValue?: number
  onValueChange?: (db: number) => void
  label?: string
  muteFrictionSound?: boolean
  className?: string
}

const DB_MARKS = [
  { db: 6, label: "+6" },
  { db: 0, label: "0" },
  { db: -6, label: "-6" },
  { db: -18, label: "-18" },
  { db: -36, label: "-36" },
  { db: -60, label: "-∞" },
]

/**
 * A studio audio mixing console fader with genuine physical resistance,
 * logarithmic decibel markings, and motorized flyback preset returns.
 */
export function ConsoleFader({
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  label = "Channel Fader",
  muteFrictionSound = false,
  className,
}: ConsoleFaderProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = useState(defaultValue)
  const currentDb = controlledValue ?? internal
  const [trackHeight, setTrackHeight] = useState(180)

  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const thumbY = useMotionValue(0)

  const dbToPx = useCallback(
    (db: number) => {
      const normalized = (6 - db) / 66
      return normalized * trackHeight
    },
    [trackHeight]
  )

  const pxToDb = useCallback(
    (px: number) => {
      const normalized = Math.max(0, Math.min(1, px / Math.max(trackHeight, 1)))
      return Math.round(6 - normalized * 66)
    },
    [trackHeight]
  )

  useLayoutEffect(() => {
    if (!trackRef.current) return
    const h = trackRef.current.offsetHeight ?? 180
    setTrackHeight(h)
    thumbY.set(dbToPx(currentDb))
  }, [currentDb, dbToPx, thumbY])

  const setPreset = (targetDb: number) => {
    getSharedAudioContext()
    if (!muteFrictionSound) playFaderFriction()
    setInternal(targetDb)
    onValueChange?.(targetDb)
    if (!reduceMotion) {
      animate(thumbY, dbToPx(targetDb), { type: "spring", stiffness: 350, damping: 24 })
    } else {
      thumbY.set(dbToPx(targetDb))
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return
    getSharedAudioContext()
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromClientY(e.clientY)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    updateFromClientY(e.clientY)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }

  const updateFromClientY = (clientY: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const rawY = Math.max(0, Math.min(trackHeight, clientY - rect.top))
    thumbY.set(rawY)

    if (!muteFrictionSound && Math.random() > 0.6) {
      playFaderFriction()
    }

    const calculatedDb = pxToDb(rawY)
    setInternal(calculatedDb)
    onValueChange?.(calculatedDb)
  }

  return (
    <div className={cn("flex flex-col items-center gap-3 p-4 rounded-xl border border-border/80 bg-muted/20 select-none", className)}>
      <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{label}</div>

      <div className="flex items-center gap-4">
        {/* Track & Fader Slider */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative h-48 w-10 flex justify-center cursor-pointer touch-none"
        >
          {/* Center Felt-Lined Linear Slot */}
          <div className="w-1.5 h-full rounded-full bg-stone-950 border border-border/60 shadow-inner" />

          {/* Aluminum Machined Fader Cap */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-6 rounded-md bg-gradient-to-b from-stone-200 via-stone-400 to-stone-500 border border-stone-300 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ top: thumbY }}
          >
            {/* Center Indented Sight Line */}
            <div className="w-full h-0.5 bg-stone-900 shadow-xs" />
          </motion.div>
        </div>

        {/* Decibel Scale Markings */}
        <div className="flex flex-col justify-between h-48 font-mono text-[10px] text-muted-foreground/70 py-1">
          {DB_MARKS.map((m) => (
            <button
              key={m.db}
              type="button"
              onClick={() => setPreset(m.db)}
              className={cn(
                "hover:text-primary transition-colors cursor-pointer text-left",
                currentDb === m.db && "text-primary font-bold"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Readout & Quick Presets */}
      <div className="flex items-center justify-between w-full font-mono text-xs border-t border-border/40 pt-2 text-muted-foreground">
        <span>{currentDb > 0 ? `+${currentDb}` : currentDb} dB</span>
        <button
          type="button"
          onClick={() => setPreset(0)}
          className="hover:text-foreground text-[10px] underline underline-offset-2 cursor-pointer"
        >
          0dB Unity
        </button>
      </div>
    </div>
  )
}
