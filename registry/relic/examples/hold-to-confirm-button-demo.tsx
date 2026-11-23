import { Check, Send, Trash2 } from "lucide-react"

import { HoldToConfirmButton } from "@/registry/relic/ui/hold-to-confirm-button"

export default function HoldToConfirmButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <HoldToConfirmButton
        variant="destructive"
        confirmedChildren={
          <>
            <Check /> Deleted
          </>
        }
      >
        <Trash2 /> Hold to delete
      </HoldToConfirmButton>
      <HoldToConfirmButton
        confirmedChildren={
          <>
            <Check /> Published
          </>
        }
      >
        <Send /> Hold to publish
      </HoldToConfirmButton>
    </div>
  )
}
