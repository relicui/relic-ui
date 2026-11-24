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
  /** Draw guide lines down the side of open folders. */
  showLines?: boolean
  /** Pixels of indent per level. */
  indent?: number
  /** Accessible name of the tree. */
  label?: string
  className?: string
}

type Flat = { node: TreeNode; level: number; parent: string | null }

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

/**
 * A file tree whose folders unfold like paper, with drawn guide lines and the
 * full keyboard behaviour of a real tree: ↑ ↓ to move, → to open or step in,
 * ← to close or step out, Home and End to jump.
 */
export function FoldTree({
  data,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  selected: selectedProp,
  defaultSelected = null,
  onSelect,
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
  const rows = useRef(new Map<string, HTMLElement>())

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

  const current = focused ?? selected ?? visible[0]?.node.id ?? null

  function setExpanded(next: string[]) {
    if (expandedProp === undefined) setInternalExpanded(next)
    onExpandedChange?.(next)
  }
  function toggle(id: string, open?: boolean) {
    const isOpen = expanded.includes(id)
    const want = open ?? !isOpen
    if (want === isOpen) return
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
    } else handled = false
    if (handled) e.preventDefault()
  }

  function renderLevel(nodes: TreeNode[], level: number, parent: string | null) {
    return nodes.map((node) => {
      const isFolder = !!node.children
      const open = isFolder && expanded.includes(node.id)
      const index = visible.findIndex((v) => v.node.id === node.id)
      const flat: Flat = { node, level, parent }
      return (
        <li
          key={node.id}
          role="treeitem"
          aria-level={level}
          aria-expanded={isFolder ? open : undefined}
          aria-selected={selected === node.id}
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
          }}
          className="outline-none [&:focus-visible>div]:ring-2 [&:focus-visible>div]:ring-ring/50"
        >
          <div
            onClick={() => {
              select(node)
              setFocused(node.id)
              if (isFolder) toggle(node.id)
            }}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md py-1 pr-2 text-sm transition-colors",
              selected === node.id ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
            style={{ paddingLeft: 6 + (level - 1) * indent }}
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              className={cn("size-3 shrink-0 transition-transform duration-200", !isFolder && "invisible", open && "rotate-90")}
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
            <span aria-hidden className={cn(isFolder && open && "text-foreground")}>
              {node.icon ?? (isFolder ? <FolderIcon open={open} /> : <FileIcon />)}
            </span>
            <span className="truncate">{node.label}</span>
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
