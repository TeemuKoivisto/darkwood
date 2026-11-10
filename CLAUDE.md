# Darkwood remake

Web remake of Darkwood 1.2 (Mac, 1992, Robert Chancellor), a small arena-combat RPG: one town map
with five clickable buildings (four shops and an arena), a character sheet, and turn-based fights.
A loose replica: same screens, rules and data; the look is "System 7-ish", not pixel-exact.

## Where things are

- `app/` — the remake. Vite + Svelte 5 (runes) + TypeScript, Vitest. This is the only directory to
  build in.
- `notes/REMAKE_PLAN.md` — the ordered task list with acceptance criteria. Work through it top to
  bottom; it is the source of truth for what "done" means.
- `notes/rules.md` — every game rule, recovered from the 68k disassembly. Implement these exactly,
  including the items marked **(quirk)**, unless the plan says to fix one.
- `notes/tables.md` / `app/src/data/tables.json` — weapons, armor, magic items, creatures, message
  strings. The JSON is the one to load; the markdown explains the fields.
- `notes/ReadMe.txt` — the original manual (story, screen descriptions).
- `reference/NN-*.png` — screenshots of every screen, numbered in implementation order. Look at the
  one for the screen you are building before building it (the Read tool shows images).
- `notes/TODO_REMAKE.md` — what the screenshots show, map hit areas, open questions.
- `app/public/assets/img`, `app/public/assets/snd` — the original pictures, icons and sounds, ready
  to use. The map `town-map.png` is 150x187; portraits and button icons are 32x32.
- `original/`, `extracted/`, `png/`, `tools/` — source material. Read only; never modify.

## Commands (run at the repo root; `app` is an npm workspace)

    npm run dev          # dev server
    npm test             # vitest, once
    npm run check        # svelte-check + tsc
    npm run lint         # eslint (config: eslint.config.js)
    npm run format       # prettier --write (config: .prettierrc)
    npm run build        # production build to app/dist

A task is finished only when `npm test`, `npm run check`, `npm run lint` and `npm run build` all
pass and `npm run format` leaves no changes.

## Code style

Prettier and ESLint are configured at the root and are the authority; run `npm run format` before
every commit. In short: no semicolons, single quotes, 2-space indent, 100 columns, trailing commas
where ES5 allows, `arrowParens: avoid` (`x => x`, not `(x) => x`). Svelte files keep the order
script, markup, style. Unused names start with `_`. Tests may use `any`.

## Conventions

- `app/src/rules/` is pure TypeScript: no DOM, no Svelte, no globals. Every function that rolls
  dice takes an `Rng` (see `rules/rng.ts`) so tests are deterministic. Every rule in `rules.md`
  that has a formula gets a unit test next to it (`*.test.ts`).
- `app/src/ui/` holds Svelte components. One component per screen, named after the reference
  screenshot (`MainScreen.svelte`, `MagicShop.svelte`, `Inn.svelte`, ...). Dialogs use the native
  `<dialog>` element.
- Game state is a single plain object (the character plus which screen is open), held in one
  Svelte store/rune module. Components call functions from `rules/` and never mutate the character
  themselves.
- Keep the original message strings verbatim, typos included ("You character is already up to
  full hit points.", "You hit 3 time for 39 points.").
- No new dependencies without a reason written in the commit message. No UI libraries.
- Scale: render the game at 2x (map 300x374, 32px icons shown at 64px) with
  `image-rendering: pixelated`, in a centered fixed-size panel on a grey background.

## Working style for an unattended session

- Do one task from `notes/REMAKE_PLAN.md` at a time, in order. Tick its checkbox in the plan
  when its acceptance criteria are met and test, check, lint, format and build are all clean.
- Commit after each finished task on the `remake` branch (create it from `main` if it does not
  exist), message `remake: <task title>`. Do not commit a task whose checks fail.
- If a rule is ambiguous, follow `rules.md`; if `rules.md` is silent, follow the screenshot; if
  both are silent, pick the simplest behaviour and leave a `// ASSUMPTION:` comment plus a line
  under "Assumptions made" at the bottom of `notes/REMAKE_PLAN.md`. Do not stop to ask.
- Do not edit `reference/`, `original/`, `extracted/`, `png/`, `notes/rules.md`,
  `notes/tables.md`.
