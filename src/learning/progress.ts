import { isPassed } from '@/theory/quiz'
import type { Progress, UnitMeta } from './types'

/** requires の省略を「同コースの直前の単元」で埋めた前提表 */
export function resolveRequires(units: UnitMeta[]): Record<string, string[]> {
  const byCourse = new Map<string, UnitMeta[]>()
  for (const u of units) byCourse.set(u.course, [...(byCourse.get(u.course) ?? []), u])
  const out: Record<string, string[]> = {}
  for (const list of byCourse.values()) {
    list.sort((a, b) => a.order - b.order)
    list.forEach((u, i) => {
      out[u.id] = u.requires ?? (i > 0 ? [list[i - 1].id] : [])
    })
  }
  return out
}

/** 前提がすべて合格済みの単元 id 集合 */
export function unlockedUnits(units: UnitMeta[], progress: Progress): Set<string> {
  const requires = resolveRequires(units)
  return new Set(units.filter((u) => requires[u.id].every((r) => progress[r]?.passed)).map((u) => u.id))
}

/** 1 回分の結果（正誤の配列）を進捗に反映。一度合格したら合格のまま */
export function applySession(progress: Progress, unitId: string, results: boolean[]): Progress {
  const prev = progress[unitId] ?? { passed: false, best: 0, attempts: 0 }
  const correct = results.filter(Boolean).length
  return {
    ...progress,
    [unitId]: {
      passed: prev.passed || isPassed(results),
      best: Math.max(prev.best, correct),
      attempts: prev.attempts + 1,
    },
  }
}
