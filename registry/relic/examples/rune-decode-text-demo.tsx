import { RuneDecodeText } from "@/registry/relic/ui/rune-decode-text"

export default function RuneDecodeTextDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="font-serif text-3xl font-semibold tracking-tight">
        <RuneDecodeText text="Found in the ruins" />
      </p>
      <p className="text-sm text-muted-foreground">
        <RuneDecodeText text="Hover me to read the runes again" trigger="hover" />
      </p>
    </div>
  )
}
