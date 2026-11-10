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
- `notes/tables.md` / `app/src/game/tables.json` — weapons, armor, magic items, creatures, message
  strings. The JSON is the one to load (via `game/data.ts`); the markdown explains the fields.
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

## Architecture (`app/src/game/`)

Entities on reactive maps, systems as plain functions, one derived view for the UI.
`systems/inn.ts` and `systems/newGame.ts` with their tests are the worked examples; copy their
shape.

- `maps.ts` — `GameMaps`: the entity tables as `SvelteMap`s (`characters` by id, `fights` by
  character id). Systems write them with plain `Map` methods or the `updateCharacter` /
  `updateFight` helpers (patch = replace with a copy). Never mutate a stored record in place.
- `GameData.svelte.ts` — the reactive state the UI binds to. `$state` only for navigation and
  UI-only bits (`characterId`, `screen`, `alert`); everything about the game is `$derived` from the
  maps (`character`, `fight`, `armorClass`, `weapon`, ...). Add derived fields here when a screen
  needs a value the record does not store. Components read `GameData` and never write the maps.
- `systems/*.ts` — every system is `(ctx, payload) => void | Err` typed as `GameSys<Payload>`
  (`GameSys` alone for no payload). `ctx = { state: GameData, rng }`. Systems call each other
  directly: `const failed = other(ctx, data); if (failed) return failed`. A refusal is
  `{ err: 'text' }` where the text is what the game's alert box shows; the UI puts it in
  `state.alert`. No actor, no queue, no events: the UI calls the system function.
- `rules.ts` — pure functions with no state (tables, bonuses, derived values). `data.ts` — the
  typed tables from `tables.json`. `rng.ts` — the original's truncating `randomNumber`; every
  roll goes through `ctx.rng` so tests are deterministic (`seqRng`).
- Tests: `__tests__/boot.ts` gives fresh maps, a `GameData`, a fixed `Rng` and a new character;
  system tests live in `systems/__tests__/<system>.test.ts`, call the system with `g.ctx`, and
  check both the maps and `g.state`. Vitest globals are on (`describe`, `it`, `expect`).
- `app/src/ui/` holds the Svelte components: one per screen, named after the reference
  screenshot (`MainScreen.svelte`, `MagicShop.svelte`, `Inn.svelte`, ...). Dialogs use the native
  `<dialog>` element. `App.svelte` creates the maps and the `GameData` once and passes them down
  (context or props); `main.ts` wires persistence (an `$effect.root` that serialises the maps to
  `localStorage` on every change and loads them at start).
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
