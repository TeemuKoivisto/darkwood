# Remake plan

Ordered tasks for building the remake in `app/`. Each has acceptance criteria; a task is done when
they hold and, at the repo root, `npm test`, `npm run check`, `npm run lint` and `npm run build`
pass and `npm run format` changes nothing. Tick the box when done.

Read `CLAUDE.md` first, then `notes/rules.md` once in full. Look at the referenced screenshot before
building each screen, and when a screen is built, add its step to `app/e2e/shots.spec.ts`, run
`npm run shots` and compare `app/shots/<name>.png` with `reference/<name>.png` before ticking it.

## Task 0 — Foundation

Already in place (see `CLAUDE.md` "Architecture"): `game/types.ts`, `game/maps.ts`,
`game/GameData.svelte.ts`, `game/data.ts`, `game/rules.ts` (+ tests), `game/rng.ts` (+ tests),
`systems/newGame.ts` (`newGame`, `openScreen`), `systems/inn.ts` (+ tests), `__tests__/boot.ts`.

- [x] Types, maps, `GameData`, data loading, derived-value rules with tests.
- [x] `newGame` with the fixed starting character.
- [x] `game/save.ts`: `serializeMaps` / `deserializeMaps` to JSON with a version field (the
      characters and fights). `main.ts` loads it from `localStorage` at start and writes it back
      from an `$effect.root` on every change.
- [x] `App.svelte`: creates the maps and `GameData` once, provides them via context, grey page,
      centered 2x game panel, renders the component for `state.screen`. A fresh load with no save
      runs `newGame`.
- [x] `ui/Alert.svelte`: the generic message box (`DLOG 512`): `state.alert` text plus OK. A helper
      `run(system, payload)` in `ui/` that calls a system and puts a returned `err` in
      `state.alert`, so every button does `onclick={() => run(stayOneNight)}`.

## Task 1 — Main screen (`reference/01-main.png`)

- [x] `ui/MainScreen.svelte`: left column with portrait (`portrait-player.png`), name in blue,
      "Class: Warrior", then Level / XP / Hit Points (`hp/hp_max`) / AC / Gold in a box, then the six
      stats in a second box (Strength shown as `18/42` when percentile > 0). Values right-aligned in
      red like the screenshot.
- [x] Right column: "City of Darkwood" title, the map image, "Click on a building" below.
- [x] Five hit areas over the map as transparent `<button>`s with `aria-label`s, positioned by
      percentage so they survive scaling. Mapping (see `notes/TODO_REMAKE.md`): bottom-right
      thatched = Magic Item Shop, grey stone = Inn, centre thatched = Armorer, top-left thatched =
      Weapon Shop, round arena = Opponent picker. Hovering highlights the area with an outline.
- [x] Menu bar across the top of the panel with File / Character / Shops (contents in Task 8;
      for now File has New Game, Shops opens the four shops, Character is empty).

## Task 2 — Magic Item Shop (`reference/02-magic-shop.png`)

- [x] `systems/magicShop.ts`: `buyMagicItem: GameSys<{ name: string }>`, `sellMagicItem` per
      `rules.md` "Shops and inn" (cost <= gold, max 10, no duplicates, only one AC item, sell for
      `cost div 2`, charges initialised 10/1/0). Refusals return `{ err }` with the alert text. Tests
      in `systems/__tests__/magicShop.test.ts` via `bootGame`.
- [x] `ui/MagicShop.svelte`: two lists (Items Available / Character Items) with single selection,
      Cost and Sell fields for the selected rows, Buy / Sell / Done buttons, Gold. Buying refreshes
      both lists; failures show the alert.

## Task 3 — Inn (`reference/03-inn.png`)

- [x] `systems/inn.ts`: `stayOneNight`, `stayUntilHealed`, reproducing the original's behaviour
      including the **(bug)** that an unaffordable full heal zeroes gold and heals nothing. Tests.
- [x] `ui/Inn.svelte`: the text and three buttons; the alert on refusal.

## Task 4 — Armorer (`reference/04-armorer.png`)

- [x] `systems/armorer.ts`: `buyArmor: GameSys<{ name: string }>` (one slot, replaces, no sell).
      Tests, including that `state.armorClass` follows.
- [x] `ui/Armorer.svelte`: list, Buy, "Cost (Trade-In)" and "AC Adjust" of the selection, current
      armor name on the right, Gold, Done.

