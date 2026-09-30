import { describe, expect, it } from 'vitest'
import { letterName, noteName } from './notation'
import { note } from './pitch'

describe('noteName', () => {
  it('doremi', () => {
    expect(noteName(note(0), 'doremi')).toBe('ド')
    expect(noteName(note(3, 1), 'doremi')).toBe('ファ♯')
    expect(noteName(note(6, -1), 'doremi')).toBe('シ♭')
  })
  it('english with octave', () => {
    expect(noteName(note(5, 0, 4), 'english', true)).toBe('A4')
    expect(noteName(note(1, -2, 3), 'english', true)).toBe('D♭♭3')
  })
  it('hani prefixes 嬰/変', () => {
    expect(letterName(0, 1, 'hani')).toBe('嬰ハ')
    expect(letterName(6, -1, 'hani')).toBe('変ロ')
    expect(letterName(4, 2, 'hani')).toBe('重嬰ト')
  })
})
