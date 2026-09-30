import { describe, expect, it } from 'vitest'
import { chordDrill, parseChordType } from './chord'

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const ctx = (seed: number, weights = {}) => ({ weights, noteStyle: 'doremi' as const, rng: seeded(seed) })

describe('parseChordType', () => {
  it('accepts the nine types and rejects others', () => {
    for (const t of ['M', 'm', 'dim', 'aug', 'M7', '7', 'm7', 'm7b5', 'dim7']) expect(parseChordType(t)).toBe(t)
    expect(() => parseChordType('sus4')).toThrow(RangeError)
  })
})

describe('chordDrill type mode', () => {
  const cfg = { type: 'chord' as const, items: ['M', 'm', 'dim', 'aug'] }
  it('plays the chord that matches the correct answer', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const q = chordDrill.makeQuestion(cfg, ctx(seed))
      if (q.answer.kind !== 'choice') throw new Error('expected choice')
      expect(q.play).toHaveLength(1)
      const midis = q.play[0]
      const intervals = midis.map((m) => m - midis[0])
      const expected = { M: [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8] }[q.answer.correctId as 'M']
      expect(intervals).toEqual(expected)
      expect(q.itemId).toBe(`chord:${q.answer.correctId}`)
    }
  })
  it('lists the configured items as choices', () => {
    const q = chordDrill.makeQuestion(cfg, ctx(1))
    if (q.answer.kind !== 'choice') throw new Error('expected choice')
    expect(q.answer.choices.map((c) => c.label)).toEqual(['長三和音', '短三和音', '減三和音', '増三和音'])
  })
})

describe('chordDrill inversion mode', () => {
  const cfg = { type: 'chord' as const, mode: 'inversion', items: ['0', '1', '2'], chordTypes: ['M', 'm'] }
  it('plays the requested inversion (interval pattern from the lowest note)', () => {
    const patterns: Record<number, string[]> = {
      0: ['0,4,7', '0,3,7'], // 長・短三和音 基本形
      1: ['0,3,8', '0,4,9'], // 第1転回形
      2: ['0,5,9', '0,5,8'], // 第2転回形
    }
    for (let seed = 1; seed <= 100; seed++) {
      const q = chordDrill.makeQuestion(cfg, ctx(seed))
      if (q.answer.kind !== 'choice') throw new Error('expected choice')
      const inv = Number(q.answer.correctId)
      const midis = q.play[0]
      expect(patterns[inv]).toContain(midis.map((m) => m - midis[0]).join(','))
      expect(q.itemId).toBe(`chord-inv:${inv}`)
    }
  })
  it('labels inversions in japanese', () => {
    const q = chordDrill.makeQuestion(cfg, ctx(2))
    if (q.answer.kind !== 'choice') throw new Error('expected choice')
    expect(q.answer.choices.map((c) => c.label)).toEqual(['基本形', '第1転回形', '第2転回形'])
  })
})