## Task 5 — Weapon Shop (`reference/05-weapon-shop.png`)

- [x] `systems/weaponShop.ts`: `buyWeapon`, `sellWeapon`, `setCurrentWeapon` (max 6, sell
      `cost div 2`, cost-1 weapons sell for nothing, selling the current one makes weapon 1 current).
      Tests.
- [x] `ui/WeaponShop.svelte`: Weapons Available / Character Weapons lists, Cost / Speed / Damage
      (`min-max`) of the selected shop row, Sell For of the selected owned row, Buy / Sell / Done,
      Gold. Clicking an owned weapon makes it the current weapon (mark it).

## Task 6 — Opponent picker (`reference/06-opponent.png`)

- [x] `systems/combat.ts`: `startFight: GameSys<{ creature: string }>` puts a `Fight` with a
      fresh copy of the creature on `maps.fights` and opens the combat screen; `endFight` removes
      it and returns to main.
- [x] `ui/OpponentPicker.svelte`: list of all 20 creatures; the selected one shows Hit Points,
      Armor Class, Attacks/Round, Damage/Attack, XP Value, Award Money, Surrender Penalty
      (`rules.surrenderPenalty`), Magic Weapon Req (`No` or the bonus). Cancel returns to main;
      Fight calls `startFight`.

## Task 7 — Combat (`reference/07..13`)

- [x] `systems/combat.ts`: one system per button, `fightRound`, `defensiveRound`, `useItemRound:
GameSys<{ item: string }>`, `surrender`, each a `GameSys` that runs one round through the shared
      helpers (initiative, player attack with the **(quirk)** `+ magic_bonus` on the target number,
      creature attack, defensive bonus semantics, level drain) and writes `fight.messages`,
      `fight.outcome`, `fight.reward`, `fight.levelUp`, `fight.gameWon` plus the character's hp /
      gold / xp / level. `creatureDeath` and `checkAndAdvanceLevel` are systems too, called from
      the round systems. Every branch in `rules.md` "Combat" gets a test with a fixed `Rng`
      (`bootGame({ rng: [...] })`).
- [x] `systems/items.ts`: `useMagicItem: GameSys<{ item: string }>`: potions / damage items /
      tomes / rings per `rules.md` "Magic items (use)", charge consumption; in combat it is what
      `useItemRound` calls before the creature attacks. Tests.
- [x] `ui/Combat.svelte` (`07-combat-start.png`): two panels (player / creature) with portrait,
      name in red, "Hit Points" bar (green, proportional to hp/hp_max) with the number under it,
      Armor Class / Attacks/Round / Damage/Attack; below: the four icon buttons (Fight, Defensive, Use,
      Surrender from `btn-*.png`) and a "Messages" box showing the last round's lines in order
      ("You strike first", "You hit 3 time for 39 points.", "The creature missed").
- [x] Use (`08-magic-items.png`): a "Magic Items" picker dialog over the combat screen with
      Cancel / Use; using an item then runs the creature's attack as the rules say.
- [x] Surrender (`09-surrender.png`): alert "You pay N gold pieces to surrender." then back to
      main; or the "not enough gold" alert and the fight continues.
- [x] Win (`10-win.png`): dialog with `treasure.png`, "You have defeated your opponent." and the
      award line, OK returns to main.
- [x] Level up (`11-level-up.png` is not captured yet; use `DITL 281`: text + OK): after the win
      dialog, "You advance to level N. Your character has gained G hit points." and, at 15, the
      max-level line.
- [x] Death (`12-death.png`): dialog with `reaper.png` and "Sorry... You character has been
      killed fighting in the arena. Better luck next time."; OK starts a new character.
- [x] Game won (`13-game-won.png`): after killing "Dragon, Red", the Captain of the Guard alert
      with the player portrait. The game continues afterwards (the original does).

## Task 8 — Menus and character dialogs

- [x] File: New Game (confirm "Are you sure you want to abandon this character for another?"),
      Save (download the JSON), Open (file picker, load JSON). Autosave stays on regardless.
- [x] Character > Equipment: a dialog listing weapons (current marked), armor, magic items with
      charges. Character > Magic Items: the same picker as in combat, usable outside combat (potions
      and tomes work, damage items say "This item can only be used in combat.").
