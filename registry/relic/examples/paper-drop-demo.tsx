"use client"

import { useEffect, useRef, useState } from "react"

import { PaperDrop, type PaperFile } from "@/registry/relic/ui/paper-drop"

const START: PaperFile[] = [
  { id: "a", name: "brand-guide.pdf", size: 2_400_000, progress: 1, status: "done" },
  { id: "b", name: "hero-photo.jpg", size: 860_000, progress: 0.45, status: "uploading" },
]

export default function PaperDropDemo() {
  const [files, setFiles] = useState(START)
  const next = useRef(0)

  // A pretend upload: every sheet fills a little each tick.
  useEffect(() => {
    const timer = setInterval(() => {
      setFiles((list) =>
        list.map((f) => {
          if (f.status !== "uploading") return f
          const progress = Math.min(1, f.progress + 0.06 + Math.random() * 0.08)
          return { ...f, progress, status: progress >= 1 ? "done" : "uploading" }
        })
      )
    }, 300)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full max-w-sm">
      <PaperDrop
        items={files}
        onFiles={(picked) =>
          setFiles((list) => [
            ...list,
            ...picked.map((file) => ({
              id: `f${next.current++}`,
              name: file.name,
              size: file.size,
              progress: 0,
              status: "uploading" as const,
            })),
          ])
        }
        onRemove={(id) => setFiles((list) => list.filter((f) => f.id !== id))}
      />
    </div>
  )
}
