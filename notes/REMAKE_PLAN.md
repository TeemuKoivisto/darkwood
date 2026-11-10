# Remake plan

Ordered tasks for building the remake in `app/`. Each has acceptance criteria; a task is done when
they hold and, at the repo root, `npm test`, `npm run check`, `npm run lint` and `npm run build`
pass and `npm run format` changes nothing. Tick the box when done.

Read `CLAUDE.md` first, then `notes/rules.md` once in full. Look at the referenced screenshot before
building each screen.

## Task 0 — Foundation

- [ ] `rules/types.ts`: `Weapon`, `Armor`, `MagicItem` (with live `charges`), `Creature`,
      `Character` matching the fields in `notes/tables.md` and the character record in `rules.md`.
- [ ] `rules/data.ts`: load `data/tables.json` into typed arrays; `creatureByName`, etc.
- [ ] `rules/character.ts`: `newCharacter()` with the fixed starting values (Derek, level 1, 10 hp,
      str 16, dex 15, con 15, 10 gold, Dagger); the derived-value functions `thac0`, `attacksPerRound`,
      `toHitBonus`, `toDamageBonus`, `dexAcBonus`, `conHitPoints`, `armorClass`, `minXpForLevel`,
      `levelEarned`. Tests for every one against the tables in `rules.md`.
- [ ] `rules/save.ts`: `serialize`/`deserialize` the character to JSON with a version field;
      `ui/storage.ts` wraps it in `localStorage` under one key.
- [ ] `ui/game.svelte.ts`: the single state module: `character`, `screen` (`'main' | 'magic-shop' |
'inn' | 'armorer' | 'weapon-shop' | 'opponent' | 'combat'`), `message` (text for the plain
      "Sorry..." alert), and the open-dialog state. Autosaves on every change.
- [ ] `App.svelte`: grey page, centered 2x game panel, renders the current screen. A fresh load with
      no save starts a new character.
- [ ] `ui/Alert.svelte`: the generic message box (`DLOG 512`): text plus OK, used for every
      one-line message in the game.

## Task 1 — Main screen (`reference/01-main.png`)

- [ ] `ui/MainScreen.svelte`: left column with portrait (`portrait-player.png`), name in blue,
      "Class: Warrior", then Level / XP / Hit Points (`hp/hp_max`) / AC / Gold in a box, then the six
      stats in a second box (Strength shown as `18/42` when percentile > 0). Values right-aligned in
      red like the screenshot.
- [ ] Right column: "City of Darkwood" title, the map image, "Click on a building" below.
- [ ] Five hit areas over the map as transparent `<button>`s with `aria-label`s, positioned by
      percentage so they survive scaling. Mapping (see `notes/TODO_REMAKE.md`): bottom-right
      thatched = Magic Item Shop, grey stone = Inn, centre thatched = Armorer, top-left thatched =
      Weapon Shop, round arena = Opponent picker. Hovering highlights the area with an outline.
- [ ] Menu bar across the top of the panel with File / Character / Shops (contents in Task 8;
      for now File has New Game, Shops opens the four shops, Character is empty).

## Task 2 — Magic Item Shop (`reference/02-magic-shop.png`)

- [ ] `rules/shops.ts`: `buyMagicItem`, `sellMagicItem` per `rules.md` "Shops and inn" (cost <=
      gold, max 10, no duplicates, only one AC item, sell for `cost div 2`, charges initialised
      10/1/0). Return `{ ok: true, character } | { ok: false, reason }` with the reason text used for
      the alert. Tests.
- [ ] `ui/MagicShop.svelte`: two lists (Items Available / Character Items) with single selection,
      Cost and Sell fields for the selected rows, Buy / Sell / Done buttons, Gold. Buying refreshes
      both lists; failures show the alert.

## Task 3 — Inn (`reference/03-inn.png`)

- [ ] `rules/inn.ts`: `stayOneNight`, `stayUntilHealed`, reproducing the original's behaviour
      including the **(bug)** that an unaffordable full heal zeroes gold and heals nothing. Tests.
- [ ] `ui/Inn.svelte`: the text and three buttons; the alert on refusal.

## Task 4 — Armorer (`reference/04-armorer.png`)

- [ ] `rules/shops.ts`: `buyArmor` (one slot, replaces, no sell). Tests, including AC recompute.
- [ ] `ui/Armorer.svelte`: list, Buy, "Cost (Trade-In)" and "AC Adjust" of the selection, current
      armor name on the right, Gold, Done.

## Task 5 — Weapon Shop (`reference/05-weapon-shop.png`)

