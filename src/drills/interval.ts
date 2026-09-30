import { above, below, intervalName, type Interval, type Quality } from '@/theory/interval'
import { midi, note, type Letter } from '@/theory/pitch'
import { pickWeighted } from '@/theory/quiz'
import type { Drill } from './types'

/** 'P5' 'm3' 'M13' → Interval */
export function parseIntervalId(id: string): Interval {
  const m = /^([PMmAd])(\d{1,2})$/.exec(id)
  if (!m) throw new RangeError(`invalid interval id: ${id}`)
  return { quality: m[1] as Quality, number: Number(m[2]) }
}

/**
 * config.items: 出題する音程 id の一覧
 * config.direction: 'up'（既定）| 'down' | 'harmonic'
 */
export const intervalDrill: Drill = {
  makeQuestion(config, { weights, rng }) {
    const ids = config.items
    const itemId = pickWeighted(
      ids.map((id) => `interval:${id}`),
      weights,
      rng,
    )
    const id = itemId.slice('interval:'.length)
    const interval = parseIntervalId(id)
    const direction = (config.direction as string | undefined) ?? 'up'

    const base = note(Math.floor(rng() * 7) as Letter, 0, 4)
    const other = direction === 'down' ? below(base, interval) : above(base, interval)
    const play =
      direction === 'harmonic' ? [[midi(base), midi(other)]] : [[midi(base)], [midi(other)]]

    return {
      itemId,
      play,
      answer: {
        kind: 'choice',
        choices: ids.map((x) => ({ id: x, label: intervalName(parseIntervalId(x)) })),
        correctId: id,
      },
      explanation: `${intervalName(interval)}（半音 ${Math.abs(midi(other) - midi(base))} つ分）`,
    }
  },
}
