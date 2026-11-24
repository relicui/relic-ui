import type { ComponentType } from "react"

import {
  AutoCaretField,
  AutoCaretTagInput,
  AutoDialNumberInput,
  AutoElasticDivider,
  AutoFoldAccordion,
  AutoHoldToConfirm,
  AutoInkCheckbox,
  AutoPerforatedCard,
  AutoRockerSwitch,
  AutoSmoothCaretInput,
  AutoStretchSwitch,
  AutoStretchTabs,
} from "@/components/autoplay/auto-demos"

/**
 * Self-playing demos by component name, for the landing page and gallery.
 * Components not listed here already move on their own (loaders, Rewrite
 * Text, Shimmer Button …) and use their normal demo.
 */
export const autoDemos: Record<string, ComponentType> = {
  "stretch-switch": AutoStretchSwitch,
  "rocker-switch": AutoRockerSwitch,
  "ink-checkbox": AutoInkCheckbox,
  "stretch-tabs": AutoStretchTabs,
  "fold-accordion": AutoFoldAccordion,
  "smooth-caret-input": AutoSmoothCaretInput,
  "caret-tag-input": AutoCaretTagInput,
  "dial-number-input": AutoDialNumberInput,
  "hold-to-confirm-button": AutoHoldToConfirm,
  "perforated-card": AutoPerforatedCard,
  "elastic-divider": AutoElasticDivider,
  "caret-field": AutoCaretField,
}
