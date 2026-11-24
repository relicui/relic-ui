import { CitationPeek } from "@/registry/relic/ui/citation-peek"

const citations = [
  {
    title: "Using the Web Animations API",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API",
    source: "MDN",
    snippet: "Animations can be controlled from JavaScript, paused, reversed and seeked.",
  },
  {
    title: "prefers-reduced-motion",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
    source: "MDN",
    snippet: "Detects if a user has asked the system to minimize non-essential motion.",
  },
  {
    title: "Understanding Success Criterion 2.3.3",
    url: "https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions",
    source: "W3C",
    snippet: "Motion animation triggered by interaction can be disabled.",
  },
]

export default function CitationPeekDemo() {
  return (
    <div className="w-full max-w-md pt-28">
      <CitationPeek
        citations={citations}
        text="Browsers can animate elements straight from JavaScript [1]. Users can ask their system for less motion, and sites can detect it [2]. Respecting that choice is part of accessible design [3]."
      />
    </div>
  )
}
