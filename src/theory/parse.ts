import type { Letter, Note } from './pitch'

const LETTERS: Record<string, Letter> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }

/** "C4" "F#4" "Bb3" "C##5" "Ebb2" 形式。不正なら RangeError */
export function parseNote(text: string): Note {
  const m = /^([A-G])(#{1,2}|b{1,2})?(-?\d)$/.exec(text)
  if (!m) throw new RangeError(`invalid note: ${text}`)
  const acc = m[2] ? (m[2][0] === '#' ? m[2].length : -m[2].length) : 0
  return { letter: LETTERS[m[1]], accidental: acc, octave: Number(m[3]) }
}

/** 空白区切り。空文字は [] */
export const parseNotes = (text: string): Note[] => text.split(/\s+/).filter(Boolean).map(parseNote)
