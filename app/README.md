# Darkwood remake

A web remake of _Darkwood 1.2_ (Mac, 1992, Robert Chancellor): one town with four shops and an
arena, a fixed warrior called Derek, and turn-based fights against twenty creatures. Svelte 5,
TypeScript and Vite; no runtime dependencies beyond Svelte.

## Running it

Everything runs from the repository root (`app` is an npm workspace):

    npm install
    npm run dev          # dev server at http://localhost:5173
    npm run build        # production build to app/dist
    npm test             # unit tests (vitest): the rules and every system
    npm run check        # svelte-check + tsc
    npm run lint         # eslint
    npm run format       # prettier
    npm run e2e          # browser tests (playwright), starts the dev server itself
    npm run shots        # one screenshot per screen into app/shots/, to compare with reference/

The game saves itself to `localStorage` on every change. File > Save downloads the same save as
JSON and File > Open loads one back.

## Where the rules and data come from

- `notes/rules.md`: every rule, read from the 68k disassembly of the original. The remake keeps
  the original's quirks (a d20 that rolls 1..19, magic weapons that are harder to hit with, the
  inn that takes all your gold, level drain that only ever takes one level).
- `src/game/tables.json` (explained in `notes/tables.md`): weapons, armor, magic items and
  creatures, recovered from the original's constructor calls.
- `notes/ReadMe.txt`: the original manual. `reference/`: screenshots of the original's screens.
- `public/assets/`: the original pictures, icons and sounds.
- `notes/REMAKE_PLAN.md`: the task list this was built from, and at its end every assumption made
  where the original's behaviour or text was not recovered.

## Code layout

- `src/game/`: the game, with no UI. `maps.ts` holds the entities (characters, fights) on
  reactive maps, `GameData.svelte.ts` derives what the screens show, `rules.ts` has the pure rule
  functions, and `systems/` one function per action (`buyWeapon`, `fightRound`, ...). A system
  either does its thing or returns `{ err }` with the text the game's alert box shows.
- `src/ui/`: one Svelte component per screen, named after its reference screenshot, plus the
  dialogs, the menu bar and the sound player.
- `e2e/`: playwright tests, including a run through a whole game (`game.spec.ts`).

The art, sounds and text are Robert Chancellor's; Darkwood was shareware.
