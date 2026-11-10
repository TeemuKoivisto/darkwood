# Darkwood 1.2 rules, recovered from the 68k code

Everything below was read from the resource_dasm disassembly in `extracted/` (THINK Pascal, procedure
names are embedded after each routine). Offsets are into `CODE 5` unless stated. Data tables are in
`tables.md`. Original quirks and bugs are kept and marked **(quirk)**; a faithful port should reproduce them,
or deliberately fix them.

## Random numbers

`RandomNumber(lo, hi)` (CODE 7, "RANDOMNU"):

    r = abs(Random())            // QuickDraw Random, 16-bit LCG, -32767..32767
    x = r / 32767 * (hi - lo)    // SANE extended, stored to a single
    result = lo + trunc(x)       // CODE 1 helper sets rounding "toward zero" then converts

**(quirk)** Because the result is truncated, `hi` is only produced when `abs(Random()) == 32767`
(probability about 2 in 65535). In practice every range is uniform on `lo .. hi-1`: a "d20" is 1..19,
a "d10" is 1..9, a Long Sword does 1..7, a Potion of Healing heals 1..7, and natural 20s do not happen.

## Character

Fixed at creation ("INITCHAR", 0x3A4A). There is no stat rolling; the New Character dialog only asks
"Are you sure you want to abandon this character for another?".

| field | start | notes |
|---|---|---|
| name | Derek | |
| level / xp | 1 / 0 | max level 15 |
| hp / hp_max | 10 / 10 | |
| strength / percentile | 16 / 0 | percentile only moves via Tome of Strength at 18 |
| intelligence, wisdom | 13, 14 | unused by rules |
| dexterity | 15 | |
| constitution | 15 | |
| charisma | 12 | unused |
| attacks per round | 1 | |
| gold | 10 | |
| weapons | Dagger (current) | max 6 owned |
| armor | none | one slot |
| magic items | none | max 10 |

Derived values, recomputed when something changes:

- `THAC0(level) = 21 - level` (table for levels 1..15, "Can not determine THAC0" otherwise).
- `AttacksPerRound(level) = 1 if level <= 12 else 2`.
- `ToHitBonus(str, pct)`: 17 -> +1; 18 with pct 0..50 -> +1, 51..99 -> +2, 100 -> +3; otherwise 0.
- `ToDamageBonus(str, pct)`: 16 -> +1; 17 -> +1; 18 with pct 0 -> +2, 1..75 -> +3, 76..90 -> +4, 91..99 -> +5, 100 -> +6; otherwise 0.
- `DexACBonus(dex)`: 15 -> 1, 16 -> 2, 17 -> 3, 18 -> 4, otherwise 0.
- `ConHitPoints(con)`: 15 -> 1, 16 -> 2, 17 -> 3, 18 -> 4, otherwise 0.
- `AC = 10 + armor.ac_modifier - DexACBonus - sum(owned magic item ac_bonus)` ("CALCULAT", 0x16DC).

Experience needed for level N ("MINXPFOR" / "LEVELEAR"): 2: 2000, 3: 4000, 4: 8000, 5: 16000, 6: 32000,
7: 64000, 8: 125000, 9: 250000, 10: 500000, 11: 750000, 12: 1000000, 13: 1250000, 14: 1500000,
15: 1750000. These are the AD&D 2e fighter numbers.

Level advancement ("CHECKAND", 0x31C6) runs after every creature kill:

    new = LevelEarned(xp)
    if new > level and level < 15:
        for each level gained: g = RandomNumber(1,10) + ConHitPoints; hp_max += g; hp += g
        thac0 = THAC0(level); attacks = AttacksPerRound(level)
        dialog "You advance to level N. Your character has gained G hit points."  (sound: New Level)
        if level == 15: "Your character has reached the maximum allowed level."

## Combat

A fight is against a fresh copy of the creature template. Each click in the Combat dialog runs one
round via `DoRound(action)` (0x506A), which first clears the surrender flag and the four counters
(player hits, player damage, creature hits, creature damage), then:

**Fight** (0x4D72)

    p = RandomNumber(1,10) + weapon.speed - weapon.magic_bonus
    c = RandomNumber(1,10) + creature.level
    player strikes first if p <= c
    first attacker attacks; if the other is still alive it attacks back

Clicking Fight also resets the defensive bonus to 0 before the round (CODE 4, 0x15E0).

**Defensive** (0x4E00): `defensive_bonus = max(1, level div 2)`. Initiative is rolled and announced but
the player does not attack; the creature attacks with the bonus subtracted from its target number.
**(quirk)** The bonus is only cleared by the next Fight click, so it also protects during Use rounds.

**Use** (0x4E82): item picker; if an item was chosen it is used (see Magic items) and then the creature attacks.

**Surrender** (0x4EC2): `penalty = trunc(creature.gold * 0.1)`. If `penalty > gold`: "You do not have
enough gold to pay for the surrender penalty. The fight continues." and nothing else happens this round
(the creature does not attack). Otherwise `gold -= penalty` and the fight ends.

