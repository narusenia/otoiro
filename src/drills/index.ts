import type { DrillType } from '@/learning/types'
import { intervalDrill } from './interval'
import type { Drill } from './types'

// ponytail: 和音・五線譜・度数・メロディは Phase 4 で追加。未登録の type はランナーが「準備中」を出す
export const DRILLS: Partial<Record<DrillType, Drill>> = {
  interval: intervalDrill,
}
