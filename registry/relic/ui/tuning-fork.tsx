"use client"

/**
 * Relic UI · Tuning Fork
 * https://relic-ui.vercel.app/docs/tuning-fork
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { getSharedAudioContext, playTuningForkChime } from "@/registry/relic/ui/acoustics-audio"

export interface TuningForkProps {
  /** Checked/Active state (controlled). */
  checked?: boolean
  /** Initial state (uncontrolled). */
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Base frequency in Hertz (standard concert pitch is 440Hz). */
  frequency?: number
  /** Label for screen readers. */
  label?: string
  /** Mute audio output. */
  mute?: boolean
  className?: string
}

/**
 * A physical switch shaped like an acoustic tuning fork: toggling it strikes
 * the tines, causing them to vibrate with micro-harmonic spring oscillation
 * while emitting a pure, procedural 440Hz resonance tone.
 */
export function TuningFork({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  frequency = 440,
  label = "Acoustic Tuning Fork Switch",
  mute = false,
  className,
}: TuningForkProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = useState(defaultChecked)
  const isChecked = controlledChecked ?? internal
  const [isVibrating, setIsVibrating] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleToggle = useCallback(() => {
    // Unlock AudioContext immediately during click interaction
    getSharedAudioContext()

    const next = !isChecked
    setInternal(next)
    onCheckedChange?.(next)

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (next) {
      if (!mute) playTuningForkChime(frequency)
      setIsVibrating(true)
      // Match the 2.4s acoustic decay of playTuningForkChime
      timerRef.current = window.setTimeout(() => {
        setIsVibrating(false)
        timerRef.current = null
      }, 2400)
    } else {
      setIsVibrating(false)
    }
  }, [isChecked, onCheckedChange, mute, frequency])

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={label}
      onClick={handleToggle}
      className={cn(
        "group relative flex flex-col items-center justify-center pt-6 pb-4 px-5 rounded-xl border bg-muted/30 transition-all duration-300 cursor-pointer select-none",
        isChecked ? "border-primary/60 bg-primary/5 shadow-xs" : "border-border/60 hover:border-border",
        className
      )}
    >
      {/* Fork Graphic */}
      <div className="relative w-14 h-24 flex flex-col items-center justify-start">
        {/* Two Vibrating Tines */}
        <div className="relative w-9 h-14 flex justify-between">
          {/* Left Tine */}
          <motion.div
            className={cn(
              "w-1.5 h-full rounded-t-full transition-all duration-500",
              isChecked ? "bg-primary" : "bg-muted-foreground/60 group-hover:bg-foreground/80",
              isVibrating && "shadow-[0_0_10px_var(--primary)]"
            )}
            animate={
              isVibrating && !reduceMotion
                ? { x: [-1.4, 1.4, -0.9, 0.9, -0.4, 0.4, 0] }
                : { x: 0 }
            }
            transition={{ duration: 2.4, ease: "easeOut" }}
          />

          {/* Right Tine */}
          <motion.div
            className={cn(
              "w-1.5 h-full rounded-t-full transition-all duration-500",
              isChecked ? "bg-primary" : "bg-muted-foreground/60 group-hover:bg-foreground/80",
              isVibrating && "shadow-[0_0_10px_var(--primary)]"
            )}
            animate={
              isVibrating && !reduceMotion
                ? { x: [1.4, -1.4, 0.9, -0.9, 0.4, -0.4, 0] }
                : { x: 0 }
            }
            transition={{ duration: 2.4, ease: "easeOut" }}
          />
        </div>

        {/* U-Base Curve */}
        <div
          className="relative w-9 h-4 -mt-0.5 border-b-4 border-x-4 rounded-b-xl border-muted-foreground/60 transition-colors duration-300 group-hover:border-foreground/80 flex justify-center"
          style={{ borderColor: isChecked ? "var(--primary)" : undefined }}
        >
          {/* Stem Handle */}
          <div
            className={cn(
              "absolute top-3 w-2 h-6 rounded-b-sm transition-colors duration-300",
              isChecked ? "bg-primary" : "bg-muted-foreground/60 group-hover:bg-foreground/80"
            )}
          />
        </div>
      </div>

      {/* Frequency & Status Badge with clear spacing */}
      <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] tracking-wide text-muted-foreground">
        <span>{frequency} Hz</span>
        <span className="opacity-40">•</span>
        <span className={cn("font-medium", isChecked ? "text-primary" : "text-muted-foreground/70")}>
          {isVibrating ? "RESONATING" : isChecked ? "ACTIVE" : "DAMPED"}
        </span>
      </div>
    </button>
  )
}
