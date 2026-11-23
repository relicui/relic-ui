import { FoldAccordion } from "@/registry/relic/ui/fold-accordion"

const items = [
  {
    value: "what",
    title: "What is Relic UI?",
    content:
      "A collection of animated React components you add straight into your project with the shadcn CLI.",
  },
  {
    value: "theme",
    title: "Does it work with my theme?",
    content:
      "Yes. Every component uses shadcn/ui color tokens, so it follows your colors in light and dark mode.",
  },
  {
    value: "motion",
    title: "What about reduced motion?",
    content:
      "Animations switch off for users who ask for reduced motion, and the panels simply open and close.",
  },
]

export default function FoldAccordionDemo() {
  return (
    <div className="w-full max-w-md">
      <FoldAccordion items={items} defaultValue={["what"]} />
    </div>
  )
}
