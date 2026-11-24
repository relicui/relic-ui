import { DeliberateText } from "@/registry/relic/ui/deliberate-text"

export default function DeliberateTextDemo() {
  return (
    <div className="w-full max-w-md text-sm">
      <DeliberateText
        loop
        text="Relic UI makes your interface feel {quick|smooth|alive}. Every component is {built|made|crafted} by hand, so it {works|behaves|feels} {nice|good|right}."
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Hover an underlined word to see what else it considered.
      </p>
    </div>
  )
}
