# Darkwood 1.2 game data

Recovered from the `CODE 5` segment of the application (THINK Pascal constructor calls with immediate arguments). Field names come from reading the code that consumes each field (see `rules.md`). Negative numbers were 16-bit two's complement in the code. Raw calls: `code5_constructor_calls.json`.

**Damage is a uniform range, not dice.** The game calls `RandomNumber(dmg_min, dmg_max)`, so a Flail does 2 to 7 uniformly, not 2d7. The author entered AD&D dice as min/max (Warhammer 1d4+1 = 2 to 5, Bastard Sword 2d4 = 2 to 8).

## Weapons

`speed` is the AD&D weapon speed factor (lower is better for initiative). Constructor at CODE 5 offset 0x08A0, record tag "WEAPONRE". The character starts with the Dagger.

| name | cost | magic_bonus | dmg_min | dmg_max | speed |
|---|---|---|---|---|---|
| Bardiche | 7 | 0 | 2 | 8 | 9 |
| Battle Axe | 5 | 0 | 1 | 8 | 7 |
| Club | 1 | 0 | 1 | 6 | 4 |
| Dagger | 1 | 0 | 1 | 4 | 2 |
| Flail | 15 | 0 | 2 | 7 | 7 |
| Halberd | 10 | 0 | 1 | 10 | 9 |
| Hand Axe | 1 | 0 | 1 | 6 | 4 |
| Khopesh | 10 | 0 | 2 | 8 | 9 |
| Mace | 8 | 0 | 2 | 7 | 7 |
| Morning Star | 10 | 0 | 2 | 8 | 7 |
| Quarterstaff | 1 | 0 | 1 | 6 | 4 |
| Sword, Short | 10 | 0 | 1 | 6 | 3 |
| Sword, Long | 15 | 0 | 1 | 8 | 5 |
| Sword, Bastard | 25 | 0 | 2 | 8 | 8 |
| Sword, Two-Handed | 50 | 0 | 1 | 10 | 10 |
| Warhammer | 2 | 0 | 2 | 5 | 4 |
| Dagger +1 | 500 | 1 | 1 | 4 | 1 |
| Hand Axe +1 | 700 | 1 | 1 | 6 | 3 |
| Morning Star +1 | 1000 | 1 | 2 | 8 | 6 |
| Warhammer +1 | 600 | 1 | 2 | 5 | 3 |
| Sword, Long +1 | 1000 | 1 | 1 | 8 | 4 |
| Sword, Two-Handed +1 | 1500 | 1 | 1 | 10 | 9 |
| Sword, Long +2 | 2000 | 2 | 1 | 8 | 3 |
| Sword, Two-Handed +2 | 2500 | 2 | 1 | 10 | 8 |
| Sword, Long +3 | 2500 | 3 | 1 | 8 | 2 |
| Sword, Long +4 | 3000 | 4 | 1 | 8 | 1 |
| Sword, +5 Holy Avenger | 6000 | 5 | 1 | 8 | 1 |

## Armor

`ac_modifier` is added to a base armor class of 10 (Leather = AC 8, Full Plate +4 = AC -3). Only one armor can be owned. Constructor at 0x139A.

| name | cost | ac_modifier |
|---|---|---|
| Leather | 5 | -2 |
| Studded Leather | 20 | -3 |
| Scale Mail | 50 | -4 |
| Chain | 75 | -5 |
| Splint | 100 | -6 |
| Plate Mail | 600 | -7 |
| Field Plate | 900 | -8 |
| Full Plate | 1200 | -9 |
| Full Plate +1 | 1800 | -10 |
| Full Plate +2 | 2000 | -11 |
| Full Plate +3 | 3000 | -12 |
| Full Plate +4 | 5000 | -13 |

## Magic items

`attribute_raised` is the stat a Tome raises. `charges` is the live charge counter on the owned copy: wands have 10, potions 1, rings 0 (passive, never consumed). `dmg_*` items can only be used in combat; `heal_*` items anywhere. `unused` is 0 for every item and never read. Constructor at 0x1880. Up to 10 items can be owned, no duplicates, and only one AC-altering item.

| name | cost | ac_bonus | unused | dmg_min | dmg_max | heal_min | heal_max | charges | attribute_raised |
|---|---|---|---|---|---|---|---|---|---|
| Potion of Healing | 75 | 0 | 0 | 0 | 0 | 1 | 8 | 1 | - |
| Potion of Extra Healing | 200 | 0 | 0 | 0 | 0 | 4 | 24 | 1 | - |
| Potion of Major Healing | 1000 | 0 | 0 | 0 | 0 | 8 | 80 | 1 | - |
| Potion of Fiery Breath | 200 | 0 | 0 | 4 | 24 | 0 | 0 | 1 | - |
| Ring of Protection +1 | 800 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | - |
| Ring of Protection +2 | 1200 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | - |
| Ring of Protection +3 | 2000 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | - |
| Wand of Magic Missiles | 1000 | 0 | 0 | 8 | 16 | 0 | 0 | 10 | - |
| Wand of Fire | 1500 | 0 | 0 | 4 | 24 | 0 | 0 | 10 | - |
| Wand of Lightning | 1850 | 0 | 0 | 6 | 36 | 0 | 0 | 10 | - |
| Tome of Strength | 2000 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Strength |
| Tome of Dexterity | 2000 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dexterity |
| Tome of Constitution | 2000 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Constitution |

