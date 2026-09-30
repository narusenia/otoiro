import { describe, expect, it } from 'vitest'
import { midi, note, transpose } from './pitch'

describe('midi', () => {
  it('maps reference pitches', () => {
    expect(midi(note(0, 0, 4))).toBe(60)
    expect(midi(note(5, 0, 4))).toBe(69)
    expect(midi(note(0, 1, 4))).toBe(61)
    expect(midi(note(1, -1, 4))).toBe(61)
    expect(midi(note(0, -1, 4))).toBe(59)
  })
})

describe('transpose', () => {
  it('keeps spelling: C4 + major third = E4', () => {
    expect(transpose(note(0), 2, 4)).toEqual(note(2, 0, 4))
  })
  it('spells an augmented second, not a minor third: C4 -> D♯4', () => {
    expect(transpose(note(0), 1, 3)).toEqual(note(1, 1, 4))
  })
  it('crosses the octave boundary', () => {
    expect(transpose(note(6), 1, 1)).toEqual(note(0, 0, 5))
  })
  it('goes down', () => {
    expect(transpose(note(0, 0, 4), -1, -1)).toEqual(note(6, 0, 3))
  })
})
