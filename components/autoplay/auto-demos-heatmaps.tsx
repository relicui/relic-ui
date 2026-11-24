"use client"

/**
 * Self-playing gallery demos for the heatmap family. Like the others, they only
 * perform inside an AutoplayFrame and hand over when the visitor takes control.
 */

import { useRef, useState } from "react"

import { useAutoplayInterval } from "@/components/autoplay/autoplay-frame"
import { cohorts } from "@/registry/relic/examples/cohort-tide-demo"
import { shopLabels, shopMatrix } from "@/registry/relic/examples/correlation-matrix-demo"
import { market } from "@/registry/relic/examples/heat-mosaic-demo"
import { MockArticle, articleReach } from "@/registry/relic/examples/scroll-depth-demo"
import { CohortTide } from "@/registry/relic/ui/cohort-tide"
import { CorrelationMatrix } from "@/registry/relic/ui/correlation-matrix"
import { HeatMosaic } from "@/registry/relic/ui/heat-mosaic"
import { ScrollDepth } from "@/registry/relic/ui/scroll-depth"

function key(el: Element | null | undefined, k: string) {
  el?.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }))
}

function hoverOver(el: Element | null | undefined, from: Element | null) {
  el?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, relatedTarget: from }))
}

export function AutoScrollDepth() {
  const ref = useRef<HTMLDivElement>(null)
  const tick = useRef(0)
  // The probe walks down the page, then jumps back to the top.
  useAutoplayInterval(450, () => {
    const slider = ref.current?.querySelector("[role=slider]")
    tick.current = (tick.current + 1) % 22
    key(slider, tick.current === 0 ? "Home" : "ArrowDown")
  })
  return (
    <div ref={ref} className="w-full max-w-sm">
      <ScrollDepth reach={articleReach} fold={0.26} markers={[0.5]} animate={false}>
        <MockArticle />
      </ScrollDepth>
    </div>
  )
}

export function AutoCohortTide() {
  const ref = useRef<HTMLDivElement>(null)
  const last = useRef<Element | null>(null)
  const tick = useRef(0)
  // Trace the bad calendar week down its diagonal.
  const path = [
    [0, 5],
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
    [2, 1],
    [0, 2],
  ]
  useAutoplayInterval(1000, () => {
    const [r, c] = path[tick.current % path.length]
    tick.current += 1
    const periods = cohorts[0].values.length
    const cell = ref.current?.querySelectorAll("[role=row] [role=gridcell]")[r * periods + c]
    if (!cell) return
    hoverOver(cell, last.current)
    last.current = cell
  })
  return (
    <div ref={ref} className="w-full max-w-2xl">
      <CohortTide cohorts={cohorts.slice(0, 6)} highlight="diagonal" showSize={false} showAverage={false} animate={false} />
    </div>
  )
}

export function AutoCorrelationMatrix() {
  const [clustered, setClustered] = useState(false)
  useAutoplayInterval(2800, () => setClustered((c) => !c))
  return (
    <div className="w-full max-w-sm">
      <CorrelationMatrix labels={shopLabels} values={shopMatrix} order={clustered ? "clustered" : "original"} showLegend={false} />
    </div>
  )
}

export function AutoHeatMosaic() {
  const ref = useRef<HTMLDivElement>(null)
  const tick = useRef(0)
  // Zoom into a group, look around, zoom out, pick another.
  const groups = ["nmb", "sol", "bsk"]
  useAutoplayInterval(2200, () => {
    const root = ref.current
    if (!root) return
    const t = tick.current
    tick.current += 1
    if (t % 2 === 0) {
      const id = groups[(t / 2) % groups.length]
      const index = market.findIndex((m) => m.id === id)
      root.querySelectorAll<HTMLButtonElement>("[role=listitem] button")[index]?.click()
    } else {
      Array.from(root.querySelectorAll<HTMLButtonElement>("nav button")).find((b) => b.textContent === "All")?.click()
    }
  })
  return (
    <div ref={ref} className="w-full max-w-2xl">
      <HeatMosaic items={market} height={280} formatSize={(s) => `$${s}B`} />
    </div>
  )
}
