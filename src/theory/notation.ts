import type { Letter, Note } from './pitch'

export type NoteNameStyle = 'doremi' | 'english' | 'hani'

const LETTERS: Record<NoteNameStyle, string[]> = {
  doremi: ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'],
  english: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  hani: ['ハ', 'ニ', 'ホ', 'ヘ', 'ト', 'イ', 'ロ'],
}

/** ハニホは 嬰ハ・変ロ のように前置、それ以外は後置の ♯♭ */
function withAccidental(letterName: string, accidental: number, style: NoteNameStyle): string {
  if (accidental === 0) return letterName
  if (style === 'hani') {
    const base = accidental > 0 ? '嬰' : '変'
    return (Math.abs(accidental) >= 2 ? '重' : '') + base + letterName
  }
  return letterName + (accidental > 0 ? '♯' : '♭').repeat(Math.abs(accidental))
}

export const letterName = (letter: Letter, accidental: number, style: NoteNameStyle): string =>
  withAccidental(LETTERS[style][letter], accidental, style)

/** octave=true で科学的音高表記の数字を付ける（C4 = 中央ド） */
export const noteName = (n: Note, style: NoteNameStyle, octave = false): string =>
  letterName(n.letter, n.accidental, style) + (octave ? String(n.octave) : '')
