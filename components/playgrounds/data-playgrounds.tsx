"use client"

/** Playgrounds for the Files and Data components, plus Vault Code and Crumple Trash. */

import { useEffect, useRef, useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  raw,
  toJsx,
} from "@/components/docs/playground-controls"
import { trashStart } from "@/registry/relic/examples/crumple-trash-demo"
import { projectFiles } from "@/registry/relic/examples/fold-tree-demo"
import { MockPage, clicks } from "@/registry/relic/examples/hotspot-map-demo"
import { places } from "@/registry/relic/examples/visitor-map-demo"
import { weekData } from "@/registry/relic/examples/week-pulse-demo"
import { CrumpleTrash } from "@/registry/relic/ui/crumple-trash"
import { FoldTree } from "@/registry/relic/ui/fold-tree"
import { HotspotMap } from "@/registry/relic/ui/hotspot-map"
import { PaperDrop, type PaperFile } from "@/registry/relic/ui/paper-drop"
import { VaultCode } from "@/registry/relic/ui/vault-code"
import { VisitorCount } from "@/registry/relic/ui/visitor-count"
import { VisitorMap } from "@/registry/relic/ui/visitor-map"
import { WeekPulse } from "@/registry/relic/ui/week-pulse"

const small = "rounded-md border px-2.5 py-1 text-xs transition-colors hover:bg-muted"

/* -------------------------------- Paper Drop ------------------------------- */

const SAMPLES = ["invoice-march.pdf", "logo-final.svg", "notes.txt", "holiday.jpg", "budget.xlsx", "song-demo.mp3"]

/** Pretend uploads that fill over time, and sometimes fail. */
function useFakeUploads(failRate: number) {
  const [files, setFiles] = useState<PaperFile[]>([])
  const next = useRef(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setFiles((list) =>
        list.map((f) => {
          if (f.status !== "uploading") return f
          if (f.progress > 0.5 && Math.random() < failRate / 6) return { ...f, status: "error", error: "Connection lost" }
          const progress = Math.min(1, f.progress + 0.05 + Math.random() * 0.1)
          return { ...f, progress, status: progress >= 1 ? "done" : "uploading" }
        })
      )
    }, 280)
    return () => clearInterval(timer)
  }, [failRate])
  const add = (items: { name: string; size: number }[]) =>
    setFiles((list) => [...list, ...items.map((i) => ({ id: `u${next.current++}`, ...i, progress: 0, status: "uploading" as const }))])
  return { files, setFiles, add }
}

export function PaperDropPlayground() {
  const D = { layout: "list" as "list" | "pile", segments: 20, multiple: true, disabled: false, failures: false }
  const [o, setO] = useState(D)
  const { files, setFiles, add } = useFakeUploads(o.failures ? 0.5 : 0)
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setFiles([])
      }}
      preview={
        <div className="flex w-full max-w-sm flex-col gap-3">
          <PaperDrop
            items={files}
            layout={o.layout}
            segments={o.segments}
            multiple={o.multiple}
            disabled={o.disabled}
            onFiles={(picked) => add(picked.map((f) => ({ name: f.name, size: f.size })))}
            onRemove={(id) => setFiles((list) => list.filter((f) => f.id !== id))}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className={small}
              onClick={() => {
                const name = SAMPLES[Math.floor(Math.random() * SAMPLES.length)]
                add([{ name, size: Math.round(50_000 + Math.random() * 4_000_000) }])
              }}
            >
              Add a sample file
            </button>
            <button type="button" className={small} onClick={() => setFiles([])}>
              Clear
            </button>
          </div>
        </div>
      }
      controls={
        <>
          <OptionGroup label="layout" options={["list", "pile"] as const} value={o.layout} onChange={(v) => setO({ ...o, layout: v })} />
          <RangeControl label="segments" value={o.segments} min={6} max={40} step={1} onChange={(v) => setO({ ...o, segments: v })} />
          <ToggleList>
            <Toggle label="multiple" checked={o.multiple} onChange={(v) => setO({ ...o, multiple: v })} />
            <Toggle label="disabled" checked={o.disabled} onChange={(v) => setO({ ...o, disabled: v })} />
            <Toggle label="Simulate failures" checked={o.failures} onChange={(v) => setO({ ...o, failures: v })} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "PaperDrop",
        { items: raw("files"), onFiles: raw("upload"), onRemove: raw("remove"), layout: o.layout, segments: o.segments, multiple: o.multiple, disabled: o.disabled },
        { layout: "list", segments: 20, multiple: true, disabled: false }
      )}
    />
  )
}

