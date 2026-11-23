import type { ComponentType } from "react"

import { ElasticDividerPlayground } from "@/components/playgrounds/elastic-divider-playground"
import { FoldAccordionPlayground } from "@/components/playgrounds/fold-accordion-playground"
import { HoldToConfirmButtonPlayground } from "@/components/playgrounds/hold-to-confirm-button-playground"
import { PerforatedCardPlayground } from "@/components/playgrounds/perforated-card-playground"
import { ShimmerButtonPlayground } from "@/components/playgrounds/shimmer-button-playground"
import { SmoothCaretInputPlayground } from "@/components/playgrounds/smooth-caret-input-playground"
import { StretchTabsPlayground } from "@/components/playgrounds/stretch-tabs-playground"
import registry from "@/registry.json"
import ElasticDividerDemo from "@/registry/relic/examples/elastic-divider-demo"
import FoldAccordionDemo from "@/registry/relic/examples/fold-accordion-demo"
import HoldToConfirmButtonDemo from "@/registry/relic/examples/hold-to-confirm-button-demo"
import PerforatedCardDemo from "@/registry/relic/examples/perforated-card-demo"
import ShimmerButtonDemo from "@/registry/relic/examples/shimmer-button-demo"
import SmoothCaretInputDemo from "@/registry/relic/examples/smooth-caret-input-demo"
import StretchTabsDemo from "@/registry/relic/examples/stretch-tabs-demo"

export type PropDoc = {
  name: string
  type: string
  default?: string
  description: string
}

type DocExtras = {
  Demo: ComponentType
  /** Optional interactive playground shown in a "Customize" section. */
  Playground?: ComponentType
  props?: PropDoc[]
  accessibility?: string[]
}

const REDUCED_MOTION =
  "Animation turns off automatically for users who enable reduced motion in their system settings."

const nativeProps = (element: string): PropDoc => ({
  name: "...props",
  type: `React.ComponentProps<"${element}">`,
  description: `All native ${element} props.`,
})

/**
 * Every component that should get a docs page needs an entry here.
 * Title, description, dependencies and files come from registry.json,
 * and the order of registry.json is the order in the sidebar.
 * The demo's source lives at registry/relic/examples/<name>-demo.tsx
 * and is shown as the "Code" tab and the "Usage" section.
 */
