export type DrillType = 'interval' | 'chord' | 'staff' | 'degree' | 'melody'

/** 単元の出題設定（MDX frontmatter の drill）。type 固有の追加項目はドリル側で読む */
export type DrillConfig = { type: DrillType; items: string[]; [option: string]: unknown }

export type UnitMeta = {
  /** `${course}/${slug}` */
  id: string
  course: string
  slug: string
  title: string
  summary: string
  order: number
  /** 前提単元 id。省略時は同コースの直前の単元。[] で前提なし */
  requires?: string[]
  drill: DrillConfig
}

export type UnitProgress = { passed: boolean; best: number; attempts: number }
export type Progress = Record<string, UnitProgress>
