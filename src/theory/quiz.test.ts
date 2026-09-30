import { describe, expect, it } from 'vitest'
import { DEFAULT_WEIGHT, isPassed, nextWeight, pickWeighted, updateWeights } from './quiz'

describe('weights', () => {
  it('doubles on a miss up to a cap, decays on a hit down to a floor', () => {
    expect(nextWeight(1, false)).toBe(2)
    expect(nextWeight(6, false)).toBe(8)
    expect(nextWeight(1, true)).toBeCloseTo(0.7)
    expect(nextWeight(0.3, true)).toBe(0.3)
  })
  it('updateWeights is immutable and defaults unknown ids', () => {
    const w = { a: 2 }
    const next = updateWeights(w, 'b', false)
    expect(next).toEqual({ a: 2, b: DEFAULT_WEIGHT * 2 })
    expect(w).toEqual({ a: 2 })
  })
})

describe('pickWeighted', () => {
  it('follows the weights at the boundaries', () => {
    const items = ['a', 'b']
    const w = { a: 1, b: 3 } // a: [0,0.25) b: [0.25,1)
    expect(pickWeighted(items, w, () => 0)).toBe('a')
    expect(pickWeighted(items, w, () => 0.24)).toBe('a')
    expect(pickWeighted(items, w, () => 0.26)).toBe('b')
    expect(pickWeighted(items, w, () => 0.999)).toBe('b')
  })
  it('picks weak items far more often', () => {
    let seed = 42
    const rng = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
    const counts = { a: 0, b: 0 }
    for (let i = 0; i < 4000; i++) counts[pickWeighted(['a', 'b'], { b: 4 }, rng) as 'a' | 'b']++
    expect(counts.b / counts.a).toBeGreaterThan(3)
  })
  it('rejects an empty list', () => {
    expect(() => pickWeighted([], {})).toThrow(RangeError)
  })
})

describe('isPassed', () => {
  const run = (correct: number, total = 10) => Array.from({ length: total }, (_, i) => i < correct)
  it('needs 8 of 10', () => {
    expect(isPassed(run(8))).toBe(true)
    expect(isPassed(run(10))).toBe(true)
    expect(isPassed(run(7))).toBe(false)
  })
  it('is not passed before 10 answers', () => {
    expect(isPassed(run(8, 8))).toBe(false)
  })
})
