import type { ReactNode } from 'react'
import type { DrillConfig } from '@/learning/types'
import type { NoteNameStyle } from '@/theory/notation'
import type { Weights } from '@/theory/quiz'

export type Choice = { id: string; label: string }

export type Answer =
  /** 選択肢から選ぶ（音程・和音） */
  | { kind: 'choice'; choices: Choice[]; correctId: string }
  /** 鍵盤を順に押す（五線譜・メロディ）。correct は MIDI 番号列（異名同音は同じ音として判定） */
  | { kind: 'keys'; correct: number[] }

export type Question = {
  /** 苦手重みのキー（例: interval:M3）。誤答すると次回から多く出る */
  itemId: string
  /** 出題音。MIDI 番号の配列を順に鳴らす。1 要素内の複数音は同時 */
  play: number[][]
  /** 出題時に表示する補足（譜面など） */
  prompt?: ReactNode
  /** 回答後の比較再生。省略時は play と同じ */
  reveal?: number[][]
  answer: Answer
  /** 回答後に出す一言解説 */
  explanation?: string
}

export type DrillContext = { weights: Weights; noteStyle: NoteNameStyle; rng: () => number }

export type Drill = {
  makeQuestion(config: DrillConfig, ctx: DrillContext): Question
}
