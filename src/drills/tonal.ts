import { cadence, keySignature, type Key } from '@/theory/key'
import { parseKey } from '@/theory/parse'
import { midi } from '@/theory/pitch'
import type { DrillConfig } from '@/learning/types'

const DEFAULT_KEYS = ['C', 'G', 'D', 'F', 'Bb']

/** config.keys（長調名の配列）から 1 つ選ぶ。調号が 7 つを超える調は指定できない */
export function pickKey(config: DrillConfig, rng: () => number): Key {
  const names = (config.keys as string[] | undefined) ?? DEFAULT_KEYS
  const key = parseKey(names[Math.floor(rng() * names.length)])
  if (key.mode !== 'major') throw new RangeError('keys must be major keys')
  keySignature(key) // 範囲外なら RangeError
  return key
}

/** 調を提示する I–IV–V–I。playSteps 用の MIDI 番号列 */
export const cadenceSteps = (key: Key): number[][] => cadence(key).map((chord) => chord.map(midi))
