import * as P from "@/components/playgrounds/themes-playgrounds"
import {
  nativeProps,
  REDUCED_MOTION,
  type DocExtras,
  type PropDoc,
} from "@/lib/docs-shared"
import AgentStepsDemo from "@/registry/relic/examples/agent-steps-demo"
import AstrolabePickerDemo from "@/registry/relic/examples/astrolabe-picker-demo"
import ChiselInputDemo from "@/registry/relic/examples/chisel-input-demo"
import ContextGaugeDemo from "@/registry/relic/examples/context-gauge-demo"
import DeliberateTextDemo from "@/registry/relic/examples/deliberate-text-demo"
import HourglassLoaderDemo from "@/registry/relic/examples/hourglass-loader-demo"
import JellyCardDemo from "@/registry/relic/examples/jelly-card-demo"
import LiquidProgressDemo from "@/registry/relic/examples/liquid-progress-demo"
import NewtonsCradleLoaderDemo from "@/registry/relic/examples/newtons-cradle-loader-demo"
import OrbitMenuDemo from "@/registry/relic/examples/orbit-menu-demo"
import PullChainToggleDemo from "@/registry/relic/examples/pull-chain-toggle-demo"
import RuneDecodeTextDemo from "@/registry/relic/examples/rune-decode-text-demo"
import ScrollUnrollDemo from "@/registry/relic/examples/scroll-unroll-demo"
import SpringSliderDemo from "@/registry/relic/examples/spring-slider-demo"
import SuggestionDiffDemo from "@/registry/relic/examples/suggestion-diff-demo"
import ThoughtFoldDemo from "@/registry/relic/examples/thought-fold-demo"
import WaxSealButtonDemo from "@/registry/relic/examples/wax-seal-button-demo"

const p = (name: string, type: string, description: string, def?: string): PropDoc => ({
  name,
  type,
  description,
  default: def,
})

const SIZE = p("size", '"sm" | "default" | "lg"', "Size of the component.", '"default"')
const openProps = (thing: string): PropDoc[] => [
  p("open", "boolean", `${thing}, when you control the state yourself.`),
  p("defaultOpen", "boolean", `${thing} at first, when the component manages state.`, "false"),
  p("onOpenChange", "(open: boolean) => void", "Called when it opens or closes."),
]
const checkedProps: PropDoc[] = [
  p("checked", "boolean", "On or off, when you control the state yourself."),
  p("defaultChecked", "boolean", "On or off at first, when the component manages state.", "false"),
  p("onCheckedChange", "(checked: boolean) => void", "Called when it switches."),
]

