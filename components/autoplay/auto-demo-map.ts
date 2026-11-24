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
import {
  AutoAstrolabe,
  AutoCitationPeek,
  AutoJellyCard,
  AutoOrbitMenu,
  AutoPullChain,
  AutoResponseVersions,
  AutoScrollUnroll,
  AutoSpringSlider,
  AutoSuggestionDiff,
  AutoTemperatureDial,
  AutoThoughtFold,
  AutoWaxSeal,
} from "@/components/autoplay/auto-demos-themes"
import {
  AutoCrumpleTrash,
  AutoFoldTree,
  AutoPaperDrop,
  AutoVaultCode,
  AutoWeekPulse,
} from "@/components/autoplay/auto-demos-data"
import {
  AutoCohortTide,
  AutoCorrelationMatrix,
  AutoHeatMosaic,
  AutoScrollDepth,
} from "@/components/autoplay/auto-demos-heatmaps"
import { AutoFollowButton, AutoProfileDeck, AutoReachRings } from "@/components/autoplay/auto-demos-social"

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
  "suggestion-diff": AutoSuggestionDiff,
  "thought-fold": AutoThoughtFold,
  "wax-seal-button": AutoWaxSeal,
  "scroll-unroll": AutoScrollUnroll,
  "astrolabe-picker": AutoAstrolabe,
  "spring-slider": AutoSpringSlider,
  "pull-chain-toggle": AutoPullChain,
  "jelly-card": AutoJellyCard,
  "orbit-menu": AutoOrbitMenu,
  "temperature-dial": AutoTemperatureDial,
  "citation-peek": AutoCitationPeek,
  "response-versions": AutoResponseVersions,
  "paper-drop": AutoPaperDrop,
  "fold-tree": AutoFoldTree,
  "vault-code": AutoVaultCode,
  "crumple-trash": AutoCrumpleTrash,
  "week-pulse": AutoWeekPulse,
  "scroll-depth": AutoScrollDepth,
  "cohort-tide": AutoCohortTide,
  "correlation-matrix": AutoCorrelationMatrix,
  "heat-mosaic": AutoHeatMosaic,
  "profile-deck": AutoProfileDeck,
  "follow-button": AutoFollowButton,
  "reach-rings": AutoReachRings,
}
