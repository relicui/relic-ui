"use client"

/** Playgrounds for the heatmap family: Scroll Depth, Cohort Tide, Correlation Matrix, Heat Mosaic. */

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { cohorts } from "@/registry/relic/examples/cohort-tide-demo"
import { shopLabels, shopMatrix } from "@/registry/relic/examples/correlation-matrix-demo"
import { market } from "@/registry/relic/examples/heat-mosaic-demo"
import { MockArticle, articleReach } from "@/registry/relic/examples/scroll-depth-demo"
import { CohortTide } from "@/registry/relic/ui/cohort-tide"
import { CorrelationMatrix } from "@/registry/relic/ui/correlation-matrix"
import { HeatMosaic, type MosaicItem } from "@/registry/relic/ui/heat-mosaic"
import { ScrollDepth } from "@/registry/relic/ui/scroll-depth"

/* ------------------------------ Scroll Depth ------------------------------- */

export function ScrollDepthPlayground() {
  const D = {
    palette: "heat" as "heat" | "brand" | "mono",
    opacity: 0.45,
    fold: 0.26,
    showFold: true,
    showMarkers: true,
    showGauge: true,
  }
  const [o, setO] = useState(D)
  const { showFold, showMarkers, fold, ...rest } = o
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full max-w-sm">
          <ScrollDepth reach={articleReach} {...rest} fold={showFold ? fold : undefined} markers={showMarkers ? [0.5, 0.25] : []}>
            <MockArticle />
          </ScrollDepth>
        </div>
      }
      controls={
        <>
          <OptionGroup label="palette" options={["heat", "brand", "mono"] as const} value={o.palette} onChange={(v) => setO({ ...o, palette: v })} />
          <RangeControl label="opacity" value={o.opacity} min={0.15} max={0.9} step={0.05} onChange={(v) => setO({ ...o, opacity: v })} />
          <RangeControl label="fold" value={o.fold} min={0.1} max={0.6} step={0.02} onChange={(v) => setO({ ...o, fold: v })} />
          <ToggleList>
            <Toggle label="Show fold" checked={o.showFold} onChange={(v) => setO({ ...o, showFold: v })} />
            <Toggle label="markers" checked={o.showMarkers} onChange={(v) => setO({ ...o, showMarkers: v })} />
            <Toggle label="showGauge" checked={o.showGauge} onChange={(v) => setO({ ...o, showGauge: v })} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "ScrollDepth",
        { reach: raw("reach"), ...rest, fold: showFold ? fold : undefined, markers: showMarkers ? raw("[0.5, 0.25]") : raw("[]") },
        { palette: "heat", opacity: 0.45, showGauge: true },
        "<YourPage />"
      )}
    />
  )
}

/* ------------------------------- Cohort Tide ------------------------------- */