- [x] Shops menu mirrors the map buildings.

## Task 9 — Sounds

- [ ] `ui/sounds.ts`: play `hit-on-player`, `missed`, `hit-on-creature`, `new-level`, `oouch` at
      the moments listed in `rules.md` "Sounds". A mute toggle in the menu bar, remembered in
      `localStorage`.

## Task 10 — Finish

- [ ] `app/README.md`: how to run, build, where the rules and data come from.
- [ ] `app/e2e/shots.spec.ts` has a step for every screen in `reference/` (01..13 except 11) and
      `npm run shots` produces them all. Look at each next to its reference and fix what is off.
- [ ] `app/e2e/game.spec.ts`: one browser run through the whole game: buy a weapon, stay at the
      inn, fight the Giant Rat to the win dialog, surrender once, die once. Passes.
- [ ] Final `npm test`, `npm run check`, `npm run lint`, `npm run build`, `npm run e2e` green;
      last commit on `remake`.

## Assumptions made

(append here as you go)

- Task 0: `main.ts` creates the maps and `GameData` (not `App.svelte`) so the save loads before the first render; `App` receives them as a prop, provides them via context and runs `newGame` when nothing was loaded.
- Task 0: `state.alert` is derived from a queue, `state.alerts`, so a combat round can show several notices (level drain, magic weapon needed) one after another; `run` appends refusals to it.
- Task 1: the menus are disabled while a shop, the arena or a fight is open (the original opened those as modal dialogs). The main window has a "Darkwood" title bar like the original window.
- Task 2: the shop refusal texts were not recovered; they are "Sorry... You do not have enough gold to buy this item." / "...can not carry any more magic items." / "...already own this item." / "...can only own one item that alters your armor class.". Prices are the ones in `tables.json`; the screenshots show different prices (Potion of Healing 100), presumably from the later version that took them.
- Task 3: the Inn stays open after a stay so several nights can be bought one at a time; Cancel closes it.
- Task 4: "Cost (Trade-In)" shows the plain table cost and buying charges it in full (rules.md has no trade-in; the screenshot, from a later version, shows 1 for Leather). Buying the armor already worn is allowed. The current-armor panel shows the shield icon `btn-defensive.png`, the same picture as in the screenshot.
- Task 5: duplicate weapons may be bought (rules.md does not forbid it), so owned weapons are addressed by index. A weapon bought while bare-handed becomes current. Selling a weapon listed before the current one keeps the same weapon current. The full-rack refusal reads "Sorry... You can not carry any more weapons.".
- Task 6: the picker lists all 20 creatures whatever the level, and shows the table numbers (Award Money 10 for the Giant Rat; the screenshot, from a later version, shows 8). Magic Weapon Req shows "+N" for a required bonus.
- Task 7: the Messages box always ends with the player line and the creature line built from the round counters, so a kill before the creature acts still shows "The creature missed" (as in `10-win.png`) and a creature that kills first still shows "You missed" (as in `12-death.png`). A failed surrender shows "You attempted to surrender." and "The creature missed".
- Task 7: all `attacks_per_round` swings are made even after the creature drops (rules.md does not stop the loop), so hp can go negative. The "more powerful magical weapon" alert is shown once per round. Bare-handed initiative uses speed 0.
- Task 7: a magic item that refuses (full hit points, a ring, a tome at maximum) costs no combat round: the alert shows and the creature does not attack. A tome at its maximum keeps its charge; the text is "Sorry... That attribute is already at its maximum.". Only the tails of the heal/damage messages survive, so they read "You have been healed N hit points." and "The creature took N hit points of damage.".
- Task 7: the win dialog prints "You have defeated your opponent." before the award line, as in `10-win.png` (rules.md lists them the other way round). The Option-key double-xp cheat is left out. The game-won alert uses `portrait-player.png`, as the plan says.
- Task 7: `app/public/assets/img/portrait-creature.png` is byte-identical to `portrait-player.png`; the creature icon in the screenshots is `png/cicn_258.png`. The asset was not replaced (copying into public/ was not permitted in this session), so both fighters show the player portrait for now.
- Task 8: the Shops menu keeps the four shops of `MENU_260` (no Arena entry), each opening the same screen as its building. File > Open shows "This file is not a Darkwood character file." for anything that is not a version-1 save. Saved files are named `<name>.darkwood.json`.
