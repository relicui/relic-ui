<div align="center">

<img src="app/icon.svg" width="72" height="72" alt="Relic UI logo" />

# Relic UI

**Interfaces that feel alive.**

Original, animated React components with physics you can feel.
Built on shadcn/ui, tuned by hand, installed with one command.

[Website](https://relic-ui.vercel.app) · [Components](https://relic-ui.vercel.app/docs) · [License](./LICENSE)

</div>

---

## Components

| Component | What it does |
| --- | --- |
| [Smooth Caret Input](https://relic-ui.vercel.app/docs/smooth-caret-input) | A text input whose caret glides between characters as letters ease in and out |
| [Hold to Confirm Button](https://relic-ui.vercel.app/docs/hold-to-confirm-button) | A button for risky actions that only confirms after it's held down |
| [Perforated Card](https://relic-ui.vercel.app/docs/perforated-card) | A ticket-style card with a stub you tear off to reveal hidden content |
| [Fold Accordion](https://relic-ui.vercel.app/docs/fold-accordion) | An accordion whose panels unfold like a sheet of paper |
| [Stretch Tabs](https://relic-ui.vercel.app/docs/stretch-tabs) | Tabs whose indicator stretches in the direction it moves |
| [Elastic Divider](https://relic-ui.vercel.app/docs/elastic-divider) | A divider that bends toward the cursor like a string and wobbles back |
| [Shimmer Button](https://relic-ui.vercel.app/docs/shimmer-button) | A button with a quiet sweep of light |

Every component:

- works with the **keyboard** and **screen readers**
- turns its animation off for people who prefer **reduced motion**
- follows your **shadcn/ui theme** in light and dark mode
- has a **live playground** in the docs to try every option

## Install

Relic UI components install with the [shadcn CLI](https://ui.shadcn.com/docs/cli). If your project doesn't use shadcn/ui yet:

```bash
npx shadcn@latest init
```

Then add any component:

```bash
npx shadcn@latest add https://relic-ui.vercel.app/r/hold-to-confirm-button.json
```

The source code lands in `components/ui`, ready to use and change:

```tsx
import { HoldToConfirmButton } from "@/components/ui/hold-to-confirm-button"

export function DeleteProject() {
  return (
    <HoldToConfirmButton variant="destructive" onConfirm={deleteProject}>
      Hold to delete
    </HoldToConfirmButton>
  )
}
```

## License

Relic UI is **open source** under the [MIT License](./LICENSE). Use it in any project, personal or commercial.

A credit link to [relic-ui.vercel.app](https://relic-ui.vercel.app) is appreciated, but not required. The Relic UI name and logo are not covered by the license.

## Run the docs locally

```bash
git clone https://github.com/relicui/relic-ui.git
cd relic-ui
npm install
npm run dev
```

| Folder | What's inside |
| --- | --- |
| `registry/relic/ui` | The components themselves |
| `registry/relic/examples` | The demo shown on each docs page |
| `registry.json` | The list of components the shadcn CLI can install |
| `app/` | The website and docs |

## Contributing

Ideas and bug reports are welcome. [Open an issue](https://github.com/relicui/relic-ui/issues) to suggest a component or report a problem.

---

<div align="center">

Built by [Shubham Tambe](https://github.com/Shubham-Tambei9) in India.

</div>
