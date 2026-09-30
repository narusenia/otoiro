import { describe, expect, it } from 'vitest'
import { parseKey, parseNote, parseNotes } from './parse'
import { note } from './pitch'

describe('parseNote', () => {
  it('parses letters, accidentals and octaves', () => {
    expect(parseNote('C4')).toEqual(note(0, 0, 4))
    expect(parseNote('F#4')).toEqual(note(3, 1, 4))
    expect(parseNote('Bb3')).toEqual(note(6, -1, 3))
    expect(parseNote('C##5')).toEqual(note(0, 2, 5))
    expect(parseNote('Ebb2')).toEqual(note(2, -2, 2))
  })
  it('rejects garbage', () => {
    for (const bad of ['', 'H4', 'C', 'c4', 'C#b4', 'C4#']) expect(() => parseNote(bad)).toThrow(RangeError)
  })
})

describe('parseNotes', () => {
  it('splits on whitespace', () => {
    expect(parseNotes(' C4  E4\nG4 ')).toHaveLength(3)
    expect(parseNotes('')).toEqual([])
  })
})

describe('parseKey', () => {
  it('parses major and minor keys', () => {
    expect(parseKey('C')).toEqual({ letter: 0, accidental: 0, mode: 'major' })
    expect(parseKey('Bb')).toEqual({ letter: 6, accidental: -1, mode: 'major' })
    expect(parseKey('F#m')).toEqual({ letter: 3, accidental: 1, mode: 'minor' })
  })
  it('rejects garbage', () => {
    for (const bad of ['', 'H', 'c', 'Cbb', 'Cm#']) expect(() => parseKey(bad)).toThrow(RangeError)
  })
})
