import { degreeNote, movableDoName } from '@/theory/key'
import { midi } from '@/theory/pitch'
import { pickWeighted } from '@/theory/quiz'
import { cadenceSteps, pickKey } from './tonal'
import type { Drill } from './types'

/**
 * カデンツで調を示したあと 1 音を鳴らし、調の中で何番目の音かを移動ドで答える。
 * config.items: 出題する度数（'1'〜'7'）
 * config.keys: 出題する長調名（既定 C G D F Bb）
 */
export const degreeDrill: Drill = {
  makeQuestion(config, { weights, rng }) {
    const key = pickKey(config, rng)
    const itemId = pickWeighted(config.items.map((d) => `degree:${d}`), weights, rng)
    const degree = Number(itemId.slice('degree:'.length))
    const target = degreeNote(key, degree, 4)
    return {
      itemId,
      play: [...cadenceSteps(key), [midi(target)]],
      answer: {
        kind: 'choice',
        choices: config.items.map((d) => ({ id: d, label: movableDoName(Number(d)) })),
        correctId: String(degree),
      },
      explanation: `${movableDoName(degree)}（主音から数えて ${degree} 番目）`,
    }
  },
}
