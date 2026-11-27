"use client"

/**
 * Self-playing gallery demos for the Files and Data components, Vault Code and
 * Crumple Trash. Like the others, they only perform inside an AutoplayFrame
 * and hand over the moment the visitor takes control.
 */

import { useRef, useState } from "react"

import { useAutoplayInterval } from "@/components/autoplay/autoplay-frame"
import { trashStart } from "@/registry/relic/examples/crumple-trash-demo"
import { projectFiles } from "@/registry/relic/examples/fold-tree-demo"
import { weekData } from "@/registry/relic/examples/week-pulse-demo"
import { CrumpleTrash } from "@/registry/relic/ui/crumple-trash"
import { FoldTree } from "@/registry/relic/ui/fold-tree"
import { PaperDrop, type PaperFile } from "@/registry/relic/ui/paper-drop"
import { VaultCode } from "@/registry/relic/ui/vault-code"
import { WeekPulse } from "@/registry/relic/ui/week-pulse"

const SHEETS = [
  { name: "contract-signed.pdf", size: 1_200_000 },
  { name: "moodboard.png", size: 3_400_000 },
  { name: "budget-2026.xlsx", size: 240_000 },
]

export function AutoPaperDrop() {
  const [files, setFiles] = useState<PaperFile[]>([])
  const tick = useRef(0)
  useAutoplayInterval(350, () => {
    tick.current += 1
    const t = tick.current
    // A new sheet every ~1.4s, then a pause, then start over.
    if (t % 4 === 1 && t < 13) {
      const sheet = SHEETS[(t - 1) / 4]
      if (sheet) setFiles((list) => [...list, { id: `${t}`, ...sheet, progress: 0, status: "uploading" }])
    }
    if (t >= 26) {
      tick.current = 0
      setFiles([])
      return
    }
    setFiles((list) =>
      list.map((f) => {
        if (f.status !== "uploading") return f
        const progress = Math.min(1, f.progress + 0.12)
        return { ...f, progress, status: progress >= 1 ? "done" : "uploading" }
      })
    )
  })
  return (
    <div className="h-80 w-full max-w-sm">
      <PaperDrop items={files} />
    </div>
  )
}

export function AutoFoldTree() {
  const path = [["app"], ["app", "docs"], ["app", "docs", "docs-slug"], ["components"], ["components", "ui"], []]
  const [step, setStep] = useState(0)
  useAutoplayInterval(1300, () => setStep((s) => (s + 1) % path.length))
  const selected = ["page", "docs-page", "slug-page", "header", "fold-tree", "readme"][step]
  // h-82 fits the deepest step: 11 rows × 28px + padding + border
  return (
    <div className="h-82 w-full max-w-xs rounded-xl border bg-background p-2">
      <FoldTree data={projectFiles} expanded={path[step]} selected={selected} />
    </div>
  )
}

/** Types into the real input the way a person would, so onComplete runs. */
function typeInto(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

export function AutoVaultCode() {
  const ref = useRef<HTMLDivElement>(null)
  const [round, setRound] = useState(0)
  const tick = useRef(0)
  // A wrong guess first (shake), then the right one (unlock), then lock again.
  const script = ["4", "48", "482", "4829", "48291", "482915", "", "", "", "1", "12", "123", "1234", "12345", "123456"]
  useAutoplayInterval(380, () => {
    const t = tick.current
    tick.current += 1
    if (t >= script.length + 8) {
      tick.current = 0
      setRound((r) => r + 1)
      return
    }
    const input = ref.current?.querySelector("input")
    if (input && t < script.length && script[t]) typeInto(input, script[t])
  })
  return (
    <div ref={ref}>
      <VaultCode key={round} onComplete={(code) => code === "123456"} />
    </div>
  )
}

export function AutoCrumpleTrash() {
  const ref = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState(trashStart.slice(0, 3))
  const tick = useRef(0)
  useAutoplayInterval(1700, () => {
    const t = tick.current % 6
    tick.current += 1
    const root = ref.current
    if (!root) return
    if (t === 0 || t === 1 || t === 3) root.querySelector<HTMLButtonElement>("li button[aria-label^='Delete']")?.click()
    if (t === 2) {
      const undo = Array.from(root.querySelectorAll("button")).find((b) => b.textContent === "Undo")
      undo?.click()
    }
    if (t === 5) setItems(trashStart.slice(0, 3))
  })
  return (
    <div ref={ref} className="h-72 w-full max-w-sm">
      <CrumpleTrash
        items={items}
        undoSeconds={3}
        onDelete={(item) => setItems((list) => list.filter((i) => i.id !== item.id))}
        onRestore={(item, index) => setItems((list) => [...list.slice(0, index), item, ...list.slice(index)])}
      />
    </div>
  )
}

export function AutoWeekPulse() {
  const ref = useRef<HTMLDivElement>(null)
  const last = useRef<Element | null>(null)
  const tick = useRef(0)
  // Walk the crosshair across the busiest times of the week.
  const tour = [
    [0, 9],
    [1, 11],
    [2, 13],
    [3, 11],
    [4, 16],
    [5, 14],
    [6, 20],
  ]
  useAutoplayInterval(1100, () => {
    const [d, h] = tour[tick.current % tour.length]
    tick.current += 1
    const cell = ref.current?.querySelectorAll("[role=gridcell]")[d * 24 + h]
    if (!cell) return
    cell.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, relatedTarget: last.current }))
    last.current = cell
  })
  return (
    <div ref={ref} className="w-full max-w-2xl pt-14">
      <WeekPulse data={weekData} />
    </div>
  )
}