- [ ] `rules/shops.ts`: `buyWeapon`, `sellWeapon`, `setCurrentWeapon` (max 6, sell `cost div 2`,
      cost-1 weapons sell for nothing, selling the current one makes weapon 1 current). Tests.
- [ ] `ui/WeaponShop.svelte`: Weapons Available / Character Weapons lists, Cost / Speed / Damage
      (`min-max`) of the selected shop row, Sell For of the selected owned row, Buy / Sell / Done,
      Gold. Clicking an owned weapon makes it the current weapon (mark it).

## Task 6 — Opponent picker (`reference/06-opponent.png`)

- [ ] `ui/OpponentPicker.svelte`: list of all 20 creatures; the selected one shows Hit Points,
      Armor Class, Attacks/Round, Damage/Attack, XP Value, Award Money, Surrender Penalty
      (`trunc(gold * 0.1)`), Magic Weapon Req (`No` or the bonus). Cancel returns to main; Fight
      starts combat with a fresh copy of the creature.

## Task 7 — Combat (`reference/07..13`)

- [ ] `rules/combat.ts`: `startFight(character, creature)` -> `Fight` state; `doRound(fight,
action, rng)` for `'fight' | 'defensive' | 'use' | 'surrender'` returning the new state plus the
      round messages and an `outcome` (`'continue' | 'won' | 'died' | 'surrendered' |
'surrender-refused'`). Implement initiative, player attack (with the **(quirk)** `+ magic_bonus`
      on the target number), creature attack, defensive bonus semantics, level drain, creature death
      rewards, `checkAndAdvanceLevel`. Every branch in `rules.md` "Combat" gets a test with a fixed
      `Rng`.
- [ ] `rules/items.ts`: `useMagicItem(character, item, fight?, rng)`: potions / damage items /
      tomes / rings per `rules.md` "Magic items (use)", charge consumption, AC recompute. Tests.
- [ ] `ui/Combat.svelte` (`07-combat-start.png`): two panels (player / creature) with portrait,
      name in red, "Hit Points" bar (green, proportional to hp/hp_max) with the number under it,
      Armor Class / Attacks/Round / Damage/Attack; below: the four icon buttons (Fight, Defensive, Use,
      Surrender from `btn-*.png`) and a "Messages" box showing the last round's lines in order
      ("You strike first", "You hit 3 time for 39 points.", "The creature missed").
- [ ] Use (`08-magic-items.png`): a "Magic Items" picker dialog over the combat screen with
      Cancel / Use; using an item then runs the creature's attack as the rules say.
- [ ] Surrender (`09-surrender.png`): alert "You pay N gold pieces to surrender." then back to
      main; or the "not enough gold" alert and the fight continues.
- [ ] Win (`10-win.png`): dialog with `treasure.png`, "You have defeated your opponent." and the
      award line, OK returns to main.
- [ ] Level up (`11-level-up.png` is not captured yet; use `DITL 281`: text + OK): after the win
      dialog, "You advance to level N. Your character has gained G hit points." and, at 15, the
      max-level line.
- [ ] Death (`12-death.png`): dialog with `reaper.png` and "Sorry... You character has been
      killed fighting in the arena. Better luck next time."; OK starts a new character.
- [ ] Game won (`13-game-won.png`): after killing "Dragon, Red", the Captain of the Guard alert
      with the player portrait. The game continues afterwards (the original does).

## Task 8 — Menus and character dialogs

- [ ] File: New Game (confirm "Are you sure you want to abandon this character for another?"),
      Save (download the JSON), Open (file picker, load JSON). Autosave stays on regardless.
- [ ] Character > Equipment: a dialog listing weapons (current marked), armor, magic items with
      charges. Character > Magic Items: the same picker as in combat, usable outside combat (potions
      and tomes work, damage items say "This item can only be used in combat.").
- [ ] Shops menu mirrors the map buildings.

## Task 9 — Sounds

- [ ] `ui/sounds.ts`: play `hit-on-player`, `missed`, `hit-on-creature`, `new-level`, `oouch` at
      the moments listed in `rules.md` "Sounds". A mute toggle in the menu bar, remembered in
      `localStorage`.

## Task 10 — Finish

- [ ] `app/README.md`: how to run, build, where the rules and data come from.
- [ ] Run through the whole game once in the dev server with the browser tools if available
      (otherwise by reasoning through the state module) and fix what breaks.
- [ ] Final `npm test`, `npm run check`, `npm run build` green; last commit on `remake`.

## Assumptions made

(append here as you go)