**Player attack** ("PLAYERHA", 0x4BA8), repeated `attacks_per_round` times:

    needed = (thac0 - ToHitBonus + weapon.magic_bonus) - creature.ac     // (quirk) + not -
    roll   = RandomNumber(1,20)
    hit    = (roll >= needed or roll == 20) and roll != 1
    if hit and weapon.magic_bonus >= creature.needs_magic_weapon:
        dmg = RandomNumber(weapon.dmg_min, weapon.dmg_max) + weapon.magic_bonus + ToDamageBonus
        (no weapon owned: dmg = RandomNumber(1,2) + ToDamageBonus)
        creature.hp -= dmg; sound HitOnCreature; hits++, total += dmg
    else: sound Missed
    if weapon.magic_bonus < creature.needs_magic_weapon:
        "You need a more powerful magical weapon to hit this creature. Your only chance is to surrender."

**(quirk)** A magic weapon's bonus is *added* to the target number, so a +3 sword is harder to hit with
than a plain one. It still adds to damage and is needed against creatures with `needs_magic_weapon`.

**Creature attack** ("CREATURE", 0x4CDA), repeated `creature.attacks` times:

    needed = creature.thac0 - (character.ac - defensive_bonus)
    same roll rule as above
    if hit: sound HitOnPlayer; dmg = RandomNumber(creature.dmg_min, creature.dmg_max); hp -= dmg
            if creature.level_drain > 0: DoLevelDrain(creature.level_drain)
            if hp <= 0: hp = 0; sound Oouch; death dialog; stop

**Level drain** ("DOLEVELD", 0x4386), n = creature.level_drain:

    if level - n < 1: level -= 1; hp = 0; "...reduced so far that you are now an undead" (death)
    else: level -= 1                      // (quirk) only one level regardless of n
          xp = MinXPForLevel(level)
          n times: d = RandomNumber(1,10); hp_max -= d; hp -= d
          "You have been level drained by the undead creature. Your level and hit points have been reduced."
    // (quirk) THAC0 and attacks per round are not recalculated after a drain

**Creature death** ("DOCREATU", 0x4534), checked after the player's attacks when `creature.hp <= 0`:
`gold += creature.gold; xp += creature.xp` (doubled if the Option key is held, a leftover debug cheat),
"You have been awarded G gold pieces and X experience points. You have defeated your opponent.",
then level advancement. Killing "Dragon, Red" additionally shows "You have been awarded the position of
Captain of the Guard. You have won the game."

**Round summary** shown after every round: "You hit N time for M points." / "You missed" /
"You are defensive" / "You use an item" / "You surrender" / "You attempted to surrender." and
"The creature hit N time for M points." / "The creature missed".

## Shops and inn

- **Weapons**: buy if `cost <= gold` and fewer than 6 owned. Sell returns `cost div 2`, except
  weapons costing 1 (Club, Dagger, Hand Axe, Quarterstaff) return nothing. Selling the current weapon
  makes weapon 1 current.
- **Armor**: one slot, buying replaces it if `cost <= gold`. No sell routine exists for armor.
- **Magic items**: buy if `cost <= gold`, fewer than 10 owned, not already owned, and at most one
  AC-altering item (the rings). Sell returns `cost div 2`.
- **Inn** ("For each night you stay you are healed 1 hit point."):
  "Stay 1 Night": costs 1 gold, heals 1 hp (refused at full hp or with no gold).
  "Stay Until Healed": costs `hp_max - hp` gold and heals fully. If you cannot afford it the code
  **(bug)** zeroes your gold *before* adding it to hp, so you lose all your gold and heal nothing
  ("You did not have enough gold to heal fully.").

## Magic items (use)

Item kind is decided by which fields are non-zero:

- `heal_max > 0` (potions of healing): usable anywhere. At full hp: "You character is already up to
  full hit points." Else `hp = min(hp_max, hp + RandomNumber(heal_min, heal_max))`, consume a charge.
- `dmg_max > 0` (Fiery Breath, wands): combat only ("This item can only be used in combat.").
  `creature.hp -= RandomNumber(dmg_min, dmg_max)`, always hits, consume a charge.
- `attribute_raised > 0` (tomes): stat below 18 -> +1. Strength already 18 -> percentile += 10
  (capped at 100). Otherwise "already at max". Consume a charge. Hit and damage bonuses are recomputed.
- Rings: "This item has no special function. You benifit from this item by possesing it."

Consuming a charge ("REMOVEMA", 0x2280): `charges > 1` -> `charges -= 1`, else the item is removed
and AC recalculated. Wands start with 10 charges, potions and tomes with 1.

## Sounds

| snd | played when |
|---|---|
| 512 HitOnPlayer | creature hits the player |
| 513 Missed | player misses |
| 514 HitOnCreature | player hits |
| 515 New Level | level advancement |
| 516 Oouch | player dies |

## Open points

- `LevelEarned` caps at 15 for xp >= 1,750,000; nothing stops xp growing past 2,000,000.
- Whether the Opponent dialog restricts which creature can be chosen was not checked; it shows every
  creature with HP, AC, attacks, damage, XP, award, surrender penalty and magic weapon requirement.
- `DLOG 130 "Director Dialog"` and `DLOG 513 "Debug Window"` were not examined.
