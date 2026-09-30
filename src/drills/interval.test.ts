import { describe, expect, it } from 'vitest'
import { intervalDrill, parseIntervalId } from './interval'
import { semitones } from '@/theory/interval'

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const ctx = (seed: number, weights = {}) => ({ weights, noteStyle: 'doremi' as const, rng: seeded(seed) })
const cfg = (direction?: string) => ({ type: 'interval' as const, items: ['P5', 'm3', 'M13'], direction })

describe('parseIntervalId', () => {
  it('parses and rejects', () => {
    expect(parseIntervalId('m3')).toEqual({ quality: 'm', number: 3 })
    expect(parseIntervalId('M13')).toEqual({ quality: 'M', number: 13 })
    expect(() => parseIntervalId('x3')).toThrow(RangeError)
  })
})

describe('intervalDrill', () => {
  it('plays the asked interval in the requested direction', () => {
    for (let seed = 1; seed <= 100; seed++) {
      for (const dir of ['up', 'down', 'harmonic']) {
        const q = intervalDrill.makeQuestion(cfg(dir), ctx(seed))
        if (q.answer.kind !== 'choice') throw new Error('expected choice')
        const semis = semitones(parseIntervalId(q.answer.correctId))
        const [a, b] = dir === 'harmonic' ? q.play[0] : [q.play[0][0], q.play[1][0]]
        expect(Math.abs(b - a)).toBe(semis)
        if (dir === 'up') expect(b).toBeGreaterThan(a)
        if (dir === 'down') expect(b).toBeLessThan(a)
        expect(q.itemId).toBe(`interval:${q.answer.correctId}`)
      }
    }
  })
  it('offers the configured items in order, correct answer among them', () => {
    const q = intervalDrill.makeQuestion(cfg(), ctx(1))
    if (q.answer.kind !== 'choice') throw new Error('expected choice')
    expect(q.answer.choices.map((c) => c.id)).toEqual(['P5', 'm3', 'M13'])
    expect(q.answer.choices.map((c) => c.label)).toEqual(['完全5度', '短3度', '長13度'])
  })
  it('asks a weak item much more often', () => {
    let hits = 0
    for (let seed = 1; seed <= 600; seed++) {
      const q = intervalDrill.makeQuestion(cfg(), ctx(seed, { 'interval:m3': 8 }))
      if (q.itemId === 'interval:m3') hits++
    }
    expect(hits / 600).toBeGreaterThan(0.6)
  })
})
