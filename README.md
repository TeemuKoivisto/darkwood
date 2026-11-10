# Darkwood (Mac, 1992) asset extraction

Darkwood 1.2 by Robert Chancellor, a shareware arena-combat RPG for classic Mac OS.

## Layout

- `original/` — untouched sources: `DARKWOOD.img` (DiskCopy 4.2 800K floppy), `Darkwood_1.2.bin` (the app as MacBinary, resource fork intact), `ReadMe.bin` / `ReadMe.doc` (Word 5 manual).
- `extracted/` — full `resource_dasm` dump of the app: PICT/cicn/ICON bitmaps as `.bmp`, `snd ` as `.wav`, DLOG/DITL/MENU/CNTL as annotated text, CODE 0-8 as 68k disassembly.
- `png/` — the pictures and icons converted to PNG for viewing.
- `notes/ReadMe.txt` — the manual as plain text (story, rules, screen descriptions, opponent and magic item tables, version history).
- `notes/tables.md`, `notes/tables.json` — every game data table recovered from the code: 27 weapons, 12 armors, 13 magic items, 20 creatures, plus the message strings.
- `notes/rules.md` — the complete rule set read from the disassembly: random number generator, character stats and bonuses, initiative, hit and damage rolls, level drain, rewards and level-up, shops, inn, magic item use, sounds, and the original's quirks and bugs.
- `notes/opponents.tsv`, `notes/magic_items.tsv` — the two tables as printed in the manual.
- `tools/resource_dasm` — the extractor binary (built from fuzziqersoftware/resource_dasm, arm64).

## Pictures

| PICT | Size | Content |
|---|---|---|
| 128 / 129 | 323x55 / 315x46 | "DARKWOOD" title lettering (colour / black and white) |
| 130 / 131 | 201x176 | Title screen: lettering over a stone wall (colour / b&w) |
| 156 / 256 | 150x187 | Town map (b&w / colour) |
| 257 | 163x223 | Death screen reaper (no b&w twin) |
| 158 / 258 | 254x104 | Treasure pile, shown on winning a fight |
| 159 / 259 | 122x169 | The hero Derek, full-figure portrait for the main window (b&w / colour) |

`cicn` 256/262 are the character portrait icons, 267 Fight, 269 Defensive, 271 Surrender, 273 Use, 258/512 misc. The `cctb`/`dctb`/`wctb`/`ictb` resources are only colour tables for dialogs and controls.

## Sounds

`snd ` 512 HitOnPlayer, 513 Missed, 514 HitOnCreature, 515 New Level, 516 Oouch. Mono 8-bit, 11 or 22 kHz.

## Where the rules live

All item and creature stats are built at startup by constructor calls in `CODE 5` (see `notes/tables.md`). There is no STR#/TEXT data; messages are inline Pascal strings. The combat engine, stat tables and level-up logic are also in `CODE 5`; the dialog drivers are in `CODE 4`; `RandomNumber` and the sound players are in `CODE 7`. Everything needed for a reimplementation is written up in `notes/rules.md`.

## Reproducing the extraction

```sh
dd if=original/DARKWOOD.img of=raw.hfs bs=84 skip=1        # strip DiskCopy header
hmount raw.hfs && hcd DARKWOOD && hcopy -m "Darkwood 1.2" Darkwood_1.2.bin && humount
tools/resource_dasm --index-format=macbinary Darkwood_1.2.bin extracted/
```
