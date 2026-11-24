"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * A horizontal scroller for rows that don't fit: arrow buttons and fading
 * edges appear only on the side with more to see, the mouse wheel and a drag
 * move it sideways, and the selected item glides to the middle.
 */
export function ScrollRail({
  children,
  className,
  watch,
  activeSelector = "[aria-selected=true]",
}: {
  children: React.ReactNode
  className?: string
  /** When this changes, the active item is scrolled to the middle. */
  watch?: unknown
  activeSelector?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  const drag = useRef({ down: false, moved: false, x: 0, scroll: 0, id: -1 })
  const reduce = useReducedMotion()

  // Track whether there's more to see on either side.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setEdges({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    el.addEventListener("scroll", update, { passive: true })

    // A normal mouse wheel scrolls the row sideways while it can move,
    // then hands back to the page at either end.
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0
      const atEnd = el.scrollLeft >= max - 1 && e.deltaY > 0
      if (atStart || atEnd) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener("wheel", wheel, { passive: false })
    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", update)
      el.removeEventListener("wheel", wheel)
    }
  }, [])

  // Glide the selected item to the middle.
  useEffect(() => {
    const el = ref.current
    const active = el?.querySelector<HTMLElement>(activeSelector)
    if (!el || !active) return
    const a = active.getBoundingClientRect()
    const b = el.getBoundingClientRect()
    const left = el.scrollLeft + (a.left - b.left) - (b.width - a.width) / 2
    el.scrollTo({ left, behavior: reduce ? "auto" : "smooth" })
  }, [watch, activeSelector, reduce])

  function nudge(direction: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: reduce ? "auto" : "smooth" })
  }

  const fade = 56
  const mask = `linear-gradient(to right, ${edges.left ? "transparent" : "black"} 0, black ${edges.left ? fade : 0}px, black calc(100% - ${
    edges.right ? fade : 0
  }px), ${edges.right ? "transparent" : "black"} 100%)`

  return (
    <div className={cn("group/rail relative", className)}>
      <div
        ref={ref}
        data-lenis-prevent
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return
          drag.current = { down: true, moved: false, x: e.clientX, scroll: e.currentTarget.scrollLeft, id: e.pointerId }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d.down) return
          const dx = e.clientX - d.x
          if (!d.moved && Math.abs(dx) > 6) {
            d.moved = true
            try {
              e.currentTarget.setPointerCapture(d.id)
            } catch {
              // The pointer may already be gone; dragging still works without capture.
            }
          }
          if (d.moved) e.currentTarget.scrollLeft = d.scroll - dx
        }}
        onPointerUp={() => {
          drag.current.down = false
        }}
        onPointerCancel={() => {
          drag.current.down = false
          drag.current.moved = false
        }}
        onClickCapture={(e) => {
          // A drag shouldn't also pick the tab it ended on.
          if (drag.current.moved) {
            e.preventDefault()
            e.stopPropagation()
            drag.current.moved = false
          }
        }}
      >
        <div className="w-max min-w-full px-4">{children}</div>
      </div>

      {(["left", "right"] as const).map((side) => (
        <button
          key={side}
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => nudge(side === "left" ? -1 : 1)}
          className={cn(
            "absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-[opacity,transform,color] duration-200 hover:text-foreground",
            side === "left" ? "left-1" : "right-1",
            edges[side] ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
          )}
        >
          {side === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      ))}
    </div>
  )
}
