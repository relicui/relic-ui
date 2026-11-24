"use client"

/**
 * Relic UI · Fold Tree
 * https://relic-ui.vercel.app/docs/fold-tree
 *
 * Copyright (c) 2026 Shubham Tambe
 * Open source under the MIT License: https://relic-ui.vercel.app/license
 */

import { useMemo, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type TreeNode = {
  id: string
  label: React.ReactNode
  /** Folders have children (an empty array is an empty folder). */
  children?: TreeNode[]
  /** A custom icon instead of the folder/file icon. */
  icon?: React.ReactNode
}

export interface FoldTreeProps {
  data: TreeNode[]
  /** Open folders (controlled). */
  expanded?: string[]
  /** Open folders at first (uncontrolled). */
  defaultExpanded?: string[]
  onExpandedChange?: (expanded: string[]) => void
  /** The selected item (controlled). */
  selected?: string | null
  /** The selected item at first (uncontrolled). */
  defaultSelected?: string | null
  onSelect?: (node: TreeNode) => void
  /** A gold thread drawn from the root to the selected item. */
  showThread?: boolean
  /** Slide a closed folder's first items out like paper slips on hover or focus. */
  peek?: boolean
  /** How many slips a peek shows. */
  peekCount?: number
  /** Show how many items each folder holds. */
  showCount?: boolean
  /** Draw guide lines down the side of open folders. */
  showLines?: boolean
  /** Pixels of indent per level. */
  indent?: number
  /** Accessible name of the tree. */
  label?: string
  className?: string
}

type Flat = { node: TreeNode; level: number; parent: string | null }

const ROW = 28 // row height in pixels

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" className="size-4 shrink-0">
      {open ? (
        <path d="M1.5 4.5V12.5a1 1 0 0 0 1 1h9.6a1 1 0 0 0 .95-.7l1.9-5.3a.6.6 0 0 0-.57-.8H4.2a1 1 0 0 0-.94.66L1.5 12M1.5 4.5a1 1 0 0 1 1-1h3l1.5 1.5h4.5a1 1 0 0 1 1 1V6.7" />
      ) : (
        <path d="M1.5 4.5a1 1 0 0 1 1-1h3l1.5 1.5h6.5a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z" />
      )}
    </svg>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" className="size-4 shrink-0">
      <path d="M4 1.5h5.5L13 5v8.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM9.5 1.5V5H13" />
    </svg>
  )
}

const text = (label: React.ReactNode) => (typeof label === "string" || typeof label === "number" ? String(label) : "")

/**
 * A file tree whose folders unfold like paper. A gold thread always leads from
 * the root to what's selected, closed folders let their first files peek out
 * like slips of paper, and it has the full keyboard behaviour of a real tree.
 */
