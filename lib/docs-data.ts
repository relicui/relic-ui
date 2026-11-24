import * as P from "@/components/playgrounds/data-playgrounds"
import { REDUCED_MOTION, type DocExtras, type PropDoc } from "@/lib/docs-shared"
import CrumpleTrashDemo from "@/registry/relic/examples/crumple-trash-demo"
import FoldTreeDemo from "@/registry/relic/examples/fold-tree-demo"
import HotspotMapDemo from "@/registry/relic/examples/hotspot-map-demo"
import PaperDropDemo from "@/registry/relic/examples/paper-drop-demo"
import VaultCodeDemo from "@/registry/relic/examples/vault-code-demo"
import VisitorCountDemo from "@/registry/relic/examples/visitor-count-demo"
import VisitorMapDemo from "@/registry/relic/examples/visitor-map-demo"
import WeekPulseDemo from "@/registry/relic/examples/week-pulse-demo"

const p = (name: string, type: string, description: string, def?: string): PropDoc => ({
  name,
  type,
  description,
  default: def,
})

/** Docs for the Files and Data components, Vault Code and Crumple Trash. */
export const dataExtras: Record<string, DocExtras> = {
  "paper-drop": {
    Demo: PaperDropDemo,
    Playground: P.PaperDropPlayground,
    props: [
      p("items", "{ id; name; size; progress; status; error? }[]", "The files and their upload progress (0 to 1). You run the upload and update these."),
      p("onFiles", "(files: File[]) => void", "Called with files that were dropped or picked."),
      p("onRemove", "(id: string) => void", "Shows a remove button on unfinished sheets."),
      p("accept", "string", "File types to accept, e.g. \"image/*,.pdf\"."),
      p("multiple", "boolean", "Allow more than one file at a time.", "true"),
      p("layout", '"list" | "pile"', "A tidy list, or overlapping sheets like a real pile of paper.", '"list"'),
      p("segments", "number", "Dashes in each sheet's tear-line progress bar.", "20"),
      p("title / hint", "string", "Text in the drop zone.", '"Drop files here"'),
      p("disabled", "boolean", "Turn the drop zone off.", "false"),
    ],
    accessibility: [
      "The drop zone is a real button, so Enter or Space opens the file picker.",
      "Every sheet has a progressbar with its percentage, and remove buttons are named after the file.",
      "Errors are written out in text, not only shown in red.",
      REDUCED_MOTION,
    ],
  },
  "fold-tree": {
    Demo: FoldTreeDemo,
    Playground: P.FoldTreePlayground,
    props: [
      p("data", "{ id; label; children?; icon? }[]", "The tree. Items with children (even an empty array) are folders."),
      p("expanded / defaultExpanded", "string[]", "Open folders, controlled or at first.", "[]"),
      p("onExpandedChange", "(ids: string[]) => void", "Called when a folder opens or closes."),
      p("selected / defaultSelected", "string | null", "The selected item, controlled or at first."),
      p("onSelect", "(node) => void", "Called when an item is clicked or chosen with Enter."),
      p("showLines", "boolean", "Draw guide lines down open folders.", "true"),
      p("indent", "number", "Pixels of indent per level.", "16"),
      p("label", "string", "Accessible name of the tree.", '"Files"'),
    ],
    accessibility: [
      "Uses the tree, treeitem and group roles with aria-level, aria-expanded and aria-selected.",
      "One Tab stop: ↑ ↓ move, → opens or steps in, ← closes or steps out, Home and End jump, Enter selects.",
      REDUCED_MOTION,
    ],
  },
  "vault-code": {
    Demo: VaultCodeDemo,
    Playground: P.VaultCodePlayground,
    props: [
      p("length", "number", "Number of digits.", "6"),
      p("onComplete", "(code) => boolean | void | Promise<…>", "Called when every digit is filled. true unlocks, false shakes and clears."),
      p("value / defaultValue", "string", "The code, controlled or at first."),
      p("onValueChange", "(value: string) => void", "Called on every change."),
      p("mask", "boolean", "Hide digits behind dots once they've rolled into place.", "false"),
      p("size", '"sm" | "md" | "lg"', "Size of the tumblers.", '"md"'),
      p("groupSize", "number", "A gap after every n digits (123 456). 0 for none.", "3"),
      p("showLock", "boolean", "Show the padlock that opens on success.", "true"),
      p("resetOnError", "boolean", "Clear the digits after a wrong code.", "true"),
      p("label", "string", "Accessible name of the input.", '"Verification code"'),
    ],
    accessibility: [
      "One real input underneath, with inputMode=\"numeric\" and autoComplete=\"one-time-code\", so paste and SMS autofill just work.",
      "Checking, accepted and wrong-code states are announced in a live region, and aria-invalid is set on errors.",
      "The tumblers are decoration and hidden from screen readers.",
      REDUCED_MOTION,
    ],
  },
  "crumple-trash": {
    Demo: CrumpleTrashDemo,
    Playground: P.CrumpleTrashPlayground,
    props: [
      p("items", "{ id; title; description?; icon? }[]", "The list. Remove the item yourself in onDelete."),
      p("onDelete", "(item) => void", "Called once the paper ball lands in the bin."),
      p("onRestore", "(item, index) => void", "Called on Undo, with where the item was. Without it there's no Undo."),
      p("undoSeconds", "number", "How long the Undo bar stays. 0 hides it.", "5"),
      p("binPosition", '"right" | "left"', "Which side the bin sits on.", '"right"'),
      p("showCount", "boolean", "A count badge on the bin.", "true"),
      p("arc", "number", "How high the ball arcs on its way, in pixels.", "60"),
      p("speed", "number", "Speed multiplier for the crumple and the throw.", "1"),
      p("emptyText", "string", "Shown when the list is empty."),
      p("onBinClick", "() => void", "Makes the bin clickable, e.g. to open a trash page."),
    ],
    accessibility: [
      "Delete buttons are named after the item. Rows can also be trashed with Delete or Backspace.",
      "Each deletion and restore is announced, and Ctrl/⌘ + Z undoes while the Undo bar is showing.",
      "With reduced motion the item is removed straight away, without the throw.",
    ],
  },
  "week-pulse": {
    Demo: WeekPulseDemo,
    Playground: P.WeekPulsePlayground,
    props: [
      p("data", "number[][]", "7 rows (days) of 24 numbers (hours)."),
      p("days", "string[]", "Day names, top to bottom.", '["Mon", …, "Sun"]'),
      p("scale", '"primary" | "heat" | "brand"', "Color ramp of the cells.", '"primary"'),
      p("shape", '"square" | "circle"', "Cell shape.", '"square"'),
      p("gap", "number", "Gap between cells in pixels.", "3"),
      p("showTotals", "boolean", "Total bars for every day and every hour.", "true"),
      p("highlightTop", "number", "Make the busiest n hours pulse.", "3"),
      p("hourFormat", '"24h" | "12h"', "How hours are written.", '"24h"'),
      p("unit", "string", "Word used in the tooltip.", '"visits"'),
      p("formatValue", "(n: number) => string", "Format numbers in the tooltip."),
      p("onCellClick", "({ day, hour, value }) => void", "Called when a cell is clicked or chosen with Enter."),
      p("animate", "boolean", "Ripple the cells in when they come into view.", "true"),
      p("showLegend", "boolean", "A Less → More scale.", "true"),
    ],
    accessibility: [
      "A real grid with row and column headers. Every cell reads as “Tue 14:00: 42 visits”.",
      "One Tab stop: arrow keys move the crosshair, Home and End jump along the day, Enter clicks.",
      "Values are in the tooltip text, so color is never the only way to read them.",
      REDUCED_MOTION,
    ],
  },
  "hotspot-map": {
    Demo: HotspotMapDemo,
    Playground: P.HotspotMapPlayground,
    props: [
      p("points", "{ x; y; t?; weight? }[]", "Clicks in 0–1 coordinates, so they fit any size. t sets the replay order."),
      p("children", "ReactNode", "The page or screenshot the heat sits on."),
      p("radius", "number", "Spread of each click in pixels.", "28"),
      p("intensity", "number", "Heat each click adds, 0 to 1.", "0.35"),
      p("opacity", "number", "Opacity of the overlay.", "0.75"),
      p("palette", '"heat" | "brand" | "mono"', "Colors of the heat.", '"heat"'),
      p("replay", "boolean", "Play the clicks back in order, with play, pause and a scrubber.", "false"),
      p("replayDuration", "number", "Seconds a full replay takes.", "6"),
      p("loop", "boolean", "Start again after the replay ends.", "true"),
      p("track", "boolean", "Record clicks on the content live.", "false"),
      p("onTrack", "(point) => void", "Called with each recorded click, e.g. to save it."),
      p("showPoints", "boolean", "Draw a dot on every click as well.", "false"),
      p("showLegend", "boolean", "A Few → Many color scale.", "true"),
      p("hidden", "boolean", "Hide the heat, e.g. from a toggle.", "false"),
    ],
    accessibility: [
      "The overlay ignores the pointer, so the page underneath stays fully usable.",
      "The map is described as “Heatmap of 160 clicks”, and the scrubber says how many clicks are shown.",
      "Replay only runs while the map is on screen, and doesn't autoplay with reduced motion.",
    ],
  },
  "visitor-count": {
    Demo: VisitorCountDemo,
    Playground: P.VisitorCountPlayground,
    props: [
      p("value", "number", "People here right now."),
      p("history", "number[]", "Recent counts, oldest first, for the sparkline."),
      p("label", "string", "Text next to the live dot.", '"people here now"'),
      p("live", "boolean", "Show the pulsing Live dot.", "true"),
      p("heartbeat", "boolean", "The live dot beats faster as traffic grows.", "true"),
      p("max", "number", "The count that means “very busy”. Defaults to the highest seen."),
      p("showDelta", "boolean", "A +/- chip when the count changes.", "true"),
      p("showArrivals", "boolean", "A dot floats up for every new arrival.", "true"),
      p("showSparkline", "boolean", "Draw the history.", "true"),
      p("compact", "boolean", "Short numbers like 12.4K.", "false"),
      p("size", '"sm" | "md" | "lg"', "Size of the number.", '"md"'),
      p("locale", "string", "Locale for number formatting."),
    ],
    accessibility: [
      "The count is in a polite live region, read as a plain number rather than single rolling digits.",
      "The rolling digits, sparkline and arrival dots are decoration and hidden from screen readers.",
      REDUCED_MOTION,
    ],
  },
  "visitor-map": {
    Demo: VisitorMapDemo,
    Playground: P.VisitorMapPlayground,
    props: [
      p("points", "{ lat; lng; label?; count?; id? }[]", "Where visitors are. Bigger counts get bigger dots."),
      p("home", "{ lat; lng; label? }", "Your server or office. Arcs flow from every visitor to it."),
      p("showArcs", "boolean", "Draw the moving arcs to home.", "true"),
      p("showPings", "boolean", "Ripple rings around every visitor.", "true"),
      p("autoCycle", "number", "Tour the places every n seconds, showing each tooltip. 0 for off.", "0"),
      p("dotSize", "number", "Size of the land dots, 0.3 to 1.", "0.55"),
      p("color", '"brand" | "primary" | "emerald"', "Color of the visitors.", '"brand"'),
      p("unit", "string", "Word used in the tooltip.", '"visitors"'),
      p("onPointClick", "(point) => void", "Called when a place is clicked or chosen with Enter."),
    ],
    accessibility: [
      "Every place is a real button in a list, read as “Mumbai: 128 visitors”, so the map works with Tab.",
      "Focusing a place shows its tooltip, just like hovering, and pauses the auto tour.",
      "No map tiles or network requests: land shapes are built in.",
      REDUCED_MOTION,
    ],
  },
}
