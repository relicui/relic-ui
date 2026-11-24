import { CaretLoader } from "@/registry/relic/ui/caret-loader"

export default function CaretLoaderDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <CaretLoader />
      <CaretLoader text="Thinking" size="lg" />
    </div>
  )
}
