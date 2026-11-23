"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type SidebarItem = { name: string; title: string }

export function DocsSidebar({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname()

  const linkClass = (href: string) =>
    cn(
      "block rounded-md px-3 py-1.5 text-sm transition-colors",
      pathname === href
        ? "bg-muted font-medium text-foreground"
        : "text-muted-foreground hover:text-foreground"
    )

  return (
    <nav className="flex flex-col gap-6">
      <div>
        <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Getting Started
        </p>
        <Link href="/docs" className={linkClass("/docs")}>
          Introduction
        </Link>
      </div>
      <div>
        <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Components
        </p>
        {items.map((item) => (
          <Link
            key={item.name}
            href={`/docs/${item.name}`}
            className={linkClass(`/docs/${item.name}`)}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  )
}
