"use client"

/**
 * Relic UI · Prompt Deck
 * https://relic-ui.vercel.app/docs/prompt-deck
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useEffect, useState } from "react"
import { MotionConfig, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type DeckPrompt = {
  title: string
  prompt: string
  icon?: React.ReactNode
}

export interface PromptDeckProps {
  prompts: DeckPrompt[]
  /** Called with the prompt that was picked. */
  onPick?: (prompt: DeckPrompt) => void
  /** Fanned out like a hand of cards, stacked like a deck, or a simple grid. */
  layout?: "fan" | "stack" | "grid"
  /** Seconds between automatic shuffles. 0 turns it off. */
  autoShuffle?: number
  /** Most cards shown at once in the fan and stack layouts. */
  maxVisible?: number
  /** Card width in pixels. */
  cardWidth?: number
  /** Show the Shuffle button. */
  showShuffle?: boolean
  className?: string
}

/**
 * Suggested prompts as a deck of cards. Fan them out and hover to lift one,
 * stack them and flick through, or lay them out as a grid. Picking a card
 * gives it a little press, then hands its prompt to you.
 */
export function PromptDeck({
  prompts,
  onPick,
  layout = "fan",
  autoShuffle = 0,
  maxVisible = 4,
  cardWidth = 200,
  showShuffle = true,
  className,
}: PromptDeckProps) {
  const reduceMotion = useReducedMotion()
  const [order, setOrder] = useState(() => prompts.map((_, i) => i))
  const [hovered, setHovered] = useState<number | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  const shuffle = () => setOrder((o) => [...o.slice(1), o[0]])

  useEffect(() => {
    if (!autoShuffle || paused || reduceMotion || layout === "grid") return
    const id = setInterval(shuffle, autoShuffle * 1000)
    return () => clearInterval(id)
  }, [autoShuffle, paused, reduceMotion, layout])

  function pick(index: number) {
    setPicked(index)
    setTimeout(() => setPicked(null), 450)
    onPick?.(prompts[index])
  }

  const card = (index: number, extra?: string) => {
    const p = prompts[index]
    return (
      <span className={cn("flex h-full flex-col gap-2 text-left", extra)}>
        {p.icon && <span className="text-muted-foreground [&_svg]:size-4">{p.icon}</span>}
        <span className="text-sm font-medium">{p.title}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{p.prompt}</span>
      </span>
    )
  }

  const cardClass =
    "rounded-2xl border bg-card p-4 text-card-foreground shadow-md outline-none transition-colors hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50"

  if (layout === "grid") {
    return (
      <MotionConfig reducedMotion="user">
        <div data-slot="prompt-deck" role="list" className={cn("grid w-full gap-3 sm:grid-cols-2", className)}>
          {prompts.map((p, i) => (
            <motion.button
              key={p.title}
              type="button"
              role="listitem"
              onClick={() => pick(i)}
              whileHover={{ y: -3 }}
              animate={picked === i ? { scale: [1, 0.95, 1.02, 1] } : { scale: 1 }}
              className={cn(cardClass, "min-h-28")}
            >
              {card(i)}
            </motion.button>
          ))}
        </div>
      </MotionConfig>
    )
  }

  const visible = order.slice(0, Math.min(maxVisible, order.length))
  const n = visible.length
  const mid = (n - 1) / 2

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="prompt-deck"
        className={cn("flex w-full flex-col items-center gap-4", className)}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          setPaused(false)
          setHovered(null)
        }}
      >
        <div role="list" className="relative h-52 w-full" style={{ maxWidth: cardWidth * (layout === "fan" ? 2.4 : 1.4) }}>
          {visible.map((index, k) => {
            const lifted = hovered === index
            const fan = {
              x: (k - mid) * cardWidth * 0.42,
              y: lifted ? -18 : Math.abs(k - mid) * 9,
              rotate: lifted ? 0 : (k - mid) * 7,
              scale: lifted ? 1.05 : 1,
              zIndex: lifted ? 50 : 10 + n - Math.round(Math.abs(k - mid) * 2),
            }
            const stack = {
              x: 0,
              y: k * 10 - (lifted && k === 0 ? 8 : 0),
              rotate: k === 0 ? 0 : (k % 2 ? 3 : -3),
              scale: 1 - k * 0.05,
              zIndex: 10 + n - k,
            }
            const target = layout === "fan" ? fan : stack
            const interactive = layout === "fan" || k === 0
            return (
              <motion.button
                key={prompts[index].title}
                type="button"
                role="listitem"
                tabIndex={interactive ? 0 : -1}
                aria-hidden={!interactive || undefined}
                onClick={() => interactive && pick(index)}
                onPointerEnter={() => interactive && setHovered(index)}
                onFocus={() => interactive && setHovered(index)}
                initial={false}
                animate={{
                  ...target,
                  ...(picked === index ? { scale: [target.scale, target.scale * 0.94, target.scale * 1.03, target.scale] } : {}),
                }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className={cn(cardClass, "absolute top-4 left-1/2 h-36", !interactive && "pointer-events-none")}
                style={{ width: cardWidth, marginLeft: -cardWidth / 2 }}
              >
                {card(index)}
              </motion.button>
            )
          })}
        </div>
        {showShuffle && prompts.length > 1 && (
          <button
            type="button"
            onClick={shuffle}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M2 4h3l6 8h3M2 12h3l1.5-2M11 4h3M12 2l2 2-2 2M12 10l2 2-2 2" />
            </svg>
            Shuffle
          </button>
        )}
      </div>
    </MotionConfig>
  )
}