export function FoldTree({
  data,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  selected: selectedProp,
  defaultSelected = null,
  onSelect,
  showThread = true,
  peek = true,
  peekCount = 3,
  showCount = true,
  showLines = true,
  indent = 16,
  label = "Files",
  className,
}: FoldTreeProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const expanded = expandedProp ?? internalExpanded
  const [internalSelected, setInternalSelected] = useState(defaultSelected)
  const selected = selectedProp === undefined ? internalSelected : selectedProp
  const [focused, setFocused] = useState<string | null>(null)
  const [peeking, setPeeking] = useState<string | null>(null)
  const rows = useRef(new Map<string, HTMLElement>())
  const typed = useRef({ text: "", at: 0 })

  // Everything that's currently visible, in order (for keyboard movement).
  const visible = useMemo(() => {
    const list: Flat[] = []
    const walk = (nodes: TreeNode[], level: number, parent: string | null) => {
      for (const node of nodes) {
        list.push({ node, level, parent })
        if (node.children && expanded.includes(node.id)) walk(node.children, level + 1, node.id)
      }
    }
    walk(data, 1, null)
    return list
  }, [data, expanded])

  // The path from the root to the selected item, for the gold thread.
  const path = useMemo(() => {
    if (!selected) return [] as string[]
    const find = (nodes: TreeNode[], trail: string[]): string[] | null => {
      for (const node of nodes) {
        const here = [...trail, node.id]
        if (node.id === selected) return here
        if (node.children) {
          const deeper = find(node.children, here)
          if (deeper) return deeper
        }
      }
      return null
    }
    return find(data, []) ?? []
  }, [data, selected])

  const current = focused ?? selected ?? visible[0]?.node.id ?? null

  function setExpanded(next: string[]) {
    if (expandedProp === undefined) setInternalExpanded(next)
    onExpandedChange?.(next)
  }
  function toggle(id: string, open?: boolean) {
    const isOpen = expanded.includes(id)
    const want = open ?? !isOpen
    if (want === isOpen) return
    setPeeking(null)
    setExpanded(want ? [...expanded, id] : expanded.filter((e) => e !== id))
  }
  function select(node: TreeNode) {
    if (selectedProp === undefined) setInternalSelected(node.id)
    onSelect?.(node)
  }
  function focus(id: string) {
    setFocused(id)
    rows.current.get(id)?.focus()
  }

  function handleKey(e: React.KeyboardEvent, flat: Flat, index: number) {
    const { node } = flat
    const isFolder = !!node.children
    const open = expanded.includes(node.id)
    let handled = true
    if (e.key === "ArrowDown") {
      if (visible[index + 1]) focus(visible[index + 1].node.id)
    } else if (e.key === "ArrowUp") {
      if (visible[index - 1]) focus(visible[index - 1].node.id)
    } else if (e.key === "ArrowRight") {
      if (isFolder && !open) toggle(node.id, true)
      else if (isFolder && node.children?.[0]) focus(node.children[0].id)
    } else if (e.key === "ArrowLeft") {
      if (isFolder && open) toggle(node.id, false)
      else if (flat.parent) focus(flat.parent)
    } else if (e.key === "Home") {
      if (visible[0]) focus(visible[0].node.id)
    } else if (e.key === "End") {
      const last = visible[visible.length - 1]
      if (last) focus(last.node.id)
    } else if (e.key === "Enter" || e.key === " ") {
      select(node)
      if (isFolder) toggle(node.id)
    } else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // Type-ahead: jump to the next item whose name starts with what was typed.
      const now = e.timeStamp
      typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : "") + e.key.toLowerCase(), at: now }
      const q = typed.current.text
      const order = [...visible.slice(index + (q.length === 1 ? 1 : 0)), ...visible.slice(0, index + 1)]
      const hit = order.find((v) => text(v.node.label).toLowerCase().startsWith(q))
      if (hit) focus(hit.node.id)
    } else handled = false
    if (handled) e.preventDefault()
  }

  function renderLevel(nodes: TreeNode[], level: number, parent: string | null) {
    // Where the gold thread runs in this group, if it passes through it.
    const depth = parent ? path.indexOf(parent) : -1
    const threadTo = depth >= 0 ? nodes.findIndex((n) => n.id === path[depth + 1]) : -1
    const lineX = 12 + (level - 2) * indent

    return nodes.map((node, i) => {
      const isFolder = !!node.children
      const open = isFolder && expanded.includes(node.id)
      const index = visible.findIndex((v) => v.node.id === node.id)
      const flat: Flat = { node, level, parent }
      const onPath = path.includes(node.id)
      const isSelected = selected === node.id
      const count = node.children?.length ?? 0
      const showPeek = peek && isFolder && !open && count > 0 && peeking === node.id
      return (
        <li
          key={node.id}
          role="treeitem"
          aria-level={level}
          aria-expanded={isFolder ? open : undefined}
          aria-selected={isSelected}
          tabIndex={current === node.id ? 0 : -1}
          ref={(el) => {
            if (el) rows.current.set(node.id, el)
            else rows.current.delete(node.id)
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            handleKey(e, flat, index)
          }}
          onFocus={(e) => {
            e.stopPropagation()
            setFocused(node.id)
            if (e.currentTarget.matches(":focus-visible")) setPeeking(node.id)
          }}
          onBlur={(e) => {
            e.stopPropagation()
            setPeeking((p) => (p === node.id ? null : p))
          }}
          className="relative outline-none [&:focus-visible>div]:ring-2 [&:focus-visible>div]:ring-ring/50"
        >
          {/* The gold thread: down past earlier siblings, then an elbow into the path. */}
          {showThread && threadTo >= 0 && i < threadTo && (
            <motion.span
              key={`run-${selected}`}
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 z-10 w-[1.5px] origin-top bg-brand"
              style={{ left: lineX - 0.25 }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.25, delay: depth * 0.18 + i * 0.03, ease: "easeOut" }}
            />
          )}
          {showThread && threadTo === i && (
            <motion.span
              key={`elbow-${selected}`}
              aria-hidden
              className="pointer-events-none absolute top-0 z-10 rounded-bl-[6px] border-b-[1.5px] border-l-[1.5px] border-brand"
              style={{ left: lineX - 0.25, width: indent - 4, height: ROW / 2 }}
              initial={{ clipPath: "inset(0 100% 100% 0)" }}
              animate={{ clipPath: "inset(0 0% 0% 0)" }}
              transition={{ duration: 0.3, delay: depth * 0.18 + i * 0.03 + 0.1, ease: "easeOut" }}
            />
          )}

          <div
            onClick={() => {
              select(node)
              setFocused(node.id)
              if (isFolder) toggle(node.id)
            }}
            onMouseEnter={() => isFolder && setPeeking(node.id)}
            onMouseLeave={() => setPeeking((p) => (p === node.id ? null : p))}
            className={cn(
              "relative flex cursor-pointer items-center gap-1.5 rounded-md pr-2 text-sm transition-colors",
              isSelected ? "bg-brand/10 text-foreground" : onPath ? "text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
            style={{ paddingLeft: 6 + (level - 1) * indent, height: ROW }}
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              className={cn(
                "size-3 shrink-0 transition-transform duration-200",
                !isFolder && "invisible",
                open && "rotate-90",
                onPath && showThread && "text-brand"
              )}
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
            <span aria-hidden className={cn("relative", (open || onPath) && "text-foreground")}>
              {node.icon ?? (isFolder ? <FolderIcon open={open} /> : <FileIcon />)}
              {isSelected && showThread && (
                <motion.span
                  key={`knot-${selected}`}
                  className="absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full bg-brand ring-2 ring-background"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: Math.max(0, path.length - 2) * 0.18 + 0.35, type: "spring", stiffness: 500, damping: 15 }}
                />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate">{node.label}</span>
            {showCount && isFolder && (
              <span aria-hidden className={cn("shrink-0 font-mono text-[10px] text-muted-foreground/70 transition-opacity", showPeek && "opacity-0")}>
                {count}
              </span>
            )}

            {/* Peek: the first few items slide out of the closed folder like paper slips. */}
            <AnimatePresence>
              {showPeek && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute right-1 z-20 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.15, delay: 0.25 }}
                >
                  {node.children!.slice(0, peekCount).map((child, s) => (
                    <motion.span
                      key={child.id}
                      className="-ml-3 max-w-24 truncate rounded-[4px] border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-sm first:ml-0"
                      style={{ zIndex: peekCount - s }}
                      initial={{ x: -14, y: 4, rotate: 0, opacity: 0 }}
                      animate={{ x: 0, y: (s - 1) * -1.5, rotate: (s - (Math.min(count, peekCount) - 1) / 2) * 5, opacity: 1 }}
                      transition={{ delay: 0.3 + s * 0.06, type: "spring", stiffness: 420, damping: 24 }}
                    >
                      {child.children ? "▸ " : ""}
                      {text(child.label) || "item"}
                    </motion.span>
                  ))}
                  {count > peekCount && (
                    <motion.span
                      className="ml-1 font-mono text-[10px] text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + peekCount * 0.06 }}
                    >
                      +{count - peekCount}
                    </motion.span>
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false}>
            {open && node.children && node.children.length > 0 && (
              <motion.ul
                key="children"
                role="group"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ perspective: 600 }}
                className="relative overflow-hidden"
              >
                {showLines && (
                  <motion.span
                    aria-hidden
                    className="absolute top-0 bottom-1 w-px origin-top bg-border"
                    style={{ left: 12 + (level - 1) * indent }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}
                <motion.div
                  style={{ transformOrigin: "top center" }}
                  initial={{ rotateX: -70, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -70, opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  {renderLevel(node.children, level + 1, node.id)}
                </motion.div>
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      )
    })
  }

  return (
    <MotionConfig reducedMotion="user">
      <ul role="tree" aria-label={label} data-slot="fold-tree" className={cn("w-full select-none", className)}>
        {renderLevel(data, 1, null)}
      </ul>
    </MotionConfig>
  )
}
