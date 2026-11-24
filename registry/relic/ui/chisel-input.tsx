"use client"

/**
 * Relic UI · Chisel Input
 * https://relic-ui.vercel.app/docs/chisel-input
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type Grain = { id: number; x: number; y: number; dx: number; dy: number; size: number }

let nextGrain = 0

export interface ChiselInputProps extends Omit<React.ComponentProps<"input">, "ref"> {
  /** Grains of stone dust per letter. 0 turns the dust off. */
  dust?: number
}

/**
 * A text field cut into stone: letters look engraved, and every keystroke
 * knocks a little dust off the caret that falls away.
 */
export function ChiselInput({ dust = 7, className, onChange, ...props }: ChiselInputProps) {
  const reduceMotion = useReducedMotion()
  const [grains, setGrains] = useState<Grain[]>([])
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const lastLength = useRef(String(props.value ?? props.defaultValue ?? "").length)

  /** Where the caret is, in pixels from the left of the field. */
  function caretX(input: HTMLInputElement) {
    canvas.current ??= document.createElement("canvas")
    const ctx = canvas.current.getContext("2d")
    if (!ctx) return 0
    const style = getComputedStyle(input)
    ctx.font = style.font
    const before = input.value.slice(0, input.selectionStart ?? input.value.length)
    const padding = parseFloat(style.paddingLeft) || 0
    return padding + ctx.measureText(before).width - input.scrollLeft
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(e)
    const input = e.currentTarget
    const grew = input.value.length > lastLength.current
    lastLength.current = input.value.length
    if (!grew || reduceMotion || dust <= 0) return

    const x = caretX(input)
    const y = input.offsetHeight / 2 + 4
    const burst: Grain[] = Array.from({ length: dust }, () => ({
      id: nextGrain++,
      x,
      y,
      dx: (Math.random() - 0.5) * 26,
      dy: 12 + Math.random() * 20,
      size: 1.5 + Math.random() * 1.8,
    }))
    setGrains((prev) => [...prev.slice(-60), ...burst])
    const ids = new Set(burst.map((g) => g.id))
    setTimeout(() => setGrains((prev) => prev.filter((g) => !ids.has(g.id))), 800)
  }

  return (
    <div data-slot="chisel-input" className="relative w-full">
      <input
        {...props}
        onChange={handleChange}
        className={cn(
          "h-11 w-full rounded-lg border border-stone-400/50 px-3.5 font-serif text-base tracking-wide outline-none",
          "bg-gradient-to-b from-stone-200 to-stone-300 text-stone-700 caret-stone-700 placeholder:text-stone-500/70",
          "shadow-[inset_0_2px_5px_rgb(0_0_0/0.18)] [text-shadow:0_1px_0_rgb(255_255_255/0.6),0_-1px_0_rgb(0_0_0/0.3)]",
          "dark:border-stone-600/60 dark:from-stone-800 dark:to-stone-900 dark:text-stone-300 dark:caret-stone-300 dark:placeholder:text-stone-500",
          "dark:shadow-[inset_0_2px_6px_rgb(0_0_0/0.5)] dark:[text-shadow:0_1px_0_rgb(255_255_255/0.07),0_-1px_0_rgb(0_0_0/0.7)]",
          "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
          className
        )}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {grains.map((g) => (
          <motion.span
            key={g.id}
            className="absolute rounded-full bg-stone-500/80 dark:bg-stone-400/60"
            style={{ left: g.x, top: g.y, width: g.size, height: g.size }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: g.dx, y: [0, -5, g.dy], opacity: [1, 1, 0] }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          />
        ))}
      </div>
    </div>
  )
}
