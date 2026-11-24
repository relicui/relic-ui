"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const AutoplayContext = createContext(false)

/** True while the surrounding AutoplayFrame wants its demo to perform. */
export function useAutoplay() {
  return useContext(AutoplayContext)
}

/**
 * Runs `callback` every `ms` milliseconds while autoplay is active.
 * The callback can change between renders; the latest one is used.
 */
export function useAutoplayInterval(ms: number, callback: () => void) {
  const active = useAutoplay()
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  })

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => saved.current(), ms)
    return () => clearInterval(id)
  }, [active, ms])

  return active
}

/**
 * Wraps a demo so it performs by itself: only while on screen, paused while
 * the pointer hovers it, and stopped for good once the visitor really clicks,
 * taps or types inside it. Nothing plays for people who prefer reduced motion.
 */
export function AutoplayFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [engaged, setEngaged] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Only real input counts. The demos' own simulated events are untrusted,
  // so they don't stop the performance.
  function engage(e: React.SyntheticEvent) {
    if (e.nativeEvent.isTrusted) setEngaged(true)
  }

  const active = visible && !hovered && !engaged && !reduceMotion

  return (
    <div
      ref={ref}
      data-autoplay={active ? "playing" : "idle"}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={engage}
      onKeyDown={engage}
      className={cn("flex w-full min-w-0 justify-center [&>*]:max-w-full [&>*]:min-w-0", className)}
    >
      <AutoplayContext.Provider value={active}>{children}</AutoplayContext.Provider>
    </div>
  )
}
