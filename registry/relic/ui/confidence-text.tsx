"use client"

/**
 * Relic UI · Confidence Text
 * https://relic-ui.vercel.app/docs/confidence-text
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type ConfidenceToken = {
  text: string
  /** How sure the AI is about this word, from 0 to 1. */
  confidence: number
}

export interface ConfidenceTextProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** The words, each with a confidence between 0 and 1. */
  tokens: ConfidenceToken[]
  /** How doubt is shown: a warm highlight, an underline, or fading. */
  variant?: "heat" | "underline" | "fade"
  /** Words below this confidence count as unsure (0–1). */
  threshold?: number
  /** Only mark the unsure words; leave confident ones plain. */
  onlyLow?: boolean
  /** Show the percentage when hovering or focusing an unsure word. */
  showTooltip?: boolean
  /** Show an "Unsure → Sure" scale under the text. */
  showLegend?: boolean
  /** Fade the words in one by one when they come into view. */
  animate?: boolean
  /** Speed multiplier for the fade-in. */
  speed?: number
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

/** The CSS that shows how unsure a word is. */
function doubtStyle(variant: ConfidenceTextProps["variant"], confidence: number, low: boolean) {
  const doubt = 1 - confidence
  if (variant === "underline") {
    return {
      textDecorationLine: "underline",
      textDecorationStyle: low ? ("wavy" as const) : ("solid" as const),
      textDecorationColor: `color-mix(in oklch, var(--destructive) ${Math.round(doubt * 100)}%, transparent)`,
      textDecorationThickness: `${(1 + doubt * 1.5).toFixed(1)}px`,
      textUnderlineOffset: "4px",
    }
  }
  if (variant === "fade") return { opacity: 0.35 + confidence * 0.65 }
  return {
    backgroundColor: `color-mix(in oklch, var(--destructive) ${Math.round(doubt * 42)}%, transparent)`,
  }
}

/**
 * AI-written text that shows how sure it is about every word. Unsure words
 * glow, get a wavy underline or fade, and reveal their certainty on hover.
 */
export function ConfidenceText({
  tokens,
  variant = "heat",
  threshold = 0.6,
  onlyLow = false,
  showTooltip = true,
  showLegend = false,
  animate = true,
  speed = 1,
  className,
  ...props
}: ConfidenceTextProps) {
  const reduceMotion = useReducedMotion()
  const fadeIn = animate && !reduceMotion

  return (
    <div data-slot="confidence-text" className={cn("w-full", className)} {...props}>
      <p className="leading-loose">
        {tokens.map((token, i) => {
          const confidence = clamp01(token.confidence)
          const low = confidence < threshold
          const marked = !onlyLow || low
          const percent = Math.round(confidence * 100)
          return (
            <span key={i}>
              {i > 0 && " "}
              <motion.span
                className="group relative inline-block outline-none"
                tabIndex={showTooltip && low ? 0 : undefined}
                initial={fadeIn ? { opacity: 0, y: 4 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i * 0.035) / Math.max(speed, 0.1), duration: 0.3 }}
              >
                <span
                  className={cn(
                    "rounded-[3px] px-px transition-colors",
                    low && showTooltip && "cursor-help group-focus-visible:ring-2 group-focus-visible:ring-ring/50"
                  )}
                  style={marked ? doubtStyle(variant, confidence, low) : undefined}
                >
                  {token.text}
                </span>
                {low && <span className="sr-only"> (unsure, {percent}%)</span>}
                {showTooltip && low && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 translate-y-1 rounded-md bg-foreground px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-background opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                  >
                    {percent}% sure
                  </span>
                )}
              </motion.span>
            </span>
          )
        })}
      </p>
      {showLegend && (
        <div aria-hidden className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Unsure</span>
          <span
            className="h-1.5 w-24 rounded-full"
            style={{
              background:
                variant === "fade"
                  ? "linear-gradient(to right, color-mix(in oklch, var(--foreground) 35%, transparent), var(--foreground))"
                  : "linear-gradient(to right, color-mix(in oklch, var(--destructive) 55%, transparent), transparent)",
            }}
          />
          <span>Sure</span>
        </div>
      )}
    </div>
  )
}
