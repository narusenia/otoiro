import type { DrillType } from '@/learning/types'
import { chordDrill } from './chord'
import { degreeDrill } from './degree'
import { intervalDrill } from './interval'
import { melodyDrill } from './melody'
import { staffDrill } from './staff'
import type { Drill } from './types'

export const DRILLS: Record<DrillType, Drill> = {
  interval: intervalDrill,
  chord: chordDrill,
  staff: staffDrill,
  degree: degreeDrill,
  melody: melodyDrill,
}
