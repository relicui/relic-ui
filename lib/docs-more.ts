import { CaretFieldPlayground } from "@/components/playgrounds/caret-field-playground"
import { CaretLoaderPlayground } from "@/components/playgrounds/caret-loader-playground"
import { CaretTagInputPlayground } from "@/components/playgrounds/caret-tag-input-playground"
import { DialNumberInputPlayground } from "@/components/playgrounds/dial-number-input-playground"
import { EtchSkeletonPlayground } from "@/components/playgrounds/etch-skeleton-playground"
import { InkCheckboxPlayground } from "@/components/playgrounds/ink-checkbox-playground"
import { PerforationProgressPlayground } from "@/components/playgrounds/perforation-progress-playground"
import { RewriteTextPlayground } from "@/components/playgrounds/rewrite-text-playground"
import { RockerSwitchPlayground } from "@/components/playgrounds/rocker-switch-playground"
import { SeekerSearchPlayground } from "@/components/playgrounds/seeker-search-playground"
import { StretchSwitchPlayground } from "@/components/playgrounds/stretch-switch-playground"
import { TicketToastPlayground } from "@/components/playgrounds/ticket-toast-playground"
import {
  nativeProps,
  REDUCED_MOTION,
  type DocExtras,
  type PropDoc,
} from "@/lib/docs-shared"
import CaretFieldDemo from "@/registry/relic/examples/caret-field-demo"
import CaretLoaderDemo from "@/registry/relic/examples/caret-loader-demo"
import CaretTagInputDemo from "@/registry/relic/examples/caret-tag-input-demo"
import DialNumberInputDemo from "@/registry/relic/examples/dial-number-input-demo"
import EtchSkeletonDemo from "@/registry/relic/examples/etch-skeleton-demo"
import InkCheckboxDemo from "@/registry/relic/examples/ink-checkbox-demo"
import PerforationProgressDemo from "@/registry/relic/examples/perforation-progress-demo"
import RewriteTextDemo from "@/registry/relic/examples/rewrite-text-demo"
import RockerSwitchDemo from "@/registry/relic/examples/rocker-switch-demo"
import SeekerSearchDemo from "@/registry/relic/examples/seeker-search-demo"
import StretchSwitchDemo from "@/registry/relic/examples/stretch-switch-demo"
import TicketToastDemo from "@/registry/relic/examples/ticket-toast-demo"

