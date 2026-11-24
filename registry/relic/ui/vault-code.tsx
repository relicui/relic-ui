"use client"

/**
 * Relic UI · Vault Code
 * https://relic-ui.vercel.app/docs/vault-code
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useId, useRef, useState } from "react"
import { MotionConfig, motion, useAnimate, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type Status = "idle" | "checking" | "success" | "error"

export interface VaultCodeProps {
  /** Number of digits. */
  length?: number
  /** The code (controlled). */
  value?: string
  /** The code at first (uncontrolled). */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * Called when every digit is filled. Return (or resolve to) true to unlock,
   * false to shake and clear. Return nothing to just leave it as it is.
   */
  onComplete?: (code: string) => boolean | void | Promise<boolean | void>
  /** Hide digits behind dots once they have rolled into place. */
  mask?: boolean
  size?: "sm" | "md" | "lg"
  /** Put a small gap after every n digits (e.g. 3 for "123 456"). 0 for none. */
  groupSize?: number
  /** Show the padlock that opens on success. */
  showLock?: boolean
  /** Clear the digits after a wrong code. */
  resetOnError?: boolean
  /** Accessible name of the input. */
  label?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

const SIZES = {
  sm: { w: 34, h: 46, row: 26, text: "text-lg", gap: "gap-1.5" },
  md: { w: 42, h: 58, row: 32, text: "text-2xl", gap: "gap-2" },
  lg: { w: 50, h: 70, row: 40, text: "text-3xl", gap: "gap-2.5" },
}

// 9 above 0 and 0 below 9, so the neighbours always peek in.
const STRIP = [9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

function Tumbler({
  digit,
  active,
  mask,
  status,
  size,
}: {
  digit: number | null
  active: boolean
  mask: boolean
  status: Status
  size: (typeof SIZES)["md"]
}) {
  const offset = (size.h - size.row) / 2 - ((digit ?? 0) + 1) * size.row
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-lg border bg-muted/40 transition-colors duration-300",
        active && "border-foreground/40",
        status === "success" && "border-primary/60 bg-primary/10",
        status === "error" && "border-destructive/60 bg-destructive/10"
      )}
      style={{ width: size.w, height: size.h }}
    >
      {/* The rolling strip of digits, shaded at the edges like a real dial. */}
      <motion.span
        className={cn("absolute inset-x-0 top-0 flex flex-col font-mono font-semibold tabular-nums", size.text)}
        style={{
          maskImage: "linear-gradient(transparent, black 30%, black 70%, transparent)",
          WebkitMaskImage: "linear-gradient(transparent, black 30%, black 70%, transparent)",
        }}
        initial={false}
        animate={{ y: offset, opacity: digit === null ? 0 : mask ? [1, 1, 0] : 1 }}
        transition={{
          y: { type: "spring", stiffness: 170, damping: 17, mass: 0.9 },
          opacity: mask && digit !== null ? { duration: 0.9, times: [0, 0.6, 1] } : { duration: 0.2 },
        }}
      >
        {STRIP.map((n, i) => (
          <span
            key={i}
            className={cn("flex shrink-0 items-center justify-center", i !== (digit ?? 0) + 1 && "text-muted-foreground/40")}
            style={{ height: size.row }}
          >
            {n}
          </span>
        ))}
      </motion.span>

      {mask && digit !== null && (
        <motion.span
          key={digit}
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 500, damping: 20 }}
        >
          <span className="size-2.5 rounded-full bg-foreground" />
        </motion.span>
      )}

      {/* The window lines that frame the current digit. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-1.5 border-y border-foreground/5" style={{ top: (size.h - size.row) / 2, height: size.row }} />

      {/* Brand rule: the caret is always gold. */}
      {active && (
        <span aria-hidden className="absolute bottom-2 left-1/2 h-0.5 w-3 -translate-x-1/2 animate-pulse rounded-full bg-brand" />
      )}
    </span>
  )
}

