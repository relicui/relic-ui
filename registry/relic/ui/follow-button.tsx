"use client"

/**
 * Relic UI · Follow Button
 * https://relic-ui.vercel.app/docs/follow-button
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type Person = { name: string; avatar?: string }

export interface FollowButtonProps {
  /** Who you'd be following, for the button's accessible name. */
  name?: string
  /** Followers not counting you. */
  followers: number
  /** Are you following (controlled)? */
  following?: boolean
  /** Following at first (uncontrolled). */
  defaultFollowing?: boolean
  onFollowingChange?: (following: boolean) => void
  /** People you know who follow them, shown as avatars. */
  mutuals?: Person[]
  /** All mutual followers, if more than the avatars shown. */
  mutualCount?: number
  /** You: your avatar flies into the stack when you follow. */
  you?: Person
  /** Word after the count. */
  unit?: string
  showCount?: boolean
  showMutuals?: boolean
  /** Hovering "Following" offers "Unfollow". */
  confirmUnfollow?: boolean
  /** Short numbers like 12.4K. */
  compact?: boolean
  size?: "sm" | "md"
  className?: string
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const HUES = [25, 70, 150, 200, 250, 300, 340]
const hueOf = (name: string) => HUES[Array.from(name).reduce((t, c) => t + c.charCodeAt(0), 0) % HUES.length]

function Avatar({ person, you }: { person: Person; you?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-background text-[10px] font-semibold text-white",
        you && "ring-2 ring-brand"
      )}
      style={{ background: person.avatar ? undefined : `oklch(0.62 0.13 ${hueOf(person.name)})` }}
      title={person.name}
    >
      {person.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.avatar} alt="" className="size-full object-cover" />
      ) : (
        initials(person.name)
      )}
    </span>
  )
}

function Digit({ n }: { n: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: `${-n * 10}%` }}
        transition={{ type: "spring", stiffness: 170, damping: 20 }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="flex h-[1em] items-center">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

/**
 * A follow button that shows the social proof around it. Following rolls the
 * count up and flies your avatar into the "followed by" stack, so the click
 * visibly lands somewhere. Hover "Following" to get "Unfollow".
 */
export function FollowButton({
  name,
  followers,
  following: followingProp,
  defaultFollowing = false,
  onFollowingChange,
  mutuals = [],
  mutualCount,
  you = { name: "You" },
  unit = "followers",
  showCount = true,
  showMutuals = true,
  confirmUnfollow = true,
  compact = false,
  size = "md",
  className,
}: FollowButtonProps) {
  const [internal, setInternal] = useState(defaultFollowing)
  const following = followingProp ?? internal
  const [hover, setHover] = useState(false)
  // Don't offer "Unfollow" under a cursor that just clicked "Follow".
  const [armed, setArmed] = useState(true)
  const [announce, setAnnounce] = useState("")

  const total = followers + (following ? 1 : 0)
  const text = compact ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(total) : total.toLocaleString("en-US")
  const chars = Array.from(text)
  const shown = mutuals.slice(0, 3)
  const others = Math.max(0, (mutualCount ?? mutuals.length) - Math.min(2, mutuals.length))
  const unfollowing = following && confirmUnfollow && hover && armed

  function toggle() {
    const next = !following
    if (followingProp === undefined) setInternal(next)
    onFollowingChange?.(next)
    setArmed(false)
    setAnnounce(next ? `Following${name ? ` ${name}` : ""}` : `Unfollowed${name ? ` ${name}` : ""}`)
  }

  const names = [following ? "you" : null, ...mutuals.slice(0, 2).map((m) => m.name)].filter(Boolean) as string[]
  const sentence =
    names.length === 0
      ? null
      : others > 0
        ? `${names.join(", ")} and ${others.toLocaleString("en-US")} other${others === 1 ? "" : "s"}`
        : names.length > 1
          ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
          : names[0]

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="follow-button" className={cn("flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2.5", className)}>
        {showMutuals && (shown.length > 0 || following) && (
          <span aria-hidden className="flex shrink-0 -space-x-2">
            <AnimatePresence initial={false}>
              {following && (
                <motion.span
                  key="you"
                  initial={{ x: 90, y: 0, scale: 0.4, opacity: 0 }}
                  animate={{ x: [90, 40, 0], y: [0, -26, 0], scale: [0.4, 0.9, 1], opacity: 1 }}
                  exit={{ x: 30, y: 16, scale: 0.4, opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.65, ease: "easeOut", times: [0, 0.5, 1] }}
                  className="relative z-10"
                >
                  <Avatar person={you} you />
                </motion.span>
              )}
            </AnimatePresence>
            {shown.map((m) => (
              <motion.span key={m.name} layout transition={{ type: "spring", stiffness: 300, damping: 26 }}>
                <Avatar person={m} />
              </motion.span>
            ))}
          </span>
        )}

        <span className="min-w-[120px] flex-1 overflow-hidden text-sm">
          {showCount && (
            <span aria-hidden className="flex items-baseline gap-1 leading-none">
              <span className="flex shrink-0 font-semibold tabular-nums">
                {chars.map((ch, i) => {
                  const k = chars.length - i
                  return /\d/.test(ch) ? (
                    <Digit key={k} n={Number(ch)} />
                  ) : (
                    <span key={k} className="flex h-[1em] items-center">
                      {ch}
                    </span>
                  )
                })}
              </span>
              <span className="truncate text-muted-foreground">{unit}</span>
            </span>
          )}
          {showMutuals && sentence && <span className="mt-1 block truncate text-xs text-muted-foreground">Followed by {sentence}</span>}
          <span className="sr-only">
            {total.toLocaleString("en-US")} {unit}
          </span>
        </span>

        <motion.button
          layout
          type="button"
          aria-pressed={following}
          aria-label={unfollowing ? `Unfollow${name ? ` ${name}` : ""}` : `Follow${name ? ` ${name}` : ""}`}
          onClick={toggle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => {
            setHover(false)
            setArmed(true)
          }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "relative ml-auto flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full font-medium whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            size === "sm" ? "h-8 px-3.5 text-xs" : "h-9 px-4 text-sm",
            !following && "bg-foreground text-background",
            following && !unfollowing && "border bg-background text-foreground",
            unfollowing && "border border-destructive/40 bg-destructive/10 text-destructive"
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={unfollowing ? "unfollow" : following ? "following" : "follow"}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-1.5"
            >
              {!following && (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="size-3.5" aria-hidden>
                  <path d="M8 3.5v9M3.5 8h9" />
                </svg>
              )}
              {following && !unfollowing && (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden>
                  <motion.path d="M3.5 8.5l3 3 6-6.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.1 }} />
                </svg>
              )}
              {unfollowing ? "Unfollow" : following ? "Following" : "Follow"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <span className="sr-only" role="status">
          {announce}
        </span>
      </div>
    </MotionConfig>
  )
}
