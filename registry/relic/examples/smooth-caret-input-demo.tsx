import { SmoothCaretInput } from "@/registry/relic/ui/smooth-caret-input"

export default function SmoothCaretInputDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="smooth-caret-email" className="text-sm font-medium">
          Email
        </label>
        <SmoothCaretInput
          id="smooth-caret-email"
          inputMode="email"
          placeholder="you@example.com"
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="smooth-caret-username" className="text-sm font-medium">
          Username
        </label>
        <SmoothCaretInput
          id="smooth-caret-username"
          maxLength={12}
          placeholder="Up to 12 characters"
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Try pasting text, deleting, or typing past the limit.
        </p>
      </div>
    </div>
  )
}
