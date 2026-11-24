"use client"

import { ticketToast, TicketToaster } from "@/registry/relic/ui/ticket-toast"

export default function TicketToastDemo() {
  return (
    <>
      <button
        type="button"
        onClick={() =>
          ticketToast({
            title: "Changes saved",
            description: "Your profile is up to date.",
          })
        }
        className="h-10 rounded-lg border bg-background px-4 text-sm font-medium shadow-xs hover:bg-muted/60"
      >
        Show a toast
      </button>
      <TicketToaster />
    </>
  )
}
