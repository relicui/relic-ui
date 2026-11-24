import { CaretTagInput } from "@/registry/relic/ui/caret-tag-input"

export default function CaretTagInputDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <CaretTagInput
        label="Skills"
        defaultValue={["React", "Motion"]}
        placeholder="Type a skill and press Enter"
      />
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add. Backspace removes the last tag.
      </p>
    </div>
  )
}
