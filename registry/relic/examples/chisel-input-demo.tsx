import { ChiselInput } from "@/registry/relic/ui/chisel-input"

export default function ChiselInputDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <label htmlFor="chisel-name" className="text-sm font-medium">
        Carve your name
      </label>
      <ChiselInput id="chisel-name" placeholder="Type to carve…" autoComplete="off" />
    </div>
  )
}
