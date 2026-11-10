# What is still missing for the web remake

Checklist of material and facts not yet in this repo. Architecture and build setup are deliberately
not covered here.

## 1. Reference screenshots (needs the emulator, cannot be scripted)

Take them in Basilisk II with the Monitors control panel set to 256 colours, using Cmd+Shift+4,
Space, click on the window, so they are 1:1 pixels. Save into `reference/` with these names.

| File | What to capture |
|---|---|
| 01-main.png | Main Darkwood window right after a new game: town map, portrait, stats, messages box |
| 02-menus.png | The Actions menu pulled down (plus File and Display if they hold game items) |
| 03-opponent.png | Opponent dialog with a creature selected so its stats are filled in |
| 04-combat-start.png | Combat dialog before the first round |
| 05-combat-round.png | Same dialog after a Fight round, with both result messages showing |
| 06-win.png | Character Wins Fight dialog (treasure picture) |
| 07-level-up.png | Level Advancement dialog |
| 08-death.png | Character Death dialog (reaper). Fight the Red Dragon at level 1 to get it quickly |
| 09-weapons.png | Weapon Shop with a weapon selected |
| 10-armor.png | Armorer |
| 11-magic-shop.png | Magic Shop |
| 12-inn.png | Inn dialog |
| 13-equipment.png | Equipment dialog |
| 14-magic-items.png | Magic item picker, with at least one item owned |
| 15-about.png | About Darkwood |
| 16-message.png | Any "Sorry..." message box, e.g. buying something too expensive |
| 17-new-character.png | Abandon-character confirmation from New Game |

Optional: the main window after buying armor and a better weapon (how the stats area updates), and
the Save Before Quit dialog. The Debug Window and Director Dialog are not needed.

## 2. Play notes to confirm the recovered rules

A few lines of observed play let the formulas in `rules.md` be checked against the real thing:

- 20 or so Fight rounds against the Giant Rat at level 1 with the Dagger: note each "You hit N time
  for M points" / "You missed" and the creature's result. This checks the hit rate (should be about
  10 in 19 for a Rat at AC 9) and that Dagger damage is 1..3 and never 4.
- Whether "You strike first" ever appears when wielding a slow weapon against a high-level creature.
- Drink a few Potions of Healing and note the healed amounts: expected 1..7, never 8.
- One surrender against a creature with award money 10 (Rat) to see whether the penalty rounds to 1
  or to 0.
- The exact text in the main window's message box after a level-up and after a level drain.

## 3. Layout facts still only in the dump, not written up

All of these are present in `extracted/` and just need reading when the screens are built:

- `WIND_256` main window bounds and the `DLOG_*` rectangles (dialog size and screen position).
- `DITL_*` item rectangles and static text for every dialog (button sizes, label positions).
- The main window's stat and message rectangles are set in code, not resources: see the `SetRect`
  calls in CODE 4 just before the "IPDCOMBA" tag (around offset 0x1540), and the `TETextBox` call in
  CODE 5 `DISPLAYC` at 0x47B8, which draws the result messages into the rect at global `A5-0x63D8`.
- Colour tables (`dctb`, `wctb`, `cctb`, `ictb`) give the background and text colours of each
  dialog and control. The `.bmp` renders of them in `extracted/` show the palettes.
- The Opponent dialog's labels are strings in CODE 4: "Hit Points", "Armor Class:",
  "Attacks/Round:", "Damage/Attack:", "XP Value:", "Award Money:", "Surrender Penalty:",
  "Magic Weapon Req:". Their on-screen order comes from the screenshot.
- `MENU_256..260` and `MBAR_1` give the full menu bar and item names.
- Button icons: `cicn` 267 Fight, 269 Defensive, 271 Surrender, 273 Use, 256/262 portraits, and the
  `ICON` black-and-white twins used on 1-bit screens. The Fight button is flashed (InvertRect) for 5
  ticks before a round runs.

## 4. Things the resource fork does not contain

- **Fonts.** The game uses the System 7 system fonts (Chicago for titles and buttons, Geneva 9/12
  for text). They are not in the app. A bitmap-accurate web rendering needs a Chicago and a Geneva
  replacement; the screenshots show which sizes are used where.
- **Window chrome.** Dialog frames, buttons, scroll bars and the menu bar are drawn by the Mac
  Toolbox. Their look has to be reproduced from the screenshots.
- **The cursor and the title bar pattern**, same reason.
- **Random seed.** `Random()` is seeded from the clock at startup; the exact seeding is irrelevant
  for a port but the generator's truncation quirk (see `rules.md`) is a deliberate choice to keep or fix.
- **Save file format.** The app saves a "Charater File" (`FREF 129`, creator `DkwD`). Its layout is
  the in-memory character record (name, stats, weapon list, armor, magic items, gold). It only matters
  if old save files should load; otherwise any format will do.

## 5. Open rule questions (also listed at the end of `rules.md`)

- Whether the Opponent dialog restricts creature choice by level, or lists all 20 always.
- What `DLOG 130 "Director Dialog"` is for.
- Behaviour when xp passes 2,000,000 (the level table stops at 15).

## 6. Licensing

Darkwood is shareware by Robert Chancellor (1992), $10 registration requested in the Read Me. The art,
sounds and text are his. Keeping the remake private is fine; publishing it would warrant asking first.