const extras: Record<string, DocExtras> = {
  "hold-to-confirm-button": {
    Demo: HoldToConfirmButtonDemo,
    Playground: HoldToConfirmButtonPlayground,
    props: [
      {
        name: "onConfirm",
        type: "() => void",
        description: "Called once the button has been held for the full duration.",
      },
      {
        name: "duration",
        type: "number",
        default: "1.2",
        description: "Seconds the button must be held.",
      },
      {
        name: "variant",
        type: '"default" | "destructive"',
        default: '"default"',
        description: "Color of the fill.",
      },
      {
        name: "fillFrom",
        type: '"left" | "right" | "center" | "bottom"',
        default: '"left"',
        description: "Where the fill grows from.",
      },
      {
        name: "resetAfter",
        type: "number",
        default: "1.2",
        description: "Seconds the confirmed state stays before the button resets.",
      },
      {
        name: "size",
        type: '"sm" | "default" | "lg"',
        default: '"default"',
        description: "Height and padding of the button.",
      },
      {
        name: "confirmedChildren",
        type: "React.ReactNode",
        description: 'Content shown briefly after confirming, e.g. "Deleted".',
      },
      {
        name: "holdHint",
        type: "string",
        default: '"Press and hold to confirm"',
        description: "Instruction read by screen readers.",
      },
      nativeProps("button"),
    ],
    accessibility: [
      "Works with the keyboard: hold Space or Enter to confirm.",
      "Screen readers hear a hold instruction and a “Confirmed” announcement.",
      "Releasing early cancels, and the fill drains back smoothly.",
      "Phones that support it give a short vibration on confirm.",
    ],
  },
  "elastic-divider": {
    Demo: ElasticDividerDemo,
    Playground: ElasticDividerPlayground,
    props: [
      {
        name: "bend",
        type: "number",
        default: "24",
        description: "Maximum distance in pixels the line can be pulled.",
      },
      {
        name: "stiffness",
        type: "number",
        default: "350",
        description: "How tight the string is. Higher snaps back faster.",
      },
      {
        name: "damping",
        type: "number",
        default: "7",
        description: "How much the line wobbles on release. Lower is wobblier.",
      },
      {
        name: "strokeWidth",
        type: "number",
        default: "1",
        description: "Line thickness in pixels.",
      },
      {
        name: "className",
        type: "string",
        description:
          'The line uses the text color, so set it with a class like "text-blue-500".',
      },
      nativeProps("div"),
    ],
    accessibility: [
      'Exposed to screen readers as a horizontal separator (role="separator").',
      "The line uses your theme's border color, so it matches light and dark mode.",
      "Page scrolling on touch devices isn't blocked.",
      REDUCED_MOTION,
    ],
  },
  "stretch-tabs": {
    Demo: StretchTabsDemo,
    Playground: StretchTabsPlayground,
    props: [
      {
        name: "variant",
        type: '"pill" | "underline"',
        default: '"pill"',
        description: "Look of the tabs and indicator.",
      },
      {
        name: "size",
        type: '"sm" | "default" | "lg"',
        default: '"default"',
        description: "Height, padding and text size of each tab.",
      },
      {
        name: "stretch",
        type: '"subtle" | "normal" | "elastic"',
        default: '"normal"',
        description: "How much the indicator stretches while moving.",
      },
      {
        name: "items",
        type: "{ value: string; label: React.ReactNode }[]",
        description: "The tabs to show.",
      },
      {
        name: "value",
        type: "string",
        description: "The selected tab, when you control the state yourself.",
      },
      {
        name: "defaultValue",
        type: "string",
        default: "first item",
        description: "The tab selected at first, when the component manages state.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Called when the user picks a tab.",
      },
      nativeProps("div"),
    ],
    accessibility: [
      "Uses tablist and tab roles, with aria-selected on the active tab.",
      "Arrow keys move between tabs; Home and End jump to the first and last.",
      "Only the active tab is in the Tab order, as the WAI-ARIA pattern describes.",
      REDUCED_MOTION,
    ],
  },
  "fold-accordion": {
    Demo: FoldAccordionDemo,
    Playground: FoldAccordionPlayground,
    props: [
      {
        name: "variant",
        type: '"bordered" | "separated" | "plain"',
        default: '"bordered"',
        description: "Look of the accordion.",
      },
      {
        name: "springiness",
        type: '"subtle" | "paper" | "bouncy"',
        default: '"paper"',
        description: "How the sheet settles as it unfolds.",
      },
      {
        name: "foldAngle",
        type: "number",
        default: "92",
        description: "How far, in degrees, a closed panel is folded back.",
      },
      {
        name: "items",
        type: "{ value: string; title: React.ReactNode; content: React.ReactNode }[]",
        description: "The sections to show.",
      },
      {
        name: "multiple",
        type: "boolean",
        default: "false",
        description: "Allow more than one panel open at a time.",
      },
      {
        name: "value",
        type: "string[]",
        description: "Open panels, when you control the state yourself.",
      },
      {
        name: "defaultValue",
        type: "string[]",
        default: "[]",
        description: "Panels open at first, when the component manages state.",
      },
      {
        name: "onValueChange",
        type: "(value: string[]) => void",
        description: "Called when a panel opens or closes.",
      },
      nativeProps("div"),
    ],
    accessibility: [
      "Each header is a real button inside a heading, with aria-expanded and aria-controls.",
      "Panels are labelled regions linked to their header.",
      "Up and Down arrows move between headers; Home and End jump to the first and last.",
      "With reduced motion on, panels open and close instantly without the fold.",
    ],
  },
  "smooth-caret-input": {
    Demo: SmoothCaretInputDemo,
    Playground: SmoothCaretInputPlayground,
    props: [
      {
        name: "variant",
        type: '"default" | "underline" | "ghost"',
        default: '"default"',
        description: "Look of the field.",
      },
      {
        name: "size",
        type: '"sm" | "default" | "lg"',
        default: '"default"',
        description: "Height, padding and text size.",
      },
      {
        name: "caret",
        type: '"line" | "block" | "underline"',
        default: '"line"',
        description: "Shape of the caret.",
      },
      {
        name: "caretClassName",
        type: "string",
        description:
          'Extra classes for the caret, e.g. "bg-blue-500". For the block caret, use a see-through color like "bg-blue-500/30".',
      },
      {
        name: "caretSpeed",
        type: '"snappy" | "smooth" | "lazy" | { stiffness: number; damping: number }',
        default: '"smooth"',
        description:
          "How the caret moves. Use a preset, or pass your own spring settings.",
      },
      {
        name: "blink",
        type: "boolean",
        default: "true",
        description: "Whether the caret blinks while idle.",
      },
      {
        name: "letterEffect",
        type: '"rise" | "fade" | "blur" | "scale" | "drop" | "none"',
        default: '"rise"',
        description: "How new letters appear.",
      },
      {
        name: "type",
        type: '"text" | "search" | "url" | "tel" | "password"',
        default: '"text"',
        description:
          'Browsers don\'t expose the caret position for "email" or "number" inputs. For email, use type="text" with inputMode="email".',
      },
      {
        name: "animateDelete",
        type: "boolean",
        default: "true",
        description:
          "Deleted letters blur away and the rest slide over to close the gap.",
      },
      {
        name: "smear",
        type: "boolean",
        default: "true",
        description:
          "The caret stretches in the direction of travel on long jumps, like Home, End or clicking elsewhere.",
      },
      {
        name: "pasteWave",
        type: "boolean",
        default: "true",
        description: "Pasted text ripples in letter by letter.",
      },
      {
        name: "bumpOnLimit",
        type: "boolean",
        default: "true",
        description:
          "The caret gives a small shake when typing or pasting past maxLength.",
      },
      {
        name: "...props",
        type: 'React.ComponentProps<"input">',
        description:
          "All native input props, such as value, defaultValue, onChange and placeholder. Works controlled or uncontrolled.",
      },
    ],
    accessibility: [
      "It's a real <input>, so labels, autofill, form submission and screen readers work as normal.",
      "The animated text layer is hidden from screen readers to avoid duplicate reading.",
      'Password fields show dots in the visible layer and never draw the real characters.',
      "With reduced motion on, every effect switches off: the caret moves instantly and letters appear and disappear without animation.",
      "The limit bump is a visual hint only; the native maxLength still enforces the limit for everyone.",
    ],
  },
  "perforated-card": {
    Demo: PerforatedCardDemo,
    Playground: PerforatedCardPlayground,
    props: [
      {
        name: "children",
        type: "React.ReactNode",
        description: "Main content of the card, above the perforation.",
      },
      {
        name: "stub",
        type: "React.ReactNode",
        description: "Content on the tear-off stub.",
      },
      {
        name: "reveal",
        type: "React.ReactNode",
        description: "Content revealed once the stub is torn off.",
      },
      {
        name: "threshold",
        type: "number",
        default: "70",
        description: "How far in pixels the stub must be pulled to tear.",
      },
      {
        name: "perforation",
        type: '"dashed" | "dotted"',
        default: '"dashed"',
        description: "Style of the tear line.",
      },
      {
        name: "notches",
        type: "boolean",
        default: "true",
        description: "Show the half-circle cut-outs at each end of the tear line.",
      },
      {
        name: "exitEffect",
        type: '"fall" | "fly" | "fade"',
        default: '"fall"',
        description: "How the stub leaves once it's torn off.",
      },
      {
        name: "onTear",
        type: "() => void",
        description: "Called when the stub is torn off.",
      },
      {
        name: "tearLabel",
        type: "string",
        default: '"Tear off the stub to reveal hidden content"',
        description: "Accessible label for the stub.",
      },
      nativeProps("div"),
    ],
    accessibility: [
      "Keyboard users can focus the stub and press Enter or Space to tear it.",
      "Hidden content is inert (not focusable or read) until it's revealed.",
      "After tearing, focus moves to the revealed content.",
      "With reduced motion on, the stub fades out instead of falling.",
    ],
  },
  "shimmer-button": {
    Demo: ShimmerButtonDemo,
    Playground: ShimmerButtonPlayground,
    props: [
      {
        name: "variant",
        type: '"default" | "secondary" | "outline"',
        default: '"default"',
        description: "Visual style. All follow your theme colors.",
      },
      {
        name: "shimmerClassName",
        type: "string",
        description:
          'Classes for the shimmer band, e.g. "via-amber-300/50" to change its color.',
      },
      {
        name: "size",
        type: '"sm" | "default" | "lg"',
        default: '"default"',
        description: "Height and padding of the button.",
      },
      {
        name: "duration",
        type: "number",
        default: "1.6",
        description: "Seconds for one shimmer sweep across the button.",
      },
      {
        name: "delay",
        type: "number",
        default: "1.2",
        description: "Seconds to wait between sweeps.",
      },
      nativeProps("button"),
    ],
    accessibility: [
      REDUCED_MOTION,
      "Visible focus ring for keyboard users.",
      "The shimmer layer is hidden from screen readers.",
    ],
  },
}

export type DocItem = (typeof registry.items)[number] &
  DocExtras & { demoPath: string }

export const docs: DocItem[] = registry.items
  .filter((item) => item.name in extras)
  .map((item) => ({
    ...item,
    ...extras[item.name],
    demoPath: `registry/relic/examples/${item.name}-demo.tsx`,
  }))

export function getDoc(name: string) {
  return docs.find((doc) => doc.name === name)
}
