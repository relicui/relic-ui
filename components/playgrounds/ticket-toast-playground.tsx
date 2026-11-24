"use client"

import { useState } from "react"

import {
  PlaygroundShell,
  RangeControl,
  Toggle,
  ToggleList,
  toJsx,
} from "@/components/docs/playground-controls"
import { ticketToast } from "@/registry/relic/ui/ticket-toast"

const DEFAULTS = { duration: 4, description: true }

// The TicketToaster from the demo at the top of the page shows these toasts.
export function TicketToastPlayground() {
  const [o, setO] = useState(DEFAULTS)
  const options = {
    title: "Changes saved",
    description: o.description ? "Your profile is up to date." : undefined,
    duration: o.duration * 1000,
  }

  return (
    <PlaygroundShell
      onReset={() => setO(DEFAULTS)}
      preview={
        <button
          type="button"
          onClick={() => ticketToast(options)}
          className="h-10 rounded-lg border bg-background px-4 text-sm font-medium shadow-xs hover:bg-muted/60"
        >
          Show a toast
        </button>
      }
      controls={
        <>
          <RangeControl label="duration" value={o.duration} min={1} max={10} unit="s" onChange={(v) => setO({ ...o, duration: v })} />
          <ToggleList>
            <Toggle label="description" checked={o.description} onChange={(v) => setO({ ...o, description: v })} />
          </ToggleList>
        </>
      }
      code={`ticketToast(${JSON.stringify(options, null, 2)})\n\n// Once, near the root of your app:\n${toJsx("TicketToaster", {})}`}
    />
  )
}
