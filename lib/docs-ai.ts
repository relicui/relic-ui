import * as P from "@/components/playgrounds/ai-playgrounds"
import { REDUCED_MOTION, type DocExtras, type PropDoc } from "@/lib/docs-shared"
import CitationPeekDemo from "@/registry/relic/examples/citation-peek-demo"
import ConfidenceTextDemo from "@/registry/relic/examples/confidence-text-demo"
import PromptDeckDemo from "@/registry/relic/examples/prompt-deck-demo"
import ResponseVersionsDemo from "@/registry/relic/examples/response-versions-demo"
import TemperatureDialDemo from "@/registry/relic/examples/temperature-dial-demo"

const p = (name: string, type: string, description: string, def?: string): PropDoc => ({
  name,
  type,
  description,
  default: def,
})

/** Docs for the second set of AI components. */
export const aiExtras: Record<string, DocExtras> = {
  "confidence-text": {
    Demo: ConfidenceTextDemo,
    Playground: P.ConfidenceTextPlayground,
    props: [
      p("tokens", "{ text: string; confidence: number }[]", "The words, each with a confidence from 0 to 1 (e.g. from token probabilities)."),
      p("variant", '"heat" | "underline" | "fade"', "How doubt is shown: a warm highlight, a (wavy) underline, or fading.", '"heat"'),
      p("threshold", "number", "Words below this confidence count as unsure.", "0.6"),
      p("onlyLow", "boolean", "Only mark the unsure words.", "false"),
      p("showTooltip", "boolean", "Show “62% sure” when hovering or focusing an unsure word.", "true"),
      p("showLegend", "boolean", "Show an “Unsure → Sure” scale under the text.", "false"),
      p("animate", "boolean", "Fade the words in one by one when they come into view.", "true"),
      p("speed", "number", "Speed multiplier for the fade-in.", "1"),
    ],
    accessibility: [
      "Unsure words get a hidden “(unsure, 42%)” note, so screen readers hear the doubt too.",
      "Unsure words can be reached with Tab to show their tooltip.",
      "Doubt is shown by shape and opacity as well as color.",
      REDUCED_MOTION,
    ],
  },
  "citation-peek": {
    Demo: CitationPeekDemo,
    Playground: P.CitationPeekPlayground,
    props: [
      p("text", "string", "The answer. Mark sources with [1], [2] … matching the citations list."),
      p("citations", "{ title: string; url?: string; source?: string; snippet?: string }[]", "The sources, in order."),
      p("trigger", '"hover" | "click"', "Open source cards on hover (and focus), or on click.", '"hover"'),
      p("marker", '"number" | "dot" | "pill"', "How the markers look: [1], a dot, or the source name.", '"number"'),
      p("placement", '"top" | "bottom"', "Where the card unfolds.", '"top"'),
      p("highlightSentence", "boolean", "Light up the sentence the open source supports.", "true"),
      p("active / onActiveChange", "number | null", "The open citation, when you control it yourself."),
    ],
    accessibility: [
      "Every marker is a real button named after its source, with aria-expanded.",
      "Cards open on keyboard focus too, and Esc closes them.",
      "In hover mode, the card stays open while the pointer is on it, so links are easy to reach.",
      REDUCED_MOTION,
    ],
  },
  "prompt-deck": {
    Demo: PromptDeckDemo,
    Playground: P.PromptDeckPlayground,
    props: [
      p("prompts", "{ title: string; prompt: string; icon?: ReactNode }[]", "The suggested prompts."),
      p("onPick", "(prompt) => void", "Called with the prompt that was picked."),
      p("layout", '"fan" | "stack" | "grid"', "A hand of cards, a deck, or a simple grid.", '"fan"'),
      p("autoShuffle", "number", "Seconds between automatic shuffles. 0 turns it off. Pauses on hover.", "0"),
      p("maxVisible", "number", "Most cards shown at once in the fan and stack layouts.", "4"),
      p("cardWidth", "number", "Card width in pixels.", "200"),
      p("showShuffle", "boolean", "Show the Shuffle button.", "true"),
    ],
    accessibility: [
      "Every card is a real button with its title and prompt as its name.",
      "Cards lift on keyboard focus as well as hover.",
      "In the stack, only the top card can be reached, matching what's visible.",
      REDUCED_MOTION,
    ],
  },
  "temperature-dial": {
    Demo: TemperatureDialDemo,
    Playground: P.TemperatureDialPlayground,
    props: [
      p("value / defaultValue", "number", "The temperature, controlled or at first.", "0.7"),
      p("onValueChange", "(value: number) => void", "Called when the value changes."),
      p("min / max / step", "number", "The range and the size of each step.", "0 / 2 / 0.1"),
      p("labels", "[string, string, string]", "Names for the low, middle and high ranges.", '["Precise", "Balanced", "Creative"]'),
      p("particles", "number", "Number of particles in the chamber.", "30"),
      p("chamberHeight", "number", "Height of the particle chamber, in pixels.", "112"),
      p("showValue", "boolean", "Show the number next to the label.", "true"),
      p("label", "string", "Text above, also the accessible name.", '"Temperature"'),
    ],
    accessibility: [
      'The handle uses role="slider" and reads out the value with its range name, like “1.4, Creative”.',
      "Arrow keys, Home and End all work.",
      "The particle chamber is decorative; with reduced motion on, it stays calm.",
    ],
  },
  "response-versions": {
    Demo: ResponseVersionsDemo,
    Playground: P.ResponseVersionsPlayground,
    props: [
      p("versions", "React.ReactNode[]", "Every version of the answer, oldest first."),
      p("index / defaultIndex", "number", "The version shown (from 0), controlled or at first.", "newest"),
      p("onIndexChange", "(index: number) => void", "Called when the reader switches versions."),
      p("onRegenerate", "() => void", "Shows a Regenerate button. Add the new answer to versions."),
      p("regenerating", "boolean", "A new version is being written: shows a shimmer.", "false"),
      p("transition", '"blur" | "slide" | "fade"', "How switching between versions looks.", '"blur"'),
      p("showCounter", "boolean", "Show “2 / 3”.", "true"),
      p("followNewest", "boolean", "Jump to a new version as soon as it's added.", "true"),
      p("label", "string", "Accessible name of the card.", '"Response"'),
    ],
    accessibility: [
      "Previous and Next are labelled buttons, disabled at the ends.",
      "The version counter is announced when it changes.",
      "While writing, a status region tells screen readers a new version is coming.",
      REDUCED_MOTION,
    ],
  },
}
