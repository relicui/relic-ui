"use client"

import { useState } from "react"

import {
  OptionGroup,
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  toJsx,
} from "@/components/docs/playground-controls"
import { ticketToast } from "@/registry/relic/ui/ticket-toast"

const DEFAULTS = {
  variant: "default" as "default" | "success" | "error",
  duration: 4,
  description: true,
  action: false,
}

const TEXT = {
  default: { title: "Changes saved", description: "Your profile is up to date." },
  success: { title: "Payment received", description: "Thanks! A receipt is on its way." },
  error: { title: "Upload failed", description: "The file is larger than 10 MB." },
}

// The TicketToaster from the demo at the top of the page shows these toasts.
export function TicketToastPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const text = TEXT[o.variant]

  function show() {
    ticketToast({
      title: text.title,
      description: o.description ? text.description : undefined,
      variant: o.variant,
      duration: o.duration * 1000,
      action: o.action ? { label: "Undo", onClick: () => {} } : undefined,
    })
  }

  const code = [
    "ticketToast({",
    `  title: ${JSON.stringify(text.title)},`,
    o.description ? `  description: ${JSON.stringify(text.description)},` : null,
    o.variant !== "default" ? `  variant: "${o.variant}",` : null,
    o.duration !== 4 ? `  duration: ${o.duration * 1000},` : null,
    o.action ? `  action: { label: "Undo", onClick: undo },` : null,
    "})",
    "",
    "// Once, near the root of your app:",
    toJsx("TicketToaster", {}),
  ]
    .filter((line) => line !== null)
    .join("\n")

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <button
          type="button"
          onClick={show}
          className="h-10 rounded-lg border bg-background px-4 text-sm font-medium shadow-xs hover:bg-muted/60"
        >
          Show a toast
        </button>
      }
      controls={
        <>
          <OptionGroup label="variant" options={["default", "success", "error"] as const} value={o.variant} onChange={(v) => setO({ ...o, variant: v })} />
          <RangeControl label="duration" value={o.duration} min={1} max={10} unit="s" onChange={(v) => setO({ ...o, duration: v })} />
          <ToggleList>
            <Toggle label="description" checked={o.description} onChange={(v) => setO({ ...o, description: v })} />
            <Toggle label="action" checked={o.action} onChange={(v) => setO({ ...o, action: v })} />
          </ToggleList>
        </>
      }
      code={code}
    />
  )
}
