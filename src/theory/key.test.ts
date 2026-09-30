import { describe, expect, it } from 'vitest'
import { cadence, degreeNote, degreeOf, keySignature, movableDoName, type Key } from './key'
import { midi, note } from './pitch'

const C: Key = { letter: 0, accidental: 0, mode: 'major' }
const G: Key = { letter: 4, accidental: 0, mode: 'major' }
const Eb: Key = { letter: 2, accidental: -1, mode: 'major' }
const Am: Key = { letter: 5, accidental: 0, mode: 'minor' }

describe('keySignature', () => {
  it('majors', () => {
    expect(keySignature(C)).toBe(0)
    expect(keySignature(G)).toBe(1)
    expect(keySignature(Eb)).toBe(-3)
    expect(keySignature({ letter: 3, accidental: 1, mode: 'major' })).toBe(6) // F♯
    expect(keySignature({ letter: 0, accidental: -1, mode: 'major' })).toBe(-7) // C♭
  })
  it('minors', () => {
    expect(keySignature(Am)).toBe(0)
    expect(keySignature({ letter: 2, accidental: 0, mode: 'minor' })).toBe(1) // Em
    expect(keySignature({ letter: 0, accidental: 0, mode: 'minor' })).toBe(-3) // Cm
  })
  it('rejects impossible keys', () => {
    expect(() => keySignature({ letter: 4, accidental: 1, mode: 'major' })).toThrow(RangeError)
  })
})

describe('degreeNote', () => {
  it('major scale of G has F♯ as 7th', () => {
    expect(degreeNote(G, 7, 4)).toEqual(note(3, 1, 5))
    expect(degreeNote(G, 8, 4)).toEqual(note(4, 0, 5))
  })
  it('E♭ major spelling', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map((d) => degreeNote(Eb, d, 4).accidental)).toEqual([-1, 0, 0, -1, -1, 0, 0])
  })
  it('degrees below the tonic', () => {
    expect(degreeNote(C, 0, 4)).toEqual(note(6, 0, 3))
    expect(degreeNote(C, -1, 4)).toEqual(note(5, 0, 3))
  })
  it('natural minor', () => {
    expect(midi(degreeNote(Am, 3, 4))).toBe(72) // C5
    expect(midi(degreeNote(Am, 7, 4))).toBe(79) // G5
  })
})

describe('degreeOf', () => {
  it('finds diatonic degrees, rejects chromatic notes', () => {
    expect(degreeOf(G, note(3, 1, 4))).toBe(7)
    expect(degreeOf(G, note(3, 0, 4))).toBeNull()
  })
})

describe('movableDoName', () => {
  it('wraps around the octave', () => {
    expect(movableDoName(1)).toBe('ド')
    expect(movableDoName(5)).toBe('ソ')
    expect(movableDoName(8)).toBe('ド')
  })
})

describe('cadence', () => {
  it('C major is C – F – G – C', () => {
    expect(cadence(C).map((ch) => ch.map(midi))).toEqual([
      [60, 64, 67],
      [65, 69, 72],
      [67, 71, 74],
      [60, 64, 67],
    ])
  })
  it('G major V chord uses F♯', () => {
    expect(cadence(G)[2].map((n) => [n.letter, n.accidental])).toEqual([[1, 0], [3, 1], [5, 0]])
  })
  it('minor is unsupported', () => {
    expect(() => cadence(Am)).toThrow(RangeError)
  })
})
