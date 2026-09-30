import { describe, expect, it } from 'vitest'
import { above, below, COMPOUND_INTERVALS, intervalBetween, intervalName, SIMPLE_INTERVALS, semitones } from './interval'
import { midi, note } from './pitch'

describe('semitones', () => {
  it('simple intervals', () => {
    expect(semitones({ quality: 'm', number: 2 })).toBe(1)
    expect(semitones({ quality: 'P', number: 5 })).toBe(7)
    expect(semitones({ quality: 'A', number: 4 })).toBe(6)
    expect(semitones({ quality: 'd', number: 7 })).toBe(9)
    expect(semitones({ quality: 'P', number: 8 })).toBe(12)
  })
  it('compound intervals add octaves', () => {
    expect(semitones({ quality: 'M', number: 9 })).toBe(14)
    expect(semitones({ quality: 'M', number: 13 })).toBe(21)
  })
  it('rejects invalid quality for the number', () => {
    expect(() => semitones({ quality: 'M', number: 5 })).toThrow(RangeError)
    expect(() => semitones({ quality: 'P', number: 3 })).toThrow(RangeError)
  })
})

describe('above / below', () => {
  it('spells correctly', () => {
    expect(above(note(0), { quality: 'M', number: 3 })).toEqual(note(2, 0, 4))
    expect(above(note(0), { quality: 'A', number: 4 })).toEqual(note(3, 1, 4))
    expect(above(note(6, 0, 4), { quality: 'P', number: 5 })).toEqual(note(3, 1, 5))
  })
  it('below is the mirror', () => {
    expect(below(note(0, 0, 4), { quality: 'M', number: 3 })).toEqual(note(5, -1, 3))
  })
})

describe('intervalBetween', () => {
  it('round-trips every trainable interval from every white key', () => {
    for (const i of [...SIMPLE_INTERVALS, ...COMPOUND_INTERVALS]) {
      for (const letter of [0, 1, 2, 3, 4, 5, 6] as const) {
        const low = note(letter, 0, 3)
        const high = above(low, i)
        if (Math.abs(high.accidental) > 1) continue // 二重変化記号は対象外
        expect(intervalBetween(low, high)).toEqual(i)
        expect(midi(high) - midi(low)).toBe(semitones(i))
      }
    }
  })
  it('distinguishes A2 from m3', () => {
    expect(intervalBetween(note(0), note(1, 1))).toEqual({ quality: 'A', number: 2 })
    expect(intervalBetween(note(0), note(2, -1))).toEqual({ quality: 'm', number: 3 })
  })
})

describe('intervalName', () => {
  it('formats japanese names', () => {
    expect(intervalName({ quality: 'm', number: 3 })).toBe('短3度')
    expect(intervalName({ quality: 'P', number: 5 })).toBe('完全5度')
  })
})