/* -------------------------------- Fold Tree -------------------------------- */

export function FoldTreePlayground() {
  const D = { showThread: true, peek: true, peekCount: 3, showCount: true, showLines: true, indent: 16 }
  const [o, setO] = useState(D)
  const [picked, setPicked] = useState("app/docs/[slug]/page.tsx")
  const [expanded, setExpanded] = useState<string[]>(["app", "docs", "docs-slug"])
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setExpanded(["app", "docs", "docs-slug"])
      }}
      preview={
        <div className="flex w-full max-w-xs flex-col gap-2">
          <div className="rounded-xl border bg-background p-2">
            <FoldTree
              data={projectFiles}
              {...o}
              expanded={expanded}
              onExpandedChange={setExpanded}
              defaultSelected="slug-page"
              onSelect={(node) => setPicked(String(node.label))}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Selected: <span className="font-mono text-foreground">{picked}</span>
            </span>
            <span className="flex gap-2">
              <button type="button" className={small} onClick={() => setExpanded(["app", "docs", "docs-slug", "components", "ui"])}>
                Open all
              </button>
              <button type="button" className={small} onClick={() => setExpanded([])}>
                Close all
              </button>
            </span>
          </div>
        </div>
      }
      controls={
        <>
          <RangeControl label="indent" value={o.indent} min={8} max={28} step={2} onChange={(v) => setO({ ...o, indent: v })} />
          <RangeControl label="peekCount" value={o.peekCount} min={1} max={5} step={1} onChange={(v) => setO({ ...o, peekCount: v })} />
          <ToggleList>
            <Toggle label="showThread" checked={o.showThread} onChange={(v) => setO({ ...o, showThread: v })} />
            <Toggle label="peek" checked={o.peek} onChange={(v) => setO({ ...o, peek: v })} />
            <Toggle label="showCount" checked={o.showCount} onChange={(v) => setO({ ...o, showCount: v })} />
            <Toggle label="showLines" checked={o.showLines} onChange={(v) => setO({ ...o, showLines: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("FoldTree", { data: raw("files"), expanded: raw("open"), onExpandedChange: raw("setOpen"), ...o }, D)}
    />
  )
}

/* -------------------------------- Vault Code ------------------------------- */

export function VaultCodePlayground() {
  const D = {
    length: 6,
    size: "md" as "sm" | "md" | "lg",
    groupSize: 3,
    mask: false,
    showLock: true,
    resetOnError: true,
  }
  const [o, setO] = useState(D)
  const [round, setRound] = useState(0)
  const answer = "1234567890".slice(0, o.length)
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setRound((r) => r + 1)
      }}
      preview={
        <div className="flex flex-col items-center gap-3">
          <VaultCode
            key={`${o.length}-${round}`}
            {...o}
            onComplete={async (code) => {
              await new Promise((r) => setTimeout(r, 450))
              return code === answer
            }}
          />
          <p className="text-xs text-muted-foreground">
            The right code is <span className="font-mono text-foreground">{answer}</span>
            <button type="button" className={`${small} ml-2`} onClick={() => setRound((r) => r + 1)}>
              Lock again
            </button>
          </p>
        </div>
      }
      controls={
        <>
          <RangeControl label="length" value={o.length} min={4} max={8} step={1} onChange={(v) => setO({ ...o, length: v })} />
          <RangeControl label="groupSize" value={o.groupSize} min={0} max={4} step={1} onChange={(v) => setO({ ...o, groupSize: v })} />
          <OptionGroup label="size" options={["sm", "md", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <ToggleList>
            <Toggle label="mask" checked={o.mask} onChange={(v) => setO({ ...o, mask: v })} />
            <Toggle label="showLock" checked={o.showLock} onChange={(v) => setO({ ...o, showLock: v })} />
            <Toggle label="resetOnError" checked={o.resetOnError} onChange={(v) => setO({ ...o, resetOnError: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("VaultCode", { onComplete: raw("verify"), ...o }, D)}
    />
  )
}

/* ------------------------------ Crumple Trash ------------------------------ */

export function CrumpleTrashPlayground() {
  const D = { undoSeconds: 5, binPosition: "right" as "right" | "left", showCount: true, arc: 60, speed: 1 }
  const [o, setO] = useState(D)
  const [items, setItems] = useState(trashStart)
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setItems(trashStart)
      }}
      preview={
        <div className="flex w-full max-w-sm flex-col gap-2">
          <CrumpleTrash
            items={items}
            {...o}
            onDelete={(item) => setItems((list) => list.filter((i) => i.id !== item.id))}
            onRestore={(item, index) => setItems((list) => [...list.slice(0, index), item, ...list.slice(index)])}
          />
          <button type="button" className={`${small} self-start`} onClick={() => setItems(trashStart)}>
            Bring everything back
          </button>
        </div>
      }
      controls={
        <>
          <RangeControl label="undoSeconds" value={o.undoSeconds} min={0} max={10} step={1} onChange={(v) => setO({ ...o, undoSeconds: v })} />
          <RangeControl label="arc" value={o.arc} min={0} max={140} step={10} onChange={(v) => setO({ ...o, arc: v })} />
          <RangeControl label="speed" value={o.speed} min={0.5} max={2} step={0.1} onChange={(v) => setO({ ...o, speed: v })} />
          <OptionGroup label="binPosition" options={["right", "left"] as const} value={o.binPosition} onChange={(v) => setO({ ...o, binPosition: v })} />
          <ToggleList>
            <Toggle label="showCount" checked={o.showCount} onChange={(v) => setO({ ...o, showCount: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("CrumpleTrash", { items: raw("items"), onDelete: raw("remove"), onRestore: raw("restore"), ...o }, D)}
    />
  )
}

/* ------------------------------- Week Pulse -------------------------------- */

export function WeekPulsePlayground() {
  const D = {
    scale: "primary" as "primary" | "heat" | "brand",
    shape: "square" as "square" | "circle",
    gap: 3,
    highlightTop: 3,
    hourFormat: "24h" as "24h" | "12h",
    showTotals: true,
    showLegend: true,
    animate: true,
  }
  const [o, setO] = useState(D)
  const [clicked, setClicked] = useState<string | null>(null)
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="flex w-full flex-col gap-2 pt-12">
          <WeekPulse
            key={`${o.animate}`}
            data={weekData}
            {...o}
            onCellClick={({ day, hour, value }) => setClicked(`Day ${day + 1}, hour ${hour}: ${value} visits`)}
          />
          <p className="h-4 text-xs text-muted-foreground">{clicked ?? "Click a cell (or press Enter on one)"}</p>
        </div>
      }
      controls={
        <>
          <OptionGroup label="scale" options={["primary", "heat", "brand"] as const} value={o.scale} onChange={(v) => setO({ ...o, scale: v })} />
          <OptionGroup label="shape" options={["square", "circle"] as const} value={o.shape} onChange={(v) => setO({ ...o, shape: v })} />
          <OptionGroup label="hourFormat" options={["24h", "12h"] as const} value={o.hourFormat} onChange={(v) => setO({ ...o, hourFormat: v })} />
          <RangeControl label="gap" value={o.gap} min={0} max={6} step={1} onChange={(v) => setO({ ...o, gap: v })} />
          <RangeControl label="highlightTop" value={o.highlightTop} min={0} max={10} step={1} onChange={(v) => setO({ ...o, highlightTop: v })} />
          <ToggleList>
            <Toggle label="showTotals" checked={o.showTotals} onChange={(v) => setO({ ...o, showTotals: v })} />
            <Toggle label="showLegend" checked={o.showLegend} onChange={(v) => setO({ ...o, showLegend: v })} />
            <Toggle label="animate" checked={o.animate} onChange={(v) => setO({ ...o, animate: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("WeekPulse", { data: raw("visitsByHour"), ...o }, D)}
    />
  )
}

/* ------------------------------- Hotspot Map ------------------------------- */

export function HotspotMapPlayground() {
  const D = {
    palette: "heat" as "heat" | "brand" | "mono",
    radius: 28,
    intensity: 0.35,
    opacity: 0.75,
    replay: true,
    replayDuration: 6,
    loop: true,
    showPoints: false,
    showLegend: true,
    track: false,
  }
  const [o, setO] = useState(D)
  const [hidden, setHidden] = useState(false)
  return (
    <PlaygroundShell
      onReset={() => {
        setO(D)
        setHidden(false)
      }}
      preview={
        <div className="flex w-full max-w-md flex-col gap-2">
          <HotspotMap key={`${o.replay}`} points={clicks} {...o} hidden={hidden}>
            <MockPage />
          </HotspotMap>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button type="button" className={small} onClick={() => setHidden(!hidden)}>
              {hidden ? "Show heat" : "Hide heat"}
            </button>
            {o.track && <span>Click the page to add heat</span>}
          </div>
        </div>
      }
      controls={
        <>
          <OptionGroup label="palette" options={["heat", "brand", "mono"] as const} value={o.palette} onChange={(v) => setO({ ...o, palette: v })} />
          <RangeControl label="radius" value={o.radius} min={10} max={60} step={2} onChange={(v) => setO({ ...o, radius: v })} />
          <RangeControl label="intensity" value={o.intensity} min={0.1} max={1} step={0.05} onChange={(v) => setO({ ...o, intensity: v })} />
          <RangeControl label="opacity" value={o.opacity} min={0.2} max={1} step={0.05} onChange={(v) => setO({ ...o, opacity: v })} />
          <RangeControl label="replayDuration" value={o.replayDuration} min={2} max={12} step={1} onChange={(v) => setO({ ...o, replayDuration: v })} />
          <ToggleList>
            <Toggle label="replay" checked={o.replay} onChange={(v) => setO({ ...o, replay: v })} />
            <Toggle label="loop" checked={o.loop} onChange={(v) => setO({ ...o, loop: v })} />
            <Toggle label="track" checked={o.track} onChange={(v) => setO({ ...o, track: v })} />
            <Toggle label="showPoints" checked={o.showPoints} onChange={(v) => setO({ ...o, showPoints: v })} />
            <Toggle label="showLegend" checked={o.showLegend} onChange={(v) => setO({ ...o, showLegend: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("HotspotMap", { points: raw("clicks"), ...o }, { ...D, replay: false }, "<YourPage />")}
    />
  )
}

/* ------------------------------ Visitor Count ------------------------------ */

export function VisitorCountPlayground() {
  const D = {
    size: "md" as "sm" | "md" | "lg",
    live: true,
    heartbeat: true,
    showDelta: true,
    showArrivals: true,
    showSparkline: true,
    compact: false,
  }
  const [o, setO] = useState(D)
  const [history, setHistory] = useState([180, 204, 198, 221, 240, 236, 252, 268])
  useEffect(() => {
    const timer = setInterval(() => {
      setHistory((h) => [...h.slice(-23), Math.max(20, h[h.length - 1] + Math.round((Math.random() - 0.45) * 16))])
    }, 2000)
    return () => clearInterval(timer)
  }, [])
  const bump = (n: number) => setHistory((h) => [...h.slice(-23), Math.max(0, h[h.length - 1] + n)])
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="flex w-full max-w-xs flex-col gap-4 pt-8">
          <VisitorCount value={history[history.length - 1]} history={history} {...o} />
          <div className="flex gap-2">
            <button type="button" className={small} onClick={() => bump(5)}>
              +5 arrive
            </button>
            <button type="button" className={small} onClick={() => bump(1200)}>
              Go viral
            </button>
            <button type="button" className={small} onClick={() => bump(-30)}>
              −30 leave
            </button>
          </div>
        </div>
      }
      controls={
        <>
          <OptionGroup label="size" options={["sm", "md", "lg"] as const} value={o.size} onChange={(v) => setO({ ...o, size: v })} />
          <ToggleList>
            <Toggle label="live" checked={o.live} onChange={(v) => setO({ ...o, live: v })} />
            <Toggle label="heartbeat" checked={o.heartbeat} onChange={(v) => setO({ ...o, heartbeat: v })} />
            <Toggle label="showDelta" checked={o.showDelta} onChange={(v) => setO({ ...o, showDelta: v })} />
            <Toggle label="showArrivals" checked={o.showArrivals} onChange={(v) => setO({ ...o, showArrivals: v })} />
            <Toggle label="showSparkline" checked={o.showSparkline} onChange={(v) => setO({ ...o, showSparkline: v })} />
            <Toggle label="compact" checked={o.compact} onChange={(v) => setO({ ...o, compact: v })} />
          </ToggleList>
        </>
      }
      code={toJsx("VisitorCount", { value: raw("online"), history: raw("lastHour"), ...o }, D)}
    />
  )
}

/* ------------------------------- Visitor Map ------------------------------- */

const HOME = { lat: 50.11, lng: 8.68, label: "Frankfurt" }

export function VisitorMapPlayground() {
  const D = {
    color: "brand" as "brand" | "primary" | "emerald",
    dotSize: 0.55,
    autoCycle: 2.5,
    showArcs: true,
    showPings: true,
    withHome: true,
  }
  const [o, setO] = useState(D)
  const [clicked, setClicked] = useState<string | null>(null)
  const { withHome, ...props } = o
  return (
    <PlaygroundShell
      onReset={() => setO(D)}
      preview={
        <div className="flex w-full flex-col gap-2 pt-10">
          <VisitorMap points={places} home={withHome ? HOME : undefined} {...props} onPointClick={(p) => setClicked(p.label ?? null)} />
          <p className="h-4 text-xs text-muted-foreground">{clicked ? `Clicked ${clicked}` : "Hover, tab to or click a place"}</p>
        </div>
      }
      controls={
        <>
          <OptionGroup label="color" options={["brand", "primary", "emerald"] as const} value={o.color} onChange={(v) => setO({ ...o, color: v })} />
          <RangeControl label="dotSize" value={o.dotSize} min={0.3} max={1} step={0.05} onChange={(v) => setO({ ...o, dotSize: v })} />
          <RangeControl label="autoCycle" value={o.autoCycle} min={0} max={5} step={0.5} onChange={(v) => setO({ ...o, autoCycle: v })} />
          <ToggleList>
            <Toggle label="home" checked={o.withHome} onChange={(v) => setO({ ...o, withHome: v })} />
            <Toggle label="showArcs" checked={o.showArcs} onChange={(v) => setO({ ...o, showArcs: v })} />
            <Toggle label="showPings" checked={o.showPings} onChange={(v) => setO({ ...o, showPings: v })} />
          </ToggleList>
        </>
      }
      code={toJsx(
        "VisitorMap",
        { points: raw("visitors"), home: withHome ? raw("server") : undefined, ...props },
        { color: "brand", dotSize: 0.55, autoCycle: 0, showArcs: true, showPings: true }
      )}
    />
  )
}
