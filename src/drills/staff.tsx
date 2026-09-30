import { Staff } from '@/components/Staff'
import { noteName } from '@/theory/notation'
import { parseNote } from '@/theory/parse'
import { midi } from '@/theory/pitch'
import { pickWeighted } from '@/theory/quiz'
import type { Drill } from './types'

/**
 * 五線譜の音符を鍵盤で答える。出題時は音を鳴らさない（答えが分かるため）。回答後に正解を鳴らす。
 * config.items: 出題する音（'C4' 'F#4' 'Bb3' 形式）
 * config.clef: 'treble'（既定）| 'bass'
 * config.fifths: 調号（正=♯の数、負=♭の数。既定 0）。items の綴りは調号に合わせて書く
 */
export const staffDrill: Drill = {
  makeQuestion(config, { weights, noteStyle, rng }) {
    const clef = (config.clef as 'treble' | 'bass' | undefined) ?? 'treble'
    const fifths = (config.fifths as number | undefined) ?? 0
    const itemId = pickWeighted(config.items.map((n) => `staff:${clef}:${n}`), weights, rng)
    const n = parseNote(itemId.slice(`staff:${clef}:`.length))
    const m = midi(n)
    return {
      itemId,
      play: [],
      prompt: <Staff notes={[n]} clef={clef} fifths={fifths} />,
      reveal: [[m]],
      answer: { kind: 'keys', correct: [m] },
      explanation: `${noteName(n, noteStyle, true)}`,
    }
  },
}
