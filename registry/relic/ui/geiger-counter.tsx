"use client"

/**
 * Relic UI · Geiger Counter
 * https://relic-ui.vercel.app/docs/geiger-counter
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { getSharedAudioContext, playGeigerClick } from "@/registry/relic/ui/acoustics-audio"

export interface GeigerCounterProps {
  /** Activity level from 0 (calm background radiation) to 100 (critical throughput). */
  rate?: number
  /** Whether the acoustic detector is powered on (controlled). Defaults to false so it is silent until clicked. */
  active?: boolean
  defaultActive?: boolean
  onActiveChange?: (active: boolean) => void
  /** Label describing what is being measured (e.g. "API Traffic", "Errors / min"). */
  label?: string
  unit?: string
  /** Mute acoustic geiger clicks. */
  mute?: boolean
  className?: string
}

/**
 * An analog radiation rate meter for error rates or high-throughput events.
 * It is completely silent by default; toggling power on starts the acoustic
 * detector with Poisson-distributed clicks and needle flutter.
 */
export function GeigerCounter({
  rate = 15,
  active: controlledActive,
  defaultActive = false,
  onActiveChange,
  label = "System Error Density",
  unit = "µSv/h",
  mute = false,
  className,
}: GeigerCounterProps) {
  const reduceMotion = useReducedMotion()
  const [internalActive, setInternalActive] = useState(defaultActive)
  const isPowerOn = controlledActive ?? internalActive
  const [needleFlutter, setNeedleFlutter] = useState(0)
  const [flash, setFlash] = useState(false)

  // Clamp rate between 0 and 100
  const clampedRate = Math.max(0, Math.min(100, rate))
  // Needle rests at -45deg when powered off, sweeps up to +45deg when on
  const baseAngle = isPowerOn ? -45 + (clampedRate / 100) * 90 : -45

  const togglePower = () => {
    getSharedAudioContext()
    const next = !isPowerOn
    setInternalActive(next)
    onActiveChange?.(next)
  }

  // Clicking only happens when powered on with some activity. When it isn't,
  // the flutter and flash are simply not shown, so nothing needs resetting.
  const clicking = isPowerOn && clampedRate > 0

  // Audio & Flutter Interval: ONLY runs when user explicitly turns power on
  useEffect(() => {
    if (!clicking) return

    const intervalMs = Math.max(40, Math.floor(1800 / Math.max(1, clampedRate * 0.9)))
    const timer = setInterval(() => {
      if (Math.random() > 0.15) {
        if (!mute) playGeigerClick()
        setFlash(true)
        setTimeout(() => setFlash(false), 30)

        // Random erratic needle flutter
        const jitter = (Math.random() - 0.5) * (clampedRate * 0.15)
        setNeedleFlutter(jitter)
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [clicking, clampedRate, mute])

  return (
    <div
      className={cn(
        "relative w-full max-w-sm rounded-xl border border-border/80 bg-muted/30 p-5 shadow-xs select-none transition-colors",
        isPowerOn && clampedRate > 75 && "border-destructive/60 bg-destructive/5",
        className
      )}
    >
      {/* Header with Power Button */}
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground mb-3">
        <span className="uppercase tracking-wider flex items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              !isPowerOn
                ? "bg-muted-foreground/30"
                : clicking && flash
                  ? "bg-primary animate-ping"
                  : clampedRate > 75
                    ? "bg-destructive"
                    : "bg-primary/70"
            )}
          />
          {label}
        </span>

        {/* Tactile Power Switch */}
        <button
          type="button"
          onClick={togglePower}
          className={cn(
            "px-2 py-0.5 rounded border font-mono text-[10px] font-semibold tracking-wider transition-colors cursor-pointer",
            isPowerOn
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
          )}
        >
          {isPowerOn ? "POWER: ON" : "POWER: OFF"}
        </button>
      </div>

      {/* Analog Meter Face Arc */}
      <div className="relative h-24 w-full overflow-hidden flex items-end justify-center pt-2">
        {/* Scale Arc SVG */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 30 90 A 75 75 0 0 1 170 90"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
            strokeDasharray="2 4"
          />
          {/* Critical zone accent */}
          <path
            d="M 135 48 A 75 75 0 0 1 170 90"
            fill="none"
            stroke="var(--destructive)"
            strokeWidth="3.5"
            strokeOpacity="0.8"
          />
        </svg>

        {/* Dial Needle */}
        <motion.div
          className="absolute bottom-0 w-0.5 h-20 bg-foreground origin-bottom rounded-full shadow-sm"
          animate={{
            rotate: reduceMotion ? baseAngle : baseAngle + (clicking ? needleFlutter : 0),
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 15,
          }}
        />

        {/* Central Pivot Hub */}
        <div className="absolute -bottom-2 w-6 h-6 rounded-full border border-border bg-background shadow-xs flex items-center justify-center">
          <div className={cn("w-2 h-2 rounded-full transition-colors", isPowerOn ? "bg-primary" : "bg-muted-foreground/40")} />
        </div>
      </div>

      {/* Readout and Status */}
      <div className="flex justify-between items-center font-mono text-[10px] text-muted-foreground/60 px-6 pt-2 border-t border-border/40">
        <span>0</span>
        <span className="text-foreground font-semibold">
          {isPowerOn ? `${clampedRate} ${unit}` : "STANDBY (SILENT)"}
        </span>
        <span className="text-destructive font-semibold">100 CRIT</span>
      </div>
    </div>
  )
}
