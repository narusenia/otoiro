import type { DrillType } from './types'

export const DRILL_LABEL: Record<DrillType, string> = {
  interval: '音程識別',
  chord: '和音識別',
  staff: '五線譜リーディング',
  degree: '度数聴音',
  melody: 'メロディ聴音',
}
