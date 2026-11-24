"use client"

/**
 * Relic UI · Rune Decode Text
 * https://relic-ui.vercel.app/docs/rune-decode-text
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

// Elder Futhark, the oldest runic alphabet.
const FUTHARK = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ"

/** A rune that changes every tick, the same on server and client. */
function runeAt(runes: string, index: number, tick: number) {
  const list = Array.from(runes)
  return list[(index * 31 + tick * 17 + index * tick) % list.length]
}

export interface RuneDecodeTextProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  text: string
  /** When to decode: on first view, on mount, or every time it's hovered. */
  trigger?: "view" | "mount" | "hover"
  /** Seconds for the whole text to resolve. */
  duration?: number
  /** The symbols to scramble through. */
  runes?: string
}

/**
 * Text that starts as ancient runes and decodes into readable letters, left to
 * right. Every letter keeps its own width, so nothing shifts while it decodes.
 */
export function RuneDecodeText({
  text,
  trigger = "view",
  duration = 1.6,
  runes = FUTHARK,
  className,
  onPointerEnter,
  ...props
}: RuneDecodeTextProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  // 0 = all runes, 1 = fully decoded. Hover-triggered text starts readable.
  const [progress, setProgress] = useState(trigger === "hover" ? 1 : 0)
  const [tick, setTick] = useState(0)
  const [runs, setRuns] = useState(0)
  const running = useRef(false)

  function decode() {
    if (running.current) return
    running.current = true
    setRuns((r) => r + 1)
  }

  // Start on view or on mount.
  useEffect(() => {
    if (reduceMotion || trigger === "hover") return
    if (trigger === "mount") {
      const t = setTimeout(decode, 0)
      return () => clearTimeout(t)
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        decode()
        observer.disconnect()
      }
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [trigger, reduceMotion])

  // Run one decode.
  useEffect(() => {
    if (runs === 0) return
    const started = performance.now()
    const timer = setInterval(() => {
      const p = Math.min((performance.now() - started) / (duration * 1000), 1)
      setProgress(p)
      setTick((t) => t + 1)
      if (p >= 1) {
        clearInterval(timer)
        running.current = false
      }
    }, 45)
    return () => clearInterval(timer)
  }, [runs, duration])

  const chars = Array.from(text)
  const resolved = reduceMotion ? chars.length : Math.floor(progress * chars.length)
  // Split into words, remembering where each word starts in the whole text.
  const words = useMemo(() => {
    const list: { part: string; start: number; space: boolean }[] = []
    let start = 0
    for (const part of text.split(/(\s+)/)) {
      list.push({ part, start, space: /^\s+$/.test(part) })
      start += Array.from(part).length
    }
    return list
  }, [text])

  return (
    <span
      ref={ref}
      data-slot="rune-decode-text"
      onPointerEnter={(e) => {
        onPointerEnter?.(e)
        if (trigger === "hover" && !reduceMotion) {
          setProgress(0)
          decode()
        }
      }}
      className={cn("inline", className)}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map(({ part, start, space }, w) => {
          if (space) return <span key={w}>{part}</span>
          return (
            // Words never break in the middle.
            <span key={w} className="inline-block whitespace-nowrap">
              {Array.from(part).map((ch, c) => {
                const i = start + c
                const done = i < resolved
                return (
                  <span key={i} className="relative inline-block">
                    {/* The real letter holds the width; the rune sits on top. */}
                    <span className={done ? undefined : "invisible"}>{ch}</span>
                    {!done && (
                      <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        {runeAt(runes, i, tick)}
                      </span>
                    )}
                  </span>
                )
              })}
            </span>
          )
        })}
      </span>
    </span>
  )
}
