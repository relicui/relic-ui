"use client"

type Theme = "light" | "dark"

// Slow enough to feel calm: the circle eases in, glides, and settles gently.
const DURATION = 900
const EASING = "cubic-bezier(0.45, 0, 0.25, 1)"
export const THEME_TOGGLE_ID = "theme-toggle"

/** Put the theme class on <html> right away, so the browser can capture it. */
function applyThemeNow(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.classList.toggle("light", theme === "light")
  root.style.colorScheme = theme
}

/** Where the reveal starts: the toggle button's center, or the top center. */
function revealOrigin() {
  const toggle = document.getElementById(THEME_TOGGLE_ID)
  const rect = toggle?.getBoundingClientRect()
  if (rect && rect.width > 0) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }
  return { x: window.innerWidth / 2, y: 0 }
}

/**
 * Switch themes smoothly. The new theme spreads out in a circle from the
 * toggle button. Browsers without View Transitions get a soft color fade,
 * and people who prefer reduced motion get an instant switch.
 */
export function switchTheme(next: Theme, setTheme: (theme: string) => void) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const root = document.documentElement

  if (reduceMotion) {
    setTheme(next)
    return
  }

  if (!document.startViewTransition) {
    // Fallback: briefly let every color ease into the new theme.
    root.classList.add("theme-fade")
    applyThemeNow(next)
    setTheme(next)
    window.setTimeout(() => root.classList.remove("theme-fade"), 650)
    return
  }

  const { x, y } = revealOrigin()
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transition = document.startViewTransition(() => {
    applyThemeNow(next)
    setTheme(next)
  })

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: DURATION,
          easing: EASING,
          pseudoElement: "::view-transition-new(root)",
        }
      )
    })
    .catch(() => {
      // The transition was skipped (e.g. the tab was hidden); the theme is already set.
    })
}
