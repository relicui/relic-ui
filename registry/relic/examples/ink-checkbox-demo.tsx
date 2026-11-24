import { InkCheckbox } from "@/registry/relic/ui/ink-checkbox"

export default function InkCheckboxDemo() {
  return (
    <div className="flex flex-col gap-3">
      <InkCheckbox label="Ship the new components" defaultChecked />
      <InkCheckbox label="Write the docs" />
      <InkCheckbox label="Tell the world" />
    </div>
  )
}
