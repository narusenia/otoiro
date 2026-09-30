import { describe, expect, it } from 'vitest'
import { chordNotes, chordSymbol, SEVENTH_TYPES, TRIAD_TYPES } from './chord'
import { midi, note } from './pitch'

const pcs = (ns: ReturnType<typeof chordNotes>) => ns.map((n) => midi(n) - midi(ns[0]))

describe('chordNotes', () => {
  it('triads have the right shape from C4', () => {
    expect(pcs(chordNotes(note(0), 'M'))).toEqual([0, 4, 7])
    expect(pcs(chordNotes(note(0), 'm'))).toEqual([0, 3, 7])
    expect(pcs(chordNotes(note(0), 'dim'))).toEqual([0, 3, 6])
    expect(pcs(chordNotes(note(0), 'aug'))).toEqual([0, 4, 8])
  })
  it('sevenths have the right shape from C4', () => {
    expect(pcs(chordNotes(note(0), 'M7'))).toEqual([0, 4, 7, 11])
    expect(pcs(chordNotes(note(0), '7'))).toEqual([0, 4, 7, 10])
    expect(pcs(chordNotes(note(0), 'm7'))).toEqual([0, 3, 7, 10])
    expect(pcs(chordNotes(note(0), 'm7b5'))).toEqual([0, 3, 6, 10])
    expect(pcs(chordNotes(note(0), 'dim7'))).toEqual([0, 3, 6, 9])
  })
  it('spells notes by letter (G7 has F♮, Bdim has F♮ not E♯)', () => {
    expect(chordNotes(note(4), '7').map((n) => [n.letter, n.accidental])).toEqual([[4, 0], [6, 0], [1, 0], [3, 0]])
    expect(chordNotes(note(6), 'dim').map((n) => [n.letter, n.accidental])).toEqual([[6, 0], [1, 0], [3, 0]])
  })
  it('inversions keep the pitch classes and raise the lowest notes', () => {
    const first = chordNotes(note(0), 'M', 1)
    expect(first.map(midi)).toEqual([64, 67, 72])
    const second = chordNotes(note(0), 'M', 2)
    expect(second.map(midi)).toEqual([67, 72, 76])
    const third = chordNotes(note(0), '7', 3)
    expect(third.map(midi)).toEqual([70, 72, 76, 79])
  })
  it('rejects out of range inversion', () => {
    expect(() => chordNotes(note(0), 'M', 3)).toThrow(RangeError)
  })
  it('exposes 4 triads and 5 sevenths', () => {
    expect(TRIAD_TYPES).toHaveLength(4)
    expect(SEVENTH_TYPES).toHaveLength(5)
  })
})

describe('chordSymbol', () => {
  it('names chords', () => {
    expect(chordSymbol(note(0), 'M')).toBe('C')
    expect(chordSymbol(note(5), 'm')).toBe('Am')
    expect(chordSymbol(note(4), '7')).toBe('G7')
    expect(chordSymbol(note(1), 'm7b5')).toBe('Dm7♭5')
    expect(chordSymbol(note(0), 'M', 1)).toBe('C/E')
  })
})