/* Props shared by the on/off controls. */
const checkedProps: PropDoc[] = [
  { name: "checked", type: "boolean", description: "On or off, when you control the state yourself." },
  { name: "defaultChecked", type: "boolean", default: "false", description: "On or off at first, when the component manages state." },
  { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called when the user toggles it." },
]
const sizeProp: PropDoc = { name: "size", type: '"sm" | "default" | "lg"', default: '"default"', description: "Size of the control." }
const nameProp: PropDoc = { name: "name", type: "string", description: 'Name for form submission. Sends "on" when checked.' }

export const moreExtras: Record<string, DocExtras> = {
  /* ------------------------------- Inputs ------------------------------- */
  "seeker-search": {
    Demo: SeekerSearchDemo,
    Playground: SeekerSearchPlayground,
    props: [
      { name: "items", type: "{ value: string; label: string; description?: string; keywords?: string[] }[]", description: "Everything that can be found." },
      { name: "placeholders", type: "string[]", default: '["Search…"]', description: "Suggestions the placeholder types out, one after another." },
      { name: "onSelect", type: "(item) => void", description: "Called when a result is picked with Enter or a click." },
      { name: "maxResults", type: "number", default: "6", description: "Most results shown at once." },
      { name: "shortcut", type: "string", default: '"/"', description: "Key that focuses the search from anywhere. Empty string turns it off." },
      { name: "emptyText", type: "string", default: '"Nothing found."', description: "Shown when nothing matches." },
      { name: "label", type: "string", default: '"Search"', description: "Accessible name for the input." },
    ],
    accessibility: [
      "Follows the ARIA combobox pattern: the input controls a listbox and announces the active option.",
      "↑ and ↓ move through results, Enter picks one, Esc clears the text and then leaves the field.",
      "The self-typing placeholder is hidden from screen readers; the input has a proper label.",
      REDUCED_MOTION,
    ],
  },
  "caret-tag-input": {
    Demo: CaretTagInputDemo,
    Playground: CaretTagInputPlayground,
    props: [
      { name: "value", type: "string[]", description: "The tags, when you control the state yourself." },
      { name: "defaultValue", type: "string[]", default: "[]", description: "The tags at first, when the component manages state." },
      { name: "onValueChange", type: "(tags: string[]) => void", description: "Called when a tag is added or removed." },
      { name: "max", type: "number", description: "Most tags allowed. Going over gives the field a small shake." },
      { name: "separators", type: "string[]", default: '["Enter", ","]', description: "Keys that turn the typed text into a tag." },
      { name: "placeholder", type: "string", default: '"Add a tag…"', description: "Shown while there are no tags." },
      { name: "label", type: "string", default: '"Tags"', description: "Accessible name for the input." },
      { name: "name", type: "string", description: "Name for form submission. Tags are sent comma-separated." },
    ],
    accessibility: [
      "Every tag has a remove button with a clear label, like “Remove React”.",
      "Backspace in an empty field removes the last tag.",
      "Adding or removing a tag is announced to screen readers.",
      "Duplicates aren't added; the existing tag wiggles instead so you can see it.",
      REDUCED_MOTION,
    ],
  },
  "dial-number-input": {
    Demo: DialNumberInputDemo,
    Playground: DialNumberInputPlayground,
    props: [
      { name: "value", type: "number", description: "The number, when you control the state yourself." },
      { name: "defaultValue", type: "number", default: "0", description: "The number at first, when the component manages state." },
      { name: "onValueChange", type: "(value: number) => void", description: "Called when the number changes." },
      { name: "min", type: "number", default: "0", description: "Lowest allowed value." },
      { name: "max", type: "number", default: "100", description: "Highest allowed value." },
      { name: "step", type: "number", default: "1", description: "How much one notch changes the value. Decimals work too." },
      { name: "formatValue", type: "(value: number) => string", description: 'How the number is shown, e.g. (v) => `${v}%`.' },
      { name: "label", type: "string", default: '"Value"', description: "Accessible name, also shown under the dial." },
      { name: "name", type: "string", description: "Name for form submission." },
    ],
    accessibility: [
      "Uses the spinbutton role with its current, minimum and maximum values.",
      "Arrow keys change one step, Page Up/Down ten steps, Home/End jump to the limits.",
      "Scrolling only turns the dial while it has focus, so the page still scrolls normally.",
      "The − and + buttons give a simple way to change the value without dragging.",
      REDUCED_MOTION,
    ],
  },

  /* ------------------------------- Toggles ------------------------------ */
  "stretch-switch": {
    Demo: StretchSwitchDemo,
    Playground: StretchSwitchPlayground,
    props: [
      ...checkedProps,
      sizeProp,
      { name: "stretch", type: "number", default: "0.45", description: "How far the thumb stretches while moving, as a share of its width. 0 turns it off." },
      { name: "checkedIcon", type: "React.ReactNode", description: "Icon or text inside the thumb when on." },
      { name: "uncheckedIcon", type: "React.ReactNode", description: "Icon or text inside the thumb when off." },
      nameProp,
      nativeProps("button"),
    ],
    accessibility: [
      'A real button with role="switch" and aria-checked, so screen readers say “on” or “off”.',
      "Space and Enter toggle it; it can be labelled by a wrapping <label> or aria-label.",
      REDUCED_MOTION,
    ],
  },
  "rocker-switch": {
    Demo: RockerSwitchDemo,
    Playground: RockerSwitchPlayground,
    props: [
      ...checkedProps,
      { name: "onLabel", type: "React.ReactNode", default: '"I"', description: "Label on the “on” half." },
      { name: "offLabel", type: "React.ReactNode", default: '"O"', description: "Label on the “off” half." },
      { name: "tilt", type: "number", default: "16", description: "How far the rocker tips, in degrees." },
      sizeProp,
      nameProp,
      nativeProps("button"),
    ],
    accessibility: [
      'A real button with role="switch" and aria-checked. Give it a name with aria-label or a <label>.',
      "Space and Enter toggle it.",
      "With reduced motion on, the rocker doesn't tilt; light and shadow still show which side is pressed.",
    ],
  },
  "ink-checkbox": {
    Demo: InkCheckboxDemo,
    Playground: InkCheckboxPlayground,
    props: [
      ...checkedProps,
      { name: "label", type: "React.ReactNode", description: "Text next to the box. Clicking it toggles the box too." },
      sizeProp,
      nameProp,
      nativeProps("button"),
    ],
    accessibility: [
      'A real button with role="checkbox" and aria-checked.',
      "The label is a real <label>, so clicking the text toggles it and screen readers read it.",
      "Keyboard toggles start the ink from the center of the box.",
      REDUCED_MOTION,
    ],
  },

  /* ------------------------------- Loaders ------------------------------ */
  "caret-loader": {
    Demo: CaretLoaderDemo,
    Playground: CaretLoaderPlayground,
    props: [
      { name: "text", type: "React.ReactNode", description: 'Optional text before the dots, e.g. "Loading".' },
      { name: "dots", type: "number", default: "3", description: "How many dots get typed." },
      { name: "speed", type: "number", default: "1", description: "Speed multiplier. 2 is twice as fast." },
      sizeProp,
      { name: "label", type: "string", default: '"Loading"', description: "What screen readers announce." },
      { name: "caretClassName", type: "string", description: 'Extra classes for the caret, e.g. "bg-amber-500".' },
    ],
    accessibility: [
      'Uses role="status" with a label, so screen readers hear “Loading” once instead of every dot.',
      "Its width never changes, so surrounding text doesn't jump.",
      "With reduced motion on, it shows a still row of dots.",
    ],
  },
  "perforation-progress": {
    Demo: PerforationProgressDemo,
    Playground: PerforationProgressPlayground,
    props: [
      { name: "value", type: "number", description: "Current progress. Leave it out for an unknown (indeterminate) state." },
      { name: "max", type: "number", default: "100", description: "The value that means done." },
      { name: "segments", type: "number", default: "24", description: "Number of dashes in the line." },
      { name: "label", type: "string", description: "Text above the line, also used as the accessible name." },
      { name: "showValue", type: "boolean", default: "false", description: "Show the percentage next to the label." },
      nativeProps("div"),
    ],
    accessibility: [
      'Uses role="progressbar" with aria-valuenow, so screen readers know how far along it is.',
      "Leaving out value marks it as indeterminate, the correct state when progress is unknown.",
      "With reduced motion on, dashes fill without the pop and wave.",
    ],
  },
  "etch-skeleton": {
    Demo: EtchSkeletonDemo,
    Playground: EtchSkeletonPlayground,
    props: [
      { name: "lines", type: "number", default: "3", description: "Number of placeholder lines." },
      { name: "widths", type: "string[]", description: 'Width of each line, e.g. ["100%", "90%", "60%"]. Repeats if shorter.' },
      { name: "avatar", type: "boolean", default: "false", description: "Show a round avatar placeholder before the lines." },
      { name: "speed", type: "number", default: "1", description: "Speed multiplier. 2 is twice as fast." },
      { name: "label", type: "string", default: '"Loading"', description: "What screen readers announce." },
      nativeProps("div"),
    ],
    accessibility: [
      'Uses role="status" with a label; the placeholder shapes themselves are hidden from screen readers.',
      "With reduced motion on, it's a calm, still skeleton.",
    ],
  },

  /* ------------------------------ Feedback ------------------------------ */
  "ticket-toast": {
    Demo: TicketToastDemo,
    Playground: TicketToastPlayground,
    props: [
      { name: "ticketToast(title | options)", type: "function", description: "Shows a toast from anywhere in your app. Returns its id." },
      { name: "options.title", type: "React.ReactNode", description: "Main text of the toast." },
      { name: "options.description", type: "React.ReactNode", description: "Smaller text under the title." },
      { name: "options.stub", type: "React.ReactNode", description: "Content of the tear-off stub. Defaults to a close mark." },
      { name: "options.duration", type: "number", default: "4000", description: "Milliseconds before it tears itself off. Infinity keeps it open." },
      { name: "ticketToast.dismiss(id)", type: "function", description: "Tears off a toast early." },
      { name: "<TicketToaster position>", type: '"bottom-right" | "bottom-left" | "top-right" | "top-left"', default: '"bottom-right"', description: "Place the toaster once, near the root of your app." },
    ],
    accessibility: [
      "Toasts appear in a labelled live region, so screen readers announce them politely.",
      "The stub is a real button labelled “Dismiss notification”.",
      "The timer pauses while the pointer is over a toast, so it doesn't vanish mid-read.",
      "With reduced motion on, toasts fade instead of tearing.",
    ],
  },

  /* ---------------------------- Text & effects -------------------------- */
  "rewrite-text": {
    Demo: RewriteTextDemo,
    Playground: RewriteTextPlayground,
    props: [
      { name: "words", type: "string[]", description: "The words to cycle through. The first one shows first." },
      { name: "hold", type: "number", default: "2.4", description: "Seconds each word stays before it's rewritten." },
      { name: "typeSpeed", type: "number", default: "70", description: "Milliseconds per typed letter (with a little natural randomness)." },
      { name: "highlight", type: "boolean", default: "true", description: "Show the “select all” highlight before deleting." },
      { name: "caretClassName", type: "string", description: 'Extra classes for the caret, e.g. "bg-amber-500".' },
      nativeProps("span"),
    ],
    accessibility: [
      "Screen readers read the first word once, instead of every letter being typed.",
      "With reduced motion on, it shows the first word, still.",
    ],
  },
  "caret-field": {
    Demo: CaretFieldDemo,
    Playground: CaretFieldPlayground,
    props: [
      { name: "gap", type: "number", default: "28", description: "Distance between carets, in pixels." },
      { name: "length", type: "number", default: "7", description: "Caret length at rest, in pixels." },
      { name: "radius", type: "number", default: "180", description: "How far the cursor's pull reaches, in pixels." },
      { name: "maxBlinks", type: "number", default: "5", description: "How many carets may blink at once. 0 turns blinking off." },
      { name: "blinkChance", type: "number", default: "0.025", description: "Chance per frame that a new blink starts (0–1)." },
      { name: "colorVar", type: "string", default: '"--muted-foreground"', description: "CSS variable for the resting carets." },
      { name: "accentVar", type: "string", default: '"--primary"', description: "CSS variable for the blinking carets." },
      { name: "className", type: "string", description: 'Size and place it, usually "absolute inset-0" inside a relative parent.' },
    ],
    accessibility: [
      "Purely decorative: hidden from screen readers and never blocks clicks.",
      "Pauses when scrolled out of view or when the tab is hidden, to save battery.",
      "With reduced motion on, it's a still pattern.",
    ],
  },
}
