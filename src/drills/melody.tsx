import { Staff } from '@/components/Staff'
import { degreeColor } from '@/lib/pitch-color'
import { keySignature, movableDoName } from '@/theory/key'
import { generateMelody } from '@/theory/melody'
import { midi } from '@/theory/pitch'
import { cadenceSteps, pickKey } from './tonal'
import type { Drill } from './types'

/**
 * カデンツで調を示したあとメロディを鳴らし、聞こえた通りに鍵盤で弾いて答える。
 * config.items: 使用する度数（'1'〜'7'。主音は終止音として常に使われる）
 * config.length: 音数（3〜8、既定 4）
 * config.maxLeap: 隣接音の最大跳躍（音階上のステップ数、既定 2）
 * config.keys: 出題する長調名（既定 C G D F Bb）
 */
export const melodyDrill: Drill = {
  makeQuestion(config, { rng }) {
    const key = pickKey(config, rng)
    const length = (config.length as number | undefined) ?? 4
    const maxLeap = (config.maxLeap as number | undefined) ?? 2
    const melody = generateMelody({ key, length, degrees: config.items.map(Number), maxLeap, rng })
    const midis = melody.notes.map(midi)
    return {
      itemId: `melody:${length}`,
      play: [...cadenceSteps(key), ...midis.map((m) => [m])],
      reveal: [...cadenceSteps(key), ...midis.map((m) => [m])],
      answer: { kind: 'keys', correct: midis },
      revealView: (
        <Staff notes={melody.notes} fifths={keySignature(key)} colors={melody.degrees.map(degreeColor)} />
      ),
      explanation: melody.degrees.map(movableDoName).join(' → '),
    }
  },
}
