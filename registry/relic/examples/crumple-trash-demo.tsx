"use client"

import { useState } from "react"
import { FileText, ImageIcon, Music, Video } from "lucide-react"

import { CrumpleTrash, type TrashItem } from "@/registry/relic/ui/crumple-trash"

export const trashStart: TrashItem[] = [
  { id: "1", title: "Quarterly report.docx", description: "Edited 2 hours ago", icon: <FileText /> },
  { id: "2", title: "Team photo.png", description: "4.2 MB", icon: <ImageIcon /> },
  { id: "3", title: "Launch video.mp4", description: "128 MB", icon: <Video /> },
  { id: "4", title: "Focus playlist.mp3", description: "3:42", icon: <Music /> },
]

export default function CrumpleTrashDemo() {
  const [items, setItems] = useState(trashStart)
  return (
    <div className="w-full max-w-sm">
      <CrumpleTrash
        items={items}
        onDelete={(item) => setItems((list) => list.filter((i) => i.id !== item.id))}
        onRestore={(item, index) => setItems((list) => [...list.slice(0, index), item, ...list.slice(index)])}
      />
    </div>
  )
}
