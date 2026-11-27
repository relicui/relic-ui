"use client"

/**
 * Relic UI · Morse Key
 * https://relic-ui.vercel.app/docs/morse-key
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { startMorseTone, stopMorseTone } from "@/registry/relic/ui/acoustics-audio"

/** International Morse Code, as defined in ITU-R M.1677-1. */
const MORSE_TABLE: Record<string, string> = {
  ".-": "A",
  "-...": "B",
  "-.-.": "C",
  "-..": "D",
  ".": "E",
  "..-.": "F",
  "--.": "G",
  "....": "H",
  "..": "I",
  ".---": "J",
  "-.-": "K",
  ".-..": "L",
  "--": "M",
  "-.": "N",
  "---": "O",
  ".--.": "P",
  "--.-": "Q",
  ".-.": "R",
  "...": "S",
  "-": "T",
  "..-": "U",
  "...-": "V",
  ".--": "W",
  "-..-": "X",
  "-.--": "Y",
  "--..": "Z",
  "..-..": "É",
  "-----": "0",
  ".----": "1",
  "..---": "2",
  "...--": "3",
  "....-": "4",
  ".....": "5",
  "-....": "6",
  "--...": "7",
  "---..": "8",
  "----.": "9",
  // Punctuation (ITU-R M.1677-1, section 1.1.3)
  ".-.-.-": ".",
  "--..--": ",",
  "---...": ":",
  "..--..": "?",
  ".----.": "'",
  "-....-": "-",
  "-..-.": "/",
  "-.--.": "(",
  "-.--.-": ")",
  ".-..-.": '"',
  "-...-": "=",
  ".-.-.": "+",
  ".--.-.": "@",
  // Distress signal, sent as one unbroken character
  "...---...": "SOS",
}

/** ITU error signal: eight dots erase the last word. */
const ERROR_SIGNAL = "........"
/** Shown for a pattern that isn't Morse. Not "?", which is a real Morse character. */
const UNKNOWN = "*"

/*
 * Timing. In Morse a dot is 1 unit and a dash 3, so dots and dashes are told
 * apart at 2 units (dashThresholdMs). The pause between letters is 3 units and
 * between words 7. People tapping by hand need more room than a machine, so
 * the pauses use Farnsworth spacing, the standard way Morse is learned: the
 * same 3 : 7 ratio, just slower.
 */
const LETTER_GAP_MS = 520
const WORD_GAP_MS = Math.round((LETTER_GAP_MS * 7) / 3)

export interface MorseKeyProps {
  /** Sidetone oscillator frequency in Hz. */
  frequency?: number
  /** Threshold in ms distinguishing a dot from a dash. */
  dashThresholdMs?: number
  /** Silence audio output. */
  mute?: boolean
  /** Callback when decoded text updates. */
  onTextChange?: (text: string) => void
  className?: string
}

/**
 * A telegraph straight key. Hold down with pointer or Spacebar to close
 * the circuit, hear the 680Hz CW sidetone, and decode dots & dashes into text.
 */