export function CohortTidePlayground() {
  const D = {
    fill: "tide" as "tide" | "solid",
    scale: "primary" as "primary" | "brand" | "heat",
    highlight: "diagonal" as "crosshair" | "diagonal",
    showAverage: true,
    showSize: true,
    animate: true,
  }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full">
          <CohortTide key={`${o.animate}`} cohorts={cohorts} {...o} />
        </div>
      }
      controls={
        <>
          <OptionGroup label="fill" options={["tide", "solid"] as const} value={o.fill} onChange={(v) => setO({ ...o, fill: v })} />
          <OptionGroup label="scale" options={["primary", "brand", "heat"] as const} value={o.scale} onChange={(v) => setO({ ...o, scale: v })} />
          <OptionGroup label="highlight" options={["crosshair", "diagonal"] as const} value={o.highlight} onChange={(v) => setO({ ...o, highlight: v })} />
          <ToggleList>
            <Toggle label="showAverage" checked={o.showAverage} onChange={(v) => setO({ ...o, showAverage: v })} />
            <Toggle label="showSize" checked={o.showSize} onChange={(v) => setO({ ...o, showSize: v })} />
            <Toggle label="animate" checked={o.animate} onChange={(v) => setO({ ...o, animate: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("CohortTide", { cohorts: raw("cohorts"), ...o }, { ...D, highlight: "crosshair" })}
    />
  )
}

/* --------------------------- Correlation Matrix ---------------------------- */

export function CorrelationMatrixPlayground() {
  const D = {
    order: "clustered" as "original" | "clustered",
    triangle: "full" as "full" | "lower",
    shape: "square" as "square" | "circle",
    palette: "blue-red" as "blue-red" | "purple-green" | "brand",
    showValues: true,
    showLegend: true,
  }
  const [o, setO] = useState(D)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="w-full max-w-md">
          <CorrelationMatrix labels={shopLabels} values={shopMatrix} {...o} />
        </div>
      }
      controls={
        <>
          <OptionGroup label="order" options={["original", "clustered"] as const} value={o.order} onChange={(v) => setO({ ...o, order: v })} />
          <OptionGroup label="triangle" options={["full", "lower"] as const} value={o.triangle} onChange={(v) => setO({ ...o, triangle: v })} />
          <OptionGroup label="shape" options={["square", "circle"] as const} value={o.shape} onChange={(v) => setO({ ...o, shape: v })} />
          <OptionGroup label="palette" options={["blue-red", "purple-green", "brand"] as const} value={o.palette} onChange={(v) => setO({ ...o, palette: v })} />
          <ToggleList>
            <Toggle label="showValues" checked={o.showValues} onChange={(v) => setO({ ...o, showValues: v })} />
            <Toggle label="showLegend" checked={o.showLegend} onChange={(v) => setO({ ...o, showLegend: v })} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "CorrelationMatrix",
        { labels: raw("labels"), values: raw("matrix"), ...o },
        { order: "original", triangle: "full", shape: "square", palette: "blue-red", showValues: true, showLegend: true }
      )}
    />
  )
}

/* ------------------------------- Heat Mosaic ------------------------------- */

const ungrouped: MosaicItem[] = market.map((item) => ({ id: item.id, label: item.label, size: item.size, value: item.value }))

export function HeatMosaicPlayground() {
  const D = {
    palette: "green-red" as "green-red" | "blue-orange" | "brand",
    height: 320,
    gap: 2,
    zoomable: true,
    showGroupLabels: true,
    grouped: true,
  }
  const [o, setO] = useState(D)
  const [clicked, setClicked] = useState<string | null>(null)
  const { grouped, ...props } = o
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="flex w-full flex-col gap-1">
          <HeatMosaic
            items={grouped ? market : ungrouped}
            {...props}
            formatSize={(s) => `$${s}B`}
            onItemClick={(item) => setClicked(item.label)}
          />
          <p className="h-4 text-xs text-muted-foreground">{clicked ? `onItemClick: ${clicked}` : ""}</p>
        </div>
      }
      controls={
        <>
          <OptionGroup label="palette" options={["green-red", "blue-orange", "brand"] as const} value={o.palette} onChange={(v) => setO({ ...o, palette: v })} />
          <RangeControl label="height" value={o.height} min={200} max={460} step={20} onChange={(v) => setO({ ...o, height: v })} />
          <RangeControl label="gap" value={o.gap} min={0} max={6} step={1} onChange={(v) => setO({ ...o, gap: v })} />
          <ToggleList>
            <Toggle label="Use groups" checked={o.grouped} onChange={(v) => setO({ ...o, grouped: v })} />
            <Toggle label="zoomable" checked={o.zoomable} onChange={(v) => setO({ ...o, zoomable: v })} />
            <Toggle label="showGroupLabels" checked={o.showGroupLabels} onChange={(v) => setO({ ...o, showGroupLabels: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("HeatMosaic", { items: raw("items"), ...props }, { palette: "green-red", height: 360, gap: 2, zoomable: true, showGroupLabels: true })}
    />
  )
}