function Padlock({ open, status }: { open: boolean; status: Status }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={cn(
        "h-7 w-6 shrink-0 overflow-visible transition-colors duration-300",
        status === "success" ? "text-primary" : status === "error" ? "text-destructive" : "text-muted-foreground"
      )}
    >
      <motion.path
        d="M7 13V8.5a5 5 0 0 1 10 0V13"
        style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}
        initial={false}
        animate={open ? { y: -4, rotate: 28 } : { y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
      />
      <rect x="3.5" y="13" width="17" height="12" rx="2.5" fill="currentColor" fillOpacity={0.12} />
      <motion.path
        d="M12 17.5v3"
        initial={false}
        animate={{ opacity: open ? 0 : 1 }}
      />
      {open && (
        <motion.path
          d="M8.5 19l2.4 2.2 4.6-4.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        />
      )}
    </svg>
  )
}

/**
 * A one-time-code input built from combination-lock tumblers. Each digit rolls
 * into place, the padlock opens when the code is right, and the dials shake
 * when it's wrong. One real input underneath keeps paste and SMS autofill.
 */
export function VaultCode({
  length = 6,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onComplete,
  mask = false,
  size = "md",
  groupSize = 3,
  showLock = true,
  resetOnError = true,
  label = "Verification code",
  disabled,
  autoFocus,
  className,
}: VaultCodeProps) {
  const id = useId()
  const [internal, setInternal] = useState(defaultValue)
  const value = (valueProp ?? internal).replace(/\D/g, "").slice(0, length)
  const [status, setStatus] = useState<Status>("idle")
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const reduce = useReducedMotion()
  const [focused, setFocused] = useState(false)
  const attempt = useRef(0)
  const s = SIZES[size]

  function change(next: string) {
    const clean = next.replace(/\D/g, "").slice(0, length)
    attempt.current += 1
    if (valueProp === undefined) setInternal(clean)
    onValueChange?.(clean)
    setStatus("idle")
    if (clean.length === length) void check(clean)
  }

  async function check(code: string) {
    if (!onComplete) return
    const mine = attempt.current
    setStatus("checking")
    let ok: boolean | void
    try {
      ok = await onComplete(code)
    } catch {
      ok = false
    }
    if (mine !== attempt.current) return // typed again while we waited
    if (ok === undefined) setStatus("idle")
    else if (ok) setStatus("success")
    else {
      setStatus("error")
      if (!reduce && scope.current) void animate(scope.current, { x: [0, -10, 9, -7, 5, -2, 0] }, { duration: 0.5 })
      if (resetOnError) {
        window.setTimeout(() => {
          if (mine === attempt.current) change("")
        }, 750)
      }
    }
  }

  const active = focused && status !== "success" ? Math.min(value.length, length - 1) : -1

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="vault-code" className={cn("inline-flex items-center gap-3", className)}>
        {showLock && <Padlock open={status === "success"} status={status} />}
        <div ref={scope} className={cn("relative flex items-center", s.gap)}>
          {Array.from({ length }, (_, i) => (
            <span key={i} className={cn("flex", groupSize > 0 && i > 0 && i % groupSize === 0 && "ml-2")}>
              <Tumbler
                digit={value[i] === undefined ? null : Number(value[i])}
                active={i === active}
                mask={mask}
                status={status}
                size={s}
              />
            </span>
          ))}
          <input
            id={id}
            aria-label={label}
            aria-invalid={status === "error" || undefined}
            aria-describedby={`${id}-status`}
            value={value}
            disabled={disabled || status === "success"}
            autoFocus={autoFocus}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d*"
            maxLength={length}
            spellCheck={false}
            onChange={(e) => change(e.target.value)}
            onFocus={(e) => {
              setFocused(true)
              const end = e.currentTarget.value.length
              e.currentTarget.setSelectionRange(end, end)
            }}
            onBlur={() => setFocused(false)}
            onSelect={(e) => {
              // Keep the cursor at the end, like the dials.
              const el = e.currentTarget
              const end = el.value.length
              if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end)
            }}
            className="absolute inset-0 h-full w-full cursor-text rounded-lg bg-transparent text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
          />
          {focused && (
            <span aria-hidden className="pointer-events-none absolute -inset-1.5 rounded-xl ring-3 ring-ring/40" />
          )}
        </div>
        <span id={`${id}-status`} role="status" className="sr-only">
          {status === "checking" ? "Checking code" : status === "success" ? "Code accepted" : status === "error" ? "Wrong code, try again" : ""}
        </span>
      </div>
    </MotionConfig>
  )
}
