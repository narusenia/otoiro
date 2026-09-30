import { letterName, type NoteNameStyle } from './notation'
import { above, type Interval } from './interval'
import { transpose, type Note } from './pitch'

export type ChordType = 'M' | 'm' | 'dim' | 'aug' | 'M7' | '7' | 'm7' | 'm7b5' | 'dim7'

const iv = (quality: Interval['quality'], number: number): Interval => ({ quality, number })

/** 根音からの構成音程（根音自身は含まない） */
const STRUCTURE: Record<ChordType, Interval[]> = {
  M: [iv('M', 3), iv('P', 5)],
  m: [iv('m', 3), iv('P', 5)],
  dim: [iv('m', 3), iv('d', 5)],
  aug: [iv('M', 3), iv('A', 5)],
  M7: [iv('M', 3), iv('P', 5), iv('M', 7)],
  '7': [iv('M', 3), iv('P', 5), iv('m', 7)],
  m7: [iv('m', 3), iv('P', 5), iv('m', 7)],
  m7b5: [iv('m', 3), iv('d', 5), iv('m', 7)],
  dim7: [iv('m', 3), iv('d', 5), iv('d', 7)],
}

export const TRIAD_TYPES: ChordType[] = ['M', 'm', 'dim', 'aug']
export const SEVENTH_TYPES: ChordType[] = ['M7', '7', 'm7', 'm7b5', 'dim7']

const SUFFIX: Record<ChordType, string> = {
  M: '', m: 'm', dim: 'dim', aug: 'aug', M7: 'M7', '7': '7', m7: 'm7', m7b5: 'm7♭5', dim7: 'dim7',
}

const NAME_JA: Record<ChordType, string> = {
  M: '長三和音', m: '短三和音', dim: '減三和音', aug: '増三和音',
  M7: '長七の和音', '7': '属七の和音', m7: '短七の和音', m7b5: '半減七の和音', dim7: '減七の和音',
}

export const chordTypeName = (t: ChordType): string => NAME_JA[t]

/** inversion 0=基本形, 1=第1転回形 … 転回のたびに最低音を 1 オクターブ上へ。返り値は低い音から順 */
export function chordNotes(root: Note, type: ChordType, inversion = 0): Note[] {
  const tones = [root, ...STRUCTURE[type].map((i) => above(root, i))]
  if (inversion < 0 || inversion >= tones.length) throw new RangeError('invalid inversion')
  const moved = tones.slice(0, inversion).map((n) => transpose(n, 7, 12))
  return [...tones.slice(inversion), ...moved]
}

/** コードネーム。転回形は分数コード表記（C/E） */
export function chordSymbol(root: Note, type: ChordType, inversion = 0, style: NoteNameStyle = 'english'): string {
  const base = letterName(root.letter, root.accidental, style) + SUFFIX[type]
  if (inversion === 0) return base
  const bass = chordNotes(root, type, inversion)[0]
  return `${base}/${letterName(bass.letter, bass.accidental, style)}`
}
