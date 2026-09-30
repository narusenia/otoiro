import { transpose, type Letter, type Note } from './pitch'

export type Mode = 'major' | 'minor'

/** 主音と旋法。tonic の octave は使わない（綴りだけ） */
export type Key = { letter: Letter; accidental: number; mode: Mode }

const SCALE: Record<Mode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10], // 自然的短音階
}

// F C G D A E B の並び上での C D E F G A B の位置
const FIFTHS_OF_LETTER = [0, 2, 4, -1, 1, 3, 5]

/** 調号。正=♯の数、負=♭の数。7 を超える調（例: 嬰ト長調）は RangeError */
export function keySignature(key: Key): number {
  const fifths = FIFTHS_OF_LETTER[key.letter] + 7 * key.accidental - (key.mode === 'minor' ? 3 : 0)
  if (Math.abs(fifths) > 7) throw new RangeError('key has more than 7 sharps/flats')
  return fifths
}

/**
 * degree 番目の音（1 = 主音、8 = 1 オクターブ上の主音、0 以下は下）。
 * tonicOctave は主音のオクターブ。
 */
export function degreeNote(key: Key, degree: number, tonicOctave = 4): Note {
  const steps = degree - 1
  const oct = Math.floor(steps / 7)
  const semis = 12 * oct + SCALE[key.mode][((steps % 7) + 7) % 7]
  return transpose({ letter: key.letter, accidental: key.accidental, octave: tonicOctave }, steps, semis)
}

// ponytail: 移動ドは長調前提（短調は主音=ラ読みなど流儀が分かれるため未対応）
export const MOVABLE_DO = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ']
export const movableDoName = (degree: number): string => MOVABLE_DO[(((degree - 1) % 7) + 7) % 7]

/** 音階上の度数(1〜7)。音階外は null */
export function degreeOf(key: Key, n: Note): number | null {
  const steps = (((n.letter - key.letter) % 7) + 7) % 7
  const expected = degreeNote(key, steps + 1, n.octave)
  return expected.letter === n.letter && expected.accidental === n.accidental ? steps + 1 : null
}

/** 長調の I–IV–V–I。各和音は根音位置・主音オクターブ基準（声部連結は行わない） */
export function cadence(key: Key, tonicOctave = 4): Note[][] {
  if (key.mode !== 'major') throw new RangeError('cadence supports major keys only')
  return [1, 4, 5, 1].map((root) => [0, 2, 4].map((k) => degreeNote(key, root + k, tonicOctave)))
}
