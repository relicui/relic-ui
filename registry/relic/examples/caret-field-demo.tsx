import { CaretField } from "@/registry/relic/ui/caret-field"

export default function CaretFieldDemo() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border">
      <CaretField className="absolute inset-0" />
      <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
        Move your cursor here
      </p>
    </div>
  )
}
