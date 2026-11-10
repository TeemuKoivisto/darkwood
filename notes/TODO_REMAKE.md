# What is still missing for the web remake

Scope: a loose replica, not a pixel-exact port. The town map (`png/PICT_*` already extracted) with
clickable building areas over it, plus plain dialogs for the shops, the opponent picker and combat.
No bitmap fonts, no reproduced Mac window chrome, no colour-table archaeology. Architecture and
build setup are deliberately not covered here.

## 1. Reference screenshots

Host screenshots of the Basilisk II window, cropped to the game window (2x Retina, slightly
smoothed; fine for layout and copy, not for pixel work). Full desktop originals are in
`reference/raw/`.

| File | Shows |
|---|---|
| 01-main.png | Main window: portrait, name/class, level/XP/HP/AC/gold, six stats, town map with "Click on a building" |
| 03-opponent.png | "Please Select an Opponent": list + Award Money / XP Value / Surrender Penalty / Magic Weapon Req, Cancel/Fight |
| 04-combat-start.png | Combat dialog before round 1: both portraits, HP bars, AC / Attacks/Round / Damage/Attack, Fight/Use/Surrender buttons, empty Messages box |
| 06-win.png | "You have defeated your opponent" treasure dialog over the combat window, which shows the round messages ("You strike first", "You hit 3 time for 39 points.", "The creature missed") |
| 09-weapons.png | Weapon Shop: available list, owned list, Buy/Sell, Cost/Speed/Damage, Sell For, Gold, Done |
| 10-armor.png | Armorer: list, Buy, Cost (Trade-In)/AC Adjust, current armor name + icon, Gold, Done |
| 11-magic-shop.png | Magic Item Shop: available/owned lists, Cost/Sell, Buy/Sell, Gold, Done |
| 12-inn.png | Inn: "For each night you stay you are healed 1 hit point.", Cancel / Stay 1 Night / Stay Until Healed |
| 14-magic-items.png | Magic Items picker during combat, Cancel/Use |
| 16-message-surrender.png | "You pay 2 gold pieces to surrender." alert; combat messages show "You use an item" |

Still worth grabbing if convenient (not blocking): Level Advancement dialog, Character Death dialog
(fight the Red Dragon at level 1), Equipment dialog, a "Sorry..." message when buying something too
expensive, the New Game abandon-character confirmation.

Observed from the shots: the main window has no message box; combat results go into the Messages
box of the combat dialog. Menu bar is File / Edit / Character (Equipment..., Magic Items...) /
Shops (Weapon Shop..., Armorer..., Magic Items..., Inn...), matching `MENU_256..260`.

## 2. Play notes to confirm the recovered rules (optional)

A few lines of observed play let the formulas in `rules.md` be checked against the real thing:

- 20 or so Fight rounds against the Giant Rat at level 1 with the Dagger: note each "You hit N time
  for M points" / "You missed" and the creature's result. This checks the hit rate (should be about
  10 in 19 for a Rat at AC 9) and that Dagger damage is 1..3 and never 4.
- Drink a few Potions of Healing and note the healed amounts: expected 1..7, never 8.
- The exact text in the combat Messages box after a level-up and after a level drain.

Already observed: surrender against the Giant Rat (award money 8) cost 2 gold, so the penalty does
not round to 0.

## 3. Assets to reuse as-is

- Town map and dialog pictures: `png/PICT_*`.
- Portraits: `png/cicn_256_Character.png`, `png/cicn_262_Character.png`.
- Combat buttons: `png/cicn_267_Fight.png`, `cicn_269_Defensive.png`, `cicn_271_Surrender.png`,
  `cicn_273_Use.png`.
- Opponent and item tables: `notes/opponents.tsv`, `notes/magic_items.tsv`, `notes/tables.json`.
- Rules: `notes/rules.md`.

Clickable areas on the map (`01-main.png`, map is roughly 300x190 at 1x), confirmed by clicking in
the emulator, listed bottom to top:

| Building | Where on the map | Opens |
|---|---|---|
| Thatched, bottom right | lower right, on the road end | Magic Item Shop |
| Grey stone building | left of centre, beside the pond | Inn |
| Thatched, centre | middle of the map | Armorer |
| Thatched, top left | upper left | Weapon Shop |
| Round arena | top right | Opponent picker / combat |

## 4. Open questions

- The Finder shows the app as "Darkwood 2.5" but the dumped binary is `Darkwood_1.2.bin` (vers
  resource says 1.2). Menus match the 1.2 resources; confirm there is no separate 2.5 binary.
- Whether the Opponent dialog restricts creature choice by level, or lists all 20 always.
- Behaviour when xp passes 2,000,000 (the level table stops at 15).
- Save files: only matters if old "Charater File"s should load; otherwise any format will do.

## 5. Licensing

Darkwood is shareware by Robert Chancellor (1992), $10 registration requested in the Read Me. The art,
sounds and text are his. Keeping the remake private is fine; publishing it would warrant asking first.
