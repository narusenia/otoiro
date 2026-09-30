import { degreeNote, type Key } from './key'
import type { Note } from './pitch'

export type MelodyOptions = {
  key: Key
  /** 音数（3〜8） */
  length: number
  /** 使用する度数(1〜7)。主音(1)は終止音のため常に含める */
  degrees: number[]
  /** 隣接音の最大跳躍（音階上のステップ数。1=順次進行のみ） */
  maxLeap: number
  /** 主音オクターブ。範囲は主音〜1 オクターブ上の主音 */
  tonicOctave?: number
  rng?: () => number
}

export type Melody = {
  /** 主音=0 からの音階ステップ（7=1 オクターブ上の主音） */
  steps: number[]
  /** 主音からの度数(1〜7) */
  degrees: number[]
  notes: Note[]
}

const MIN_STEP = 0
const MAX_STEP = 7

const degreeOfStep = (step: number) => (step % 7) + 1

/**
 * 終止音（主音）から逆向きに生成するので、跳躍幅・使用度数・主音終止を必ず満たす。
 * 同音連打は、他に候補があるときは避ける。
 */
export function generateMelody({ key, length, degrees, maxLeap, tonicOctave = 4, rng = Math.random }: MelodyOptions): Melody {
  if (length < 1) throw new RangeError('length must be >= 1')
  const allowed = new Set([...degrees, 1])
  const pick = <T,>(xs: T[]): T => xs[Math.floor(rng() * xs.length)]

  const inRange = Array.from({ length: MAX_STEP - MIN_STEP + 1 }, (_, i) => i + MIN_STEP).filter((s) =>
    allowed.has(degreeOfStep(s)),
  )
  const neighbours = (cur: number) => inRange.filter((s) => Math.abs(s - cur) <= maxLeap)
  const canMove = (cur: number) => neighbours(cur).some((s) => s !== cur)
  // 動ける終止音を優先（隣接候補が無い高いドで同音連打になるのを避ける）
  const ends = [0, MAX_STEP].filter(canMove)
  const reversed = [pick(ends.length ? ends : [0, MAX_STEP])]
  while (reversed.length < length) {
    const near = neighbours(reversed[reversed.length - 1])
    const moving = near.filter((s) => s !== reversed[reversed.length - 1])
    reversed.push(pick(moving.length ? moving : near))
  }
  const steps = reversed.reverse()
  return {
    steps,
    degrees: steps.map(degreeOfStep),
    notes: steps.map((s) => degreeNote(key, s + 1, tonicOctave)),
  }
}