export const themeExtras: Record<string, DocExtras> = {
  /* ---------------------------------- AI ---------------------------------- */
  "suggestion-diff": {
    Demo: SuggestionDiffDemo,
    Playground: P.SuggestionDiffPlayground,
    props: [
      p("original", "string", "The text as it is now."),
      p("suggestion", "string", "The text the AI suggests. Differences are found word by word."),
      p("onAccept", "() => void", "Called when the suggestion is accepted."),
      p("onReject", "() => void", "Called when the suggestion is rejected."),
      p("showActions", "boolean", "Show the Accept and Reject buttons.", "true"),
      p("speed", "number", "Speed multiplier for the strike and typing animation.", "1"),
      p("acceptLabel / rejectLabel", "string", "Button text.", '"Accept" / "Reject"'),
      nativeProps("div"),
    ],
    accessibility: [
      "Removed words use <del> and new words use <ins>, so screen readers announce the change.",
      "Accept and Reject are real buttons; the result is announced.",
      REDUCED_MOTION,
    ],
  },
  "thought-fold": {
    Demo: ThoughtFoldDemo,
    Playground: P.ThoughtFoldPlayground,
    props: [
      p("steps", "React.ReactNode[]", "The reasoning steps shown when unfolded."),
      p("thinking", "boolean", "Still thinking: the scribble moves and the timer counts.", "false"),
      p("seconds", "number", "Seconds to show when done. Defaults to the time counted while thinking."),
      ...openProps("Unfolded"),
      p("thinkingLabel", "string", "Text while thinking.", '"Thinking"'),
      nativeProps("div"),
    ],
    accessibility: [
      "The header is a real button with aria-expanded and aria-controls.",
      "Steps are an ordered list, read in order.",
      REDUCED_MOTION,
    ],
  },
  "deliberate-text": {
    Demo: DeliberateTextDemo,
    Playground: P.DeliberateTextPlayground,
    props: [
      p("text", "string", "The text. Write {a|b|c} where the AI should hesitate; it settles on the last option."),
      p("speed", "number", "Milliseconds per streamed word.", "70"),
      p("flickers", "number", "How many times an uncertain word flickers before settling.", "4"),
      p("markChoices", "boolean", "Underline the words it hesitated over; hovering shows the alternatives.", "true"),
      p("loop", "boolean", "Start again after a pause once finished.", "false"),
      p("caretClassName", "string", "Extra classes for the caret."),
      p("onComplete", "() => void", "Called when the text has finished streaming."),
    ],
    accessibility: [
      "Screen readers read the final text once, not the flickering words.",
      "With reduced motion on, the full text shows at once.",
    ],
  },
  "context-gauge": {
    Demo: ContextGaugeDemo,
    Playground: P.ContextGaugePlayground,
    props: [
      p("used", "number", "How much of the context window is used, e.g. tokens."),
      p("max", "number", "The size of the context window."),
      p("label", "string", "Name shown above the line.", '"Context"'),
      p("unit", "string", "What is counted, shown after the numbers.", '"tokens"'),
      p("warnAt", "number", "Share of the window (0–1) after which it turns into a warning.", "0.8"),
      p("segments", "number", "Number of dashes in the line.", "32"),
      nativeProps("div"),
    ],
    accessibility: [
      'Uses role="meter" with a readable value, like “124k of 200k tokens used, 62%”.',
      "The warning uses both color and a pulse, not color alone.",
      REDUCED_MOTION,
    ],
  },
  "agent-steps": {
    Demo: AgentStepsDemo,
    Playground: P.AgentStepsPlayground,
    props: [
      p("steps", '{ label: ReactNode; status: "pending" | "running" | "done" | "error"; detail?: ReactNode }[]', "The steps and where each one is."),
      p("showTimer", "boolean", "Show a live timer on the running step.", "true"),
      nativeProps("ol"),
    ],
    accessibility: [
      "An ordered list; each step's status is included in its text for screen readers.",
      "Status uses icons and words, not color alone.",
      REDUCED_MOTION,
    ],
  },

  /* -------------------------------- Ancient ------------------------------- */
  "rune-decode-text": {
    Demo: RuneDecodeTextDemo,
    Playground: P.RuneDecodeTextPlayground,
    props: [
      p("text", "string", "The text to reveal."),
      p("trigger", '"view" | "mount" | "hover"', "When to decode: first time on screen, on load, or every hover.", '"view"'),
      p("duration", "number", "Seconds for the whole text to resolve.", "1.6"),
      p("runes", "string", "The symbols to scramble through.", "Elder Futhark"),
      nativeProps("span"),
    ],
    accessibility: [
      "Screen readers read the real text straight away, never the runes.",
      "Each letter keeps its own width, so the layout never shifts while decoding.",
      "With reduced motion on, the text shows plainly.",
    ],
  },
  "wax-seal-button": {
    Demo: WaxSealButtonDemo,
    Playground: P.WaxSealButtonPlayground,
    props: [
      p("onSeal", "() => void", "Called as the seal lands."),
      p("emblem", "React.ReactNode", "What's pressed into the wax: a letter, a symbol or an icon.", '"✶"'),
      p("waxColor", "string", "Color of the wax, any CSS color.", '"#9b2226"'),
      p("resetAfter", "number", "Seconds before the button resets. 0 keeps it sealed.", "2.4"),
      p("sealedChildren", "React.ReactNode", 'Button content once sealed, e.g. "Signed".'),
      nativeProps("button"),
    ],
    accessibility: [
      "A real button; “Sealed” is announced to screen readers.",
      "The seal is decorative and hidden from screen readers.",
      REDUCED_MOTION,
    ],
  },
  "scroll-unroll": {
    Demo: ScrollUnrollDemo,
    Playground: P.ScrollUnrollPlayground,
    props: [
      p("title", "React.ReactNode", "Text on the tag hanging from the top rod.", '"Open the scroll"'),
      ...openProps("Unrolled"),
      nativeProps("div"),
    ],
    accessibility: [
      "The top rod is a real button with aria-expanded and aria-controls.",
      "The content is a labelled region, only present while unrolled.",
      REDUCED_MOTION,
    ],
  },
  "hourglass-loader": {
    Demo: HourglassLoaderDemo,
    Playground: P.HourglassLoaderPlayground,
    props: [
      p("duration", "number", "Seconds for the sand to run through before the glass flips.", "3"),
      SIZE,
      p("sandColor", "string", "Color of the sand, any CSS color.", '"#c9a15a"'),
      p("label", "string", "What screen readers announce.", '"Loading"'),
      nativeProps("span"),
    ],
    accessibility: [
      'Uses role="status" with a label.',
      "With reduced motion on, it's a still hourglass, half run through.",
    ],
  },
  "astrolabe-picker": {
    Demo: AstrolabePickerDemo,
    Playground: P.AstrolabePickerPlayground,
    props: [
      p("options", "string[]", "The choices around the outer ring."),
      p("value", "string", "The chosen option, when you control the state yourself."),
      p("defaultValue", "string", "The option chosen at first.", "first option"),
      p("onValueChange", "(value: string) => void", "Called when a new option is chosen."),
      p("size", "number", "Diameter in pixels.", "240"),
      p("label", "string", "Accessible name.", '"Choose an option"'),
    ],
    accessibility: [
      'Uses role="slider" and reads out the chosen option by name.',
      "Arrow keys turn the ring one option at a time.",
      REDUCED_MOTION,
    ],
  },
  "chisel-input": {
    Demo: ChiselInputDemo,
    Playground: P.ChiselInputPlayground,
    props: [
      p("dust", "number", "Grains of stone dust per letter. 0 turns it off.", "7"),
      nativeProps("input"),
    ],
    accessibility: [
      "A real <input>, so labels, autofill and forms work as normal.",
      "The engraved text keeps strong contrast in light and dark mode.",
      "The dust is decorative and turns off with reduced motion.",
    ],
  },

  /* -------------------------------- Physics ------------------------------- */
  "spring-slider": {
    Demo: SpringSliderDemo,
    Playground: P.SpringSliderPlayground,
    props: [
      p("value", "number", "The value, when you control the state yourself."),
      p("defaultValue", "number", "The value at first.", "50"),
      p("onValueChange", "(value: number) => void", "Called when the value changes."),
      p("min / max / step", "number", "The range and the size of each step.", "0 / 100 / 1"),
      p("stiffness", "number", "How tight the spring is. Higher follows faster.", "260"),
      p("damping", "number", "How much it settles. Lower overshoots more.", "14"),
      p("label", "string", "Text above, also the accessible name.", '"Value"'),
      p("showValue", "boolean", "Show the value next to the label.", "true"),
    ],
    accessibility: [
      'The handle uses role="slider" with its value, minimum and maximum.',
      "Arrow keys, Page Up/Down, Home and End all work.",
      "With reduced motion on, the handle moves without the spring.",
    ],
  },
  "newtons-cradle-loader": {
    Demo: NewtonsCradleLoaderDemo,
    Playground: P.NewtonsCradleLoaderPlayground,
    props: [
      p("balls", "number", "Number of balls.", "5"),
      p("duration", "number", "Seconds for one full back-and-forth.", "1.4"),
      p("angle", "number", "How far the end balls swing, in degrees.", "32"),
      SIZE,
      p("label", "string", "What screen readers announce.", '"Loading"'),
      nativeProps("span"),
    ],
    accessibility: [
      'Uses role="status" with a label.',
      "With reduced motion on, the cradle hangs still.",
    ],
  },
  "liquid-progress": {
    Demo: LiquidProgressDemo,
    Playground: P.LiquidProgressPlayground,
    props: [
      p("value", "number", "Current progress."),
      p("max", "number", "The value that means full.", "100"),
      p("shape", '"circle" | "tank"', "A round flask or a rounded tank.", '"circle"'),
      p("size", "number", "Width and height in pixels.", "128"),
      p("showValue", "boolean", "Show the percentage in the middle.", "true"),
      p("label", "string", "Accessible name.", '"Progress"'),
      nativeProps("div"),
    ],
    accessibility: [
      'Uses role="progressbar" with its value.',
      "The percentage flips color under the liquid, so it stays readable.",
      "With reduced motion on, the surface is still and the level jumps.",
    ],
  },
  "pull-chain-toggle": {
    Demo: PullChainToggleDemo,
    Playground: P.PullChainTogglePlayground,
    props: [
      ...checkedProps,
      p("links", "number", "Number of links in the chain.", "12"),
      p("linkLength", "number", "Length of each link, in pixels.", "9"),
      p("threshold", "number", "How far, in pixels, the handle must be pulled to switch.", "26"),
      p("label", "string", "Accessible name.", '"Toggle"'),
    ],
    accessibility: [
      'A real button with role="switch" and aria-checked.',
      "Click, Space or Enter switches it with a little tug, so dragging is never required.",
    ],
  },
  "jelly-card": {
    Demo: JellyCardDemo,
    Playground: P.JellyCardPlayground,
    props: [
      p("intensity", "number", "How soft the jelly is. 0 is solid, 2 is very wobbly.", "1"),
      p("cardClassName", "string", "Extra classes for the card surface (the part that wobbles)."),
      nativeProps("div"),
    ],
    accessibility: [
      "Purely visual: anything inside stays fully usable.",
      "With reduced motion on, the card doesn't squish or wobble.",
    ],
  },
  "orbit-menu": {
    Demo: OrbitMenuDemo,
    Playground: P.OrbitMenuPlayground,
    props: [
      p("items", "{ label: string; icon: ReactNode; onSelect?: () => void }[]", "The menu items."),
      p("radius", "number", "Distance of the items from the center, in pixels.", "84"),
      p("period", "number", "Seconds for one full orbit.", "20"),
      ...openProps("Open"),
      p("label", "string", "Accessible name of the center button.", '"Menu"'),
    ],
    accessibility: [
      "The center button has aria-expanded; Esc closes the menu.",
      "Every item is a real button with a label (and a tooltip).",
      "The orbit pauses while the pointer is inside, so items are easy to hit.",
      REDUCED_MOTION,
    ],
  },
}
