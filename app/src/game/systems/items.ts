/** Using a magic item, `notes/rules.md` "Magic items (use)". In combat `useItemRound` calls it. */
import { updateCharacter, updateFight } from '../maps'
import { randomNumber } from '../rng'
import type { Character, GameCtx, GameSys, MagicItem } from '../types'

export const FULL_HP = 'You character is already up to full hit points.'
export const COMBAT_ONLY = 'This item can only be used in combat.'
export const NO_FUNCTION =
  'This item has no special function. You benifit from this item by possesing it.'
// ASSUMPTION: the "already at max" text of a tome was not recovered
export const ATTRIBUTE_AT_MAX = 'Sorry... That attribute is already at its maximum.'

/** The stat a tome raises, by `attribute_raised`, with its message from CODE 5. */
const ATTRIBUTES: Record<number, { key: keyof Character; message: string }> = {
  1: { key: 'strength', message: 'Your strength has been increased.' },
  2: { key: 'intelligence', message: 'Your intelligence has been increased.' },
  3: { key: 'wisdom', message: 'Your Wisdom has been increased.' },
  4: { key: 'dexterity', message: 'Your dexterity has been increased.' },
  5: { key: 'constitution', message: 'Your constitution has been increased.' },
  6: { key: 'charisma', message: 'Your charisma has been increased.' },
}

function notice(ctx: GameCtx, text: string) {
  ctx.state.alerts = [...ctx.state.alerts, text]
}

/** "REMOVEMA": more than one charge left loses one, the last one takes the item away. */
function consumeCharge(items: MagicItem[], item: MagicItem): MagicItem[] {
  if (item.charges > 1) return items.map(i => (i === item ? { ...i, charges: i.charges - 1 } : i))
  return items.filter(i => i !== item)
}

export const useMagicItem: GameSys<{ item: string }> = (ctx, { item: name }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  const item = c.magicItems.find(i => i.name === name)
  if (!item) return { err: 'No such item' }
  const { maps } = ctx.state

  if (item.heal_max > 0) {
    if (c.hp >= c.hpMax) return { err: FULL_HP }
    const healed = randomNumber(ctx.rng, item.heal_min, item.heal_max)
    updateCharacter(maps, c.id, {
      hp: Math.min(c.hpMax, c.hp + healed),
      magicItems: consumeCharge(c.magicItems, item),
    })
    // ASSUMPTION: only the tail " hit points." of this message survives in CODE 5
    notice(ctx, `You have been healed ${healed} hit points.`)
    return
  }

  if (item.dmg_max > 0) {
    const fight = ctx.state.fight
    if (!fight || fight.outcome !== 'ongoing') return { err: COMBAT_ONLY }
    // Always hits, whatever the creature's armor or magic weapon requirement
    const damage = randomNumber(ctx.rng, item.dmg_min, item.dmg_max)
    updateFight(maps, c.id, { creature: { ...fight.creature, hp: fight.creature.hp - damage } })
    updateCharacter(maps, c.id, { magicItems: consumeCharge(c.magicItems, item) })
    // ASSUMPTION: only the tail " hit points of damage." of this message survives in CODE 5
    notice(ctx, `The creature took ${damage} hit points of damage.`)
    return
  }

  const attribute = ATTRIBUTES[item.attribute_raised]
  if (attribute) {
    const value = c[attribute.key] as number
    let patch: Partial<Character>
    if (value < 18) patch = { [attribute.key]: value + 1 }
    else if (attribute.key === 'strength' && c.strengthPct < 100) {
      patch = { strengthPct: Math.min(100, c.strengthPct + 10) }
    } else return { err: ATTRIBUTE_AT_MAX }
    // The hit and damage bonuses are derived from strength, so they follow by themselves
    updateCharacter(maps, c.id, { ...patch, magicItems: consumeCharge(c.magicItems, item) })
    notice(ctx, attribute.message)
    return
  }

  return { err: NO_FUNCTION }
}