export function MorseKey({
  frequency = 680,
  dashThresholdMs = 190,
  mute = false,
  onTextChange,
  className,
}: MorseKeyProps) {
  const [pressed, setPressed] = useState(false)
  const [currentCode, setCurrentCode] = useState("")
  const [decoded, setDecoded] = useState("")
  const [lastDuration, setLastDuration] = useState<number | null>(null)

  const pressStartRef = useRef<number>(0)
  const letterTimerRef = useRef<number | null>(null)
  const wordTimerRef = useRef<number | null>(null)
  const currentCodeRef = useRef("")
  const decodedRef = useRef("")

  const clearTimers = useCallback(() => {
    if (letterTimerRef.current !== null) {
      window.clearTimeout(letterTimerRef.current)
      letterTimerRef.current = null
    }
    if (wordTimerRef.current !== null) {
      window.clearTimeout(wordTimerRef.current)
      wordTimerRef.current = null
    }
  }, [])

  const commitLetter = useCallback(() => {
    const code = currentCodeRef.current
    if (!code) return
    const next =
      code === ERROR_SIGNAL
        ? decodedRef.current.replace(/\S+\s*$/, "")
        : (decodedRef.current + (MORSE_TABLE[code] ?? UNKNOWN)).slice(-28)
    decodedRef.current = next
    currentCodeRef.current = ""
    setCurrentCode("")
    setDecoded(next)
    onTextChange?.(next)
  }, [onTextChange])

  // Presses are timed with the events' own timestamps (when the key actually
  // went down and up), not when this code runs, so a busy moment, like the
  // audio starting on the very first press, can't turn a dot into a dash.
  const handleDown = useCallback((at: number) => {
    if (pressStartRef.current !== 0) return
    clearTimers()
    pressStartRef.current = at || performance.now()
    setPressed(true)
    if (!mute) startMorseTone(frequency)
  }, [clearTimers, frequency, mute])

  const handleUp = useCallback((at: number) => {
    if (pressStartRef.current === 0) return
    const elapsed = Math.max(0, Math.round((at || performance.now()) - pressStartRef.current))
    pressStartRef.current = 0
    setPressed(false)
    setLastDuration(elapsed)
    stopMorseTone()

    const symbol = elapsed >= dashThresholdMs ? "-" : "."
    const nextCode = currentCodeRef.current + symbol
    currentCodeRef.current = nextCode
    setCurrentCode(nextCode)

    clearTimers()
    letterTimerRef.current = window.setTimeout(() => {
      commitLetter()
      wordTimerRef.current = window.setTimeout(() => {
        if (decodedRef.current && !decodedRef.current.endsWith(" ")) {
          const spaced = (decodedRef.current + " ").slice(-28)
          decodedRef.current = spaced
          setDecoded(spaced)
          onTextChange?.(spaced)
        }
      }, WORD_GAP_MS - LETTER_GAP_MS)
    }, LETTER_GAP_MS)
  }, [clearTimers, commitLetter, dashThresholdMs, onTextChange])

  useEffect(() => {
    return () => {
      clearTimers()
      stopMorseTone()
    }
  }, [clearTimers])

  const handleClear = () => {
    clearTimers()
    currentCodeRef.current = ""
    decodedRef.current = ""
    setCurrentCode("")
    setDecoded("")
    setLastDuration(null)
    onTextChange?.("")
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="morse-key"
        className={cn(
          "relative flex w-full max-w-sm flex-col rounded-xl border border-border/60 bg-muted/20 p-4 select-none",
          className
        )}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2.5 font-mono text-xs">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span
              className={cn(
                "size-2 rounded-full transition-colors",
                pressed ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-muted-foreground/40"
              )}
            />
            <span className="font-semibold tracking-wider uppercase text-foreground">CW Telegraph</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap tabular-nums">
            <span>{frequency} Hz</span>
            {lastDuration !== null && <span>· {lastDuration}ms</span>}
          </div>
        </div>

        {/* Paper Ticker Tape Readout */}
        <div className="mb-4 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5 font-mono">
          <div className="flex items-center justify-between text-[10px] tracking-wider uppercase text-muted-foreground">
            <span>Decoded Tape</span>
            <button
              type="button"
              onClick={handleClear}
              className="rounded px-1.5 py-0.5 text-[10px] hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="mt-1 flex min-h-6 items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold tracking-widest text-foreground">
              {decoded || <span className="text-muted-foreground/60 font-normal tracking-normal">Tap key or hold Space…</span>}
            </span>
            {currentCode && (
              <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-bold tracking-widest text-primary border border-primary/30">
                {currentCode}
              </span>
            )}
          </div>
        </div>

        {/* Physical Telegraph Key, drawn on a fixed 256 × 96 px plan:
            pivot axle at (44, 40); contacts at x = 150 with an 8 px gap.
            Pressing tips the lever down around the axle by atan(8 / 106) ≈ 4.3°,
            which closes the gap exactly. */}
        <div className="relative flex flex-col items-center py-2">
          <div className="relative h-24 w-64 max-w-full shrink-0 rounded-lg border border-border/70 bg-muted/40 shadow-inner">
            {/* Base plate */}
            <div aria-hidden className="absolute top-[81px] right-3 left-3 h-3 rounded-md border border-border bg-muted-foreground/25" />

            {/* Terminal screws on the base */}
            <div aria-hidden className="absolute top-[72px] left-[16px] size-2.5 rounded-full border border-border bg-muted-foreground/50" />
            <div aria-hidden className="absolute top-[72px] left-[230px] size-2.5 rounded-full border border-border bg-muted-foreground/50" />

            {/* Pivot post (trunnion) */}
            <div aria-hidden className="absolute top-[40px] left-[38px] h-[42px] w-3 rounded-t-md border border-border bg-muted-foreground/40" />

            {/* Return spring: squeezes as the lever goes down */}
            <motion.div
              aria-hidden
              animate={{ scaleY: pressed ? 0.88 : 1 }}
              transition={{ type: "spring", stiffness: 700, damping: 28 }}
              style={{ transformOrigin: "bottom" }}
              className="absolute top-[44px] left-[96px] h-[37px] w-2 rounded-sm bg-[repeating-linear-gradient(to_bottom,var(--color-muted-foreground)_0_2px,transparent_2px_5px)] opacity-70"
            />

            {/* Lower contact (anvil) */}
            <div
              aria-hidden
              className={cn(
                "absolute top-[57px] left-[145px] h-6 w-2.5 rounded-t-sm border border-border transition-colors",
                pressed ? "bg-primary" : "bg-foreground/70"
              )}
            />

            {/* Contact glow */}
            {pressed && (
              <div
                aria-hidden
                className="pointer-events-none absolute top-[42px] left-[136px] size-7 rounded-full bg-primary/35 blur-md"
              />
            )}

            {/* Lever: turns around the axle at (44, 40), which is (8, 18) inside the button */}
            <motion.button
              type="button"
              aria-label="Telegraph straight key"
              aria-pressed={pressed}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                handleDown(e.timeStamp)
              }}
              onPointerUp={(e) => handleUp(e.timeStamp)}
              onPointerCancel={(e) => handleUp(e.timeStamp)}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault()
                  handleDown(e.timeStamp)
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault()
                  handleUp(e.timeStamp)
                }
              }}
              animate={{ rotate: pressed ? 4.3 : 0 }}
              transition={{ type: "spring", stiffness: 700, damping: 28 }}
              style={{ transformOrigin: "8px 18px" }}
              className="absolute top-[22px] left-[36px] h-[27px] w-[200px] cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* Lever beam, from the axle to under the knob */}
              <span className="absolute top-[14px] left-[4px] h-2 w-[176px] rounded-full bg-gradient-to-b from-foreground/70 to-foreground/40 shadow-xs" />
              {/* Upper contact, under the lever above the anvil */}
              <span
                className={cn(
                  "absolute top-[22px] left-[109px] h-[5px] w-2.5 rounded-b-sm border border-border transition-colors",
                  pressed ? "bg-primary" : "bg-foreground/70"
                )}
              />
              {/* Finger knob at the front */}
              <span className="absolute top-[2px] left-[160px] flex h-5 w-10 items-center justify-center rounded-full border border-border bg-foreground shadow-md">
                <span className="h-0.5 w-5 rounded-full bg-background/30" />
              </span>
            </motion.button>

            {/* Axle pin, drawn over the lever so it looks held */}
            <div aria-hidden className="pointer-events-none absolute top-[35px] left-[39px] size-2.5 rounded-full border border-border bg-foreground/80" />
          </div>
        </div>

        {/* Footer Legend */}
        <div className="mt-2.5 flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground whitespace-nowrap">
          <span>Dot &lt; {dashThresholdMs}ms · Dash ≥ {dashThresholdMs}ms</span>
          <span>Space / Click</span>
        </div>
      </div>
    </MotionConfig>
  )
}
