/** 出題項目ごとの重み。誤答で増え、正答で減る。未登録は DEFAULT_WEIGHT */
export type Weights = Record<string, number>

export const DEFAULT_WEIGHT = 1
const MIN_WEIGHT = 0.3
const MAX_WEIGHT = 8

export const nextWeight = (prev: number, correct: boolean): number =>
  correct ? Math.max(prev * 0.7, MIN_WEIGHT) : Math.min(prev * 2, MAX_WEIGHT)

export const updateWeights = (weights: Weights, id: string, correct: boolean): Weights => ({
  ...weights,
  [id]: nextWeight(weights[id] ?? DEFAULT_WEIGHT, correct),
})

/** 重みに比例して 1 項目を選ぶ。items が空なら RangeError */
export function pickWeighted(items: string[], weights: Weights, rng: () => number = Math.random): string {
  if (items.length === 0) throw new RangeError('items must not be empty')
  const w = items.map((id) => weights[id] ?? DEFAULT_WEIGHT)
  let r = rng() * w.reduce((a, b) => a + b, 0)
  for (let i = 0; i < items.length; i++) {
    r -= w[i]
    if (r < 0) return items[i]
  }
  return items[items.length - 1]
}

export const PASS_TOTAL = 10
export const PASS_CORRECT = 8

/** 10 問中 8 問正解で合格。10 問に満たない間は未合格 */
export const isPassed = (results: boolean[]): boolean =>
  results.length >= PASS_TOTAL && results.slice(0, PASS_TOTAL).filter(Boolean).length >= PASS_CORRECT
