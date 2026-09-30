import { midi, transpose, type Note } from './pitch'

export type Quality = 'P' | 'M' | 'm' | 'A' | 'd'

/** number は度数（1度=1 … 8度=8 … 13度=13）。9度以上は複音程 */
export type Interval = { quality: Quality; number: number }

const PERFECT_BASE: Record<number, number> = { 1: 0, 4: 5, 5: 7 }
const MAJOR_BASE: Record<number, number> = { 2: 2, 3: 4, 6: 9, 7: 11 }

const simple = (number: number) => ((number - 1) % 7) + 1
const octaves = (number: number) => Math.floor((number - 1) / 7)

export const semitones = ({ quality, number }: Interval): number => {
  const s = simple(number)
  const oct = 12 * octaves(number)
  if (s in PERFECT_BASE) {
    const delta = { P: 0, A: 1, d: -1, M: NaN, m: NaN }[quality]
    if (Number.isNaN(delta)) throw new RangeError(`${quality}${number} is not a valid interval`)
    return oct + PERFECT_BASE[s] + delta
  }
  const delta = { M: 0, m: -1, A: 1, d: -2, P: NaN }[quality]
  if (Number.isNaN(delta)) throw new RangeError(`${quality}${number} is not a valid interval`)
  return oct + MAJOR_BASE[s] + delta
}

export const above = (n: Note, i: Interval): Note => transpose(n, i.number - 1, semitones(i))
export const below = (n: Note, i: Interval): Note => transpose(n, -(i.number - 1), -semitones(i))

/** low → high の上行音程。2 音が同じ高さ以下、または倍増減の場合は RangeError */
export function intervalBetween(low: Note, high: Note): Interval {
  const number = high.octave * 7 + high.letter - (low.octave * 7 + low.letter) + 1
  const semis = midi(high) - midi(low)
  if (number < 1) throw new RangeError('high must not be below low')
  const s = simple(number)
  const diff = semis - 12 * octaves(number) - (s in PERFECT_BASE ? PERFECT_BASE[s] : MAJOR_BASE[s])
  const table: Record<number, Quality> =
    s in PERFECT_BASE ? { 0: 'P', 1: 'A', [-1]: 'd' } : { 0: 'M', [-1]: 'm', 1: 'A', [-2]: 'd' }
  const quality = table[diff]
  if (!quality) throw new RangeError('unsupported interval quality')
  return { quality, number }
}

const QUALITY_JA: Record<Quality, string> = { P: '完全', M: '長', m: '短', A: '増', d: '減' }
export const intervalName = ({ quality, number }: Interval): string => `${QUALITY_JA[quality]}${number}度`

const iv = (quality: Quality, number: number): Interval => ({ quality, number })

/** 1 オクターブ内の識別対象。増4度=減5度は増4度に統一（三全音） */
export const SIMPLE_INTERVALS: Interval[] = [
  iv('m', 2), iv('M', 2), iv('m', 3), iv('M', 3), iv('P', 4), iv('A', 4),
  iv('P', 5), iv('m', 6), iv('M', 6), iv('m', 7), iv('M', 7), iv('P', 8),
]

/** 複音程 9〜13 度 */
export const COMPOUND_INTERVALS: Interval[] = [
  iv('m', 9), iv('M', 9), iv('m', 10), iv('M', 10), iv('P', 11), iv('P', 12), iv('m', 13), iv('M', 13),
]
