import { describe, expect, it } from 'vitest'
import type { Key } from './key'
import { generateMelody } from './melody'

const C: Key = { letter: 0, accidental: 0, mode: 'major' }

/** 再現可能な乱数（mulberry32） */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

describe('generateMelody', () => {
  it('always satisfies length, degree set, leap limit and tonic ending', () => {
    const degrees = [1, 3, 5]
    for (let seed = 1; seed <= 200; seed++) {
      for (const [length, maxLeap] of [[3, 2], [5, 3], [8, 2], [8, 7]]) {
        const m = generateMelody({ key: C, length, degrees, maxLeap, rng: seeded(seed) })
        expect(m.steps).toHaveLength(length)
        expect(m.notes).toHaveLength(length)
        expect(m.degrees.every((d) => degrees.includes(d))).toBe(true)
        expect(m.degrees[length - 1]).toBe(1)
        for (let i = 1; i < length; i++) expect(Math.abs(m.steps[i] - m.steps[i - 1])).toBeLessThanOrEqual(maxLeap)
        expect(Math.min(...m.steps)).toBeGreaterThanOrEqual(0)
        expect(Math.max(...m.steps)).toBeLessThanOrEqual(7)
      }
    }
  })
  it('adds the tonic even if degrees omit it', () => {
    const m = generateMelody({ key: C, length: 4, degrees: [2, 3], maxLeap: 2, rng: seeded(7) })
    expect(m.degrees[3]).toBe(1)
  })
  it('avoids repeated notes when moving is possible', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const m = generateMelody({ key: C, length: 6, degrees: [1, 2, 3, 4, 5], maxLeap: 2, rng: seeded(seed) })
      for (let i = 1; i < m.steps.length; i++) expect(m.steps[i]).not.toBe(m.steps[i - 1])
    }
  })
  it('maps steps to notes in the key', () => {
    const m = generateMelody({ key: C, length: 3, degrees: [1, 2, 3], maxLeap: 2, rng: seeded(3) })
    m.notes.forEach((n, i) => expect(n.octave).toBe(4 + Math.floor(m.steps[i] / 7)))
  })
})