## Creatures

`thac0` is the number the creature needs on d20 to hit AC 0. `attacks` per round, each doing `dmg_min` to `dmg_max`. `level` feeds initiative. `level_drain` = levels drained on each hit (Ghoul, Wight). `needs_magic_weapon` = minimum weapon bonus required to hit at all. `xp` and `gold` match the Read Me table. Constructor at 0x3BC0, record tag "CREATURE".

| name | hp | hp_max | ac | thac0 | level | attacks | dmg_min | dmg_max | xp | gold | level_drain | needs_magic_weapon |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Rat, Giant | 2 | 2 | 9 | 20 | 2 | 1 | 1 | 4 | 75 | 10 | 0 | 0 |
| Kobold | 4 | 4 | 8 | 20 | 4 | 1 | 1 | 6 | 90 | 20 | 0 | 0 |
| Goblin | 8 | 8 | 7 | 19 | 4 | 1 | 1 | 6 | 110 | 25 | 0 | 0 |
| Orc | 16 | 16 | 7 | 19 | 5 | 1 | 1 | 8 | 150 | 30 | 0 | 0 |
| Bugbear | 20 | 20 | 5 | 18 | 5 | 1 | 1 | 8 | 250 | 40 | 0 | 0 |
| Gnoll | 24 | 24 | 0 | 18 | 5 | 1 | 1 | 8 | 300 | 50 | 0 | 0 |
| Minotaur | 32 | 32 | 4 | 16 | 7 | 1 | 2 | 8 | 300 | 55 | 0 | 0 |
| Ettin | 35 | 35 | 4 | 16 | 5 | 2 | 1 | 8 | 300 | 70 | 0 | 0 |
| Gargoyle | 24 | 24 | 0 | 14 | 5 | 3 | 1 | 6 | 400 | 180 | 0 | 1 |
| Ghoul | 16 | 16 | 7 | 16 | 4 | 1 | 1 | 4 | 500 | 400 | 1 | 0 |
| Wight | 32 | 32 | 5 | 14 | 4 | 1 | 1 | 8 | 700 | 500 | 1 | 1 |
| Quickling | 16 | 16 | -7 | 15 | 2 | 2 | 1 | 4 | 900 | 600 | 0 | 0 |
| Hydra | 50 | 50 | 2 | 11 | 6 | 8 | 1 | 6 | 800 | 700 | 0 | 0 |
| Giant, Hill | 80 | 80 | 2 | 10 | 7 | 1 | 10 | 18 | 1200 | 800 | 0 | 0 |
| Giant, Fire | 90 | 90 | 0 | 8 | 8 | 1 | 11 | 19 | 1400 | 900 | 0 | 0 |
| Giant, Storm | 100 | 100 | -1 | 7 | 10 | 1 | 13 | 22 | 1600 | 1000 | 0 | 0 |
| Elemental, Earth | 90 | 90 | -2 | 4 | 8 | 1 | 15 | 40 | 1800 | 1500 | 0 | 1 |
| Troll | 50 | 50 | 2 | 11 | 4 | 5 | 2 | 8 | 1800 | 1500 | 0 | 0 |
| Dragon, Black | 100 | 100 | -3 | 4 | 9 | 3 | 3 | 12 | 6000 | 3000 | 0 | 1 |
| Dragon, Red | 150 | 150 | -5 | 3 | 9 | 3 | 3 | 18 | 12000 | 5000 | 0 | 2 |

## In-game message strings (CODE 5)

- A program error has occured.
- Sorry...
-  hit points.
- You character is already up to full hit points.
-  hit points of damage.
- Your strength has been increased.
- Your intelligence has been increased.
- Your Wisdom has been increased.
- Your dexterity has been increased.
- Your constitution has been increased.
- Your charisma has been increased.
- A program error has occured. Invalid constant used in the AttributeIncreased magic item field.
- This item has no special function. You benifit from this item by possesing it.
- Congratulations.
- You have been level drained by the undead creature. Your level and hit points have been reduced.
- You have been level drained by the undead creature. You have been reduced so far that you are now an undead.
- You need a more powerful magical weapon to hit this creature. Your only chance is to surrender.
-  gold pieces to surrender.
- You do not have enough gold to pay for the surrender penalty. The fight continues.
- You missed
- You are defensive
- You use an item
- You surrender
- You attempted to surrender.
- The creature missed
- You strike first
- The creature strikes first
