"use client"

/**
 * Relic UI · Paper Drop
 * https://relic-ui.vercel.app/docs/paper-drop
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useId, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type PaperFile = {
  id: string
  name: string
  /** Size in bytes. */
  size: number
  /** Upload progress from 0 to 1. */
  progress: number
  status: "uploading" | "done" | "error"
  /** Shown when status is "error". */
  error?: string
}

export interface PaperDropProps {
  /** The files to show, with their progress (you run the upload). */
  items: PaperFile[]
  /** Called with files that were dropped or picked. */
  onFiles?: (files: File[]) => void
  /** Called when a file's remove button is pressed. */
  onRemove?: (id: string) => void
  /** File types to accept, like the input's accept attribute, e.g. "image/*,.pdf". */
  accept?: string
  multiple?: boolean
  disabled?: boolean
  /** Sheets in a tidy list, or overlapping like a pile of paper. */
  layout?: "list" | "pile"
  /** Number of dashes in each sheet's progress line. */
  segments?: number
  /** Main text in the drop zone. */
  title?: string
  /** Smaller text under the title. */
  hint?: string
  className?: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const extension = (name: string) => (name.split(".").pop() ?? "").slice(0, 4).toUpperCase()

/** A tilt for each sheet that stays the same between renders. */
const tiltOf = (id: string) => ((Array.from(id).reduce((n, c) => n + c.charCodeAt(0), 0) % 7) - 3) * 1.2

/**
 * A file drop zone where every file becomes a sheet of paper. Sheets fly in
 * and land, fill a little tear line as they upload, and get a check when done.
 */
export function PaperDrop({
  items,
  onFiles,
  onRemove,
  accept,
  multiple = true,
  disabled,
  layout = "list",
  segments = 20,
  title = "Drop files here",
  hint = "or click to browse",
  className,
}: PaperDropProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const depth = useRef(0)
  const [over, setOver] = useState(false)

  function take(list: FileList | null) {
    if (!list || disabled) return
    const files = Array.from(list)
    if (files.length) onFiles?.(multiple ? files : files.slice(0, 1))
  }

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="paper-drop" className={cn("flex w-full flex-col gap-3", className)}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault()
            depth.current += 1
            setOver(true)
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => {
            depth.current -= 1
            if (depth.current <= 0) setOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            depth.current = 0
            setOver(false)
            take(e.dataTransfer.files)
          }}
          aria-describedby={`${id}-hint`}
          className={cn(
            "group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors outline-none",
            "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
            over ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30 hover:bg-muted/30"
          )}
        >
          {/* A little sheet that lifts when a file hovers over the zone. */}
          <motion.span
            aria-hidden
            animate={over ? { y: -8, rotate: -6, scale: 1.08 } : { y: 0, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="relative block h-11 w-9 rounded-[5px] border bg-background shadow-sm"
          >
            <span className="absolute top-0 right-0 size-3 rounded-bl-[4px] border-b border-l bg-muted" />
            <span className="absolute top-4 left-2 h-px w-4 bg-muted-foreground/40" />
            <span className="absolute top-6 left-2 h-px w-5 bg-muted-foreground/40" />
            <span className="absolute top-8 left-2 h-px w-3 bg-muted-foreground/40" />
          </motion.span>
          <span className="text-sm font-medium">{over ? "Let go to drop" : title}</span>
          <span id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            take(e.target.files)
            e.target.value = ""
          }}
        />

        <ul className={cn("flex flex-col", layout === "list" ? "gap-2" : "-space-y-7 pt-2")} aria-label="Files">
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const filled = Math.round(Math.min(Math.max(item.progress, 0), 1) * segments)
              const tilt = layout === "pile" ? tiltOf(item.id) : 0
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -40, rotate: tilt * 3 - 8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
                  exit={{ opacity: 0, x: 40, rotate: 8, transition: { duration: 0.25 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  style={{ zIndex: i }}
                  className="relative flex items-center gap-3 rounded-xl border bg-background p-3 shadow-sm"
                >
                  <span className="relative flex h-10 w-8 shrink-0 items-end justify-center rounded-[4px] border bg-muted/50 pb-1 font-mono text-[8px] font-semibold text-muted-foreground">
                    <span aria-hidden className="absolute top-0 right-0 size-2.5 rounded-bl-[3px] border-b border-l bg-background" />
                    {extension(item.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">{item.name}</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {item.status === "uploading" ? `${Math.round(item.progress * 100)}%` : formatSize(item.size)}
                      </span>
                    </span>
                    {item.status === "error" ? (
                      <span className="mt-1.5 block text-xs text-destructive">{item.error ?? "Upload failed"}</span>
                    ) : (
                      <span
                        role="progressbar"
                        aria-label={`Uploading ${item.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(item.progress * 100)}
                        className="mt-2 flex gap-[2px]"
                      >
                        {Array.from({ length: segments }, (_, s) => (
                          <span
                            key={s}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors duration-300",
                              s < filled ? (item.status === "done" ? "bg-primary" : "bg-primary/70") : "bg-muted"
                            )}
                          />
                        ))}
                      </span>
                    )}
                  </span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {item.status === "done" ? (
                      <motion.span
                        key="done"
                        aria-label="Uploaded"
                        initial={{ scale: 0, rotate: -40 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                          <path d="M3.5 8.5l3 3 6-6.5" />
                        </svg>
                      </motion.span>
                    ) : onRemove ? (
                      <motion.button
                        key="remove"
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => onRemove(item.id)}
                        className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-3.5">
                          <path d="M4 4l8 8M12 4l-8 8" />
                        </svg>
                      </motion.button>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </div>
    </MotionConfig>
  )
}
