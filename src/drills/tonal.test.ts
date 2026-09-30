import { describe, expect, it } from 'vitest'
import { degreeDrill } from './degree'
import { melodyDrill } from './melody'
import { pickKey } from './tonal'

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const ctx = (seed: number) => ({ weights: {}, noteStyle: 'doremi' as const, rng: seeded(seed) })
const MAJOR = [0, 2, 4, 5, 7, 9, 11]

describe('pickKey', () => {
  it('picks only configured major keys', () => {
    for (let s = 1; s <= 30; s++) {
      const k = pickKey({ type: 'degree', items: ['1'], keys: ['G', 'Eb'] }, seeded(s))
      expect(['G', 'Eb'].some((n) => n === 'G' ? k.letter === 4 && k.accidental === 0 : k.letter === 2 && k.accidental === -1)).toBe(true)
    }
  })
  it('rejects minor keys and keys with more than 7 accidentals', () => {
    expect(() => pickKey({ type: 'degree', items: ['1'], keys: ['Am'] }, () => 0)).toThrow(RangeError)
    expect(() => pickKey({ type: 'degree', items: ['1'], keys: ['G#'] }, () => 0)).toThrow(RangeError)
  })
})

describe('degreeDrill', () => {
  it('plays a cadence then the target degree of that key', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const q = degreeDrill.makeQuestion({ type: 'degree', items: ['1', '2', '3', '4', '5', '6', '7'] }, ctx(seed))
      if (q.answer.kind !== 'choice') throw new Error('expected choice')
      expect(q.play).toHaveLength(5)
      const tonic = q.play[0][0]
      const target = q.play[4][0]
      const degree = Number(q.answer.correctId)
      expect(((target - tonic) % 12 + 12) % 12).toBe(MAJOR[degree - 1])
      expect(q.itemId).toBe(`degree:${degree}`)
    }
  })
  it('labels choices in movable do', () => {
    const q = degreeDrill.makeQuestion({ type: 'degree', items: ['1', '3', '5'] }, ctx(1))
    if (q.answer.kind !== 'choice') throw new Error('expected choice')
    expect(q.answer.choices.map((c) => c.label)).toEqual(['ド', 'ミ', 'ソ'])
  })
})

describe('melodyDrill', () => {
  const cfg = { type: 'melody' as const, items: ['1', '2', '3', '5'], length: 4, maxLeap: 2 }
  it('plays cadence + melody, expects the melody as keys, ends on the tonic', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const q = melodyDrill.makeQuestion(cfg, ctx(seed))
      if (q.answer.kind !== 'keys') throw new Error('expected keys')
      expect(q.answer.correct).toHaveLength(4)
      expect(q.play).toHaveLength(4 + 4)
      expect(q.play.slice(4).map((s) => s[0])).toEqual(q.answer.correct)
      const tonic = q.play[0][0]
      const last = q.answer.correct[3]
      expect(((last - tonic) % 12 + 12) % 12).toBe(0)
      for (const m of q.answer.correct) expect(MAJOR).toContain(((m - tonic) % 12 + 12) % 12)
      expect(q.revealView).toBeTruthy()
    }
  })
})
