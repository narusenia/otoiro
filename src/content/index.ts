import type { ComponentType } from 'react'
import { MdxKeyboard, MdxStaff, Play } from '@/components/mdx'
import type { UnitMeta } from '@/learning/types'
import { parseUnitMeta } from './parse'

// ponytail: ja のみ。多言語化時はロケールをパスとこの glob に持ち込む
const LOCALE = 'ja'

export type Course = { id: string; title: string; description: string }

export const COURSES: Course[] = [
  { id: 'interval', title: '音程', description: '2 つの音の隔たりを聴き分ける' },
  { id: 'chord', title: '和音', description: '和音の種類と転回形を聴き分ける' },
  { id: 'staff', title: '五線譜', description: '譜面の音符を音名で読む' },
  { id: 'degree', title: '度数・メロディ', description: '調の中の音を移動ドで聴き取る' },
]

const frontmatters = import.meta.glob<Record<string, unknown>>('/content/ja/*/*.mdx', {
  eager: true,
  import: 'frontmatter',
})
const bodies = import.meta.glob<{ default: ComponentType<{ components?: Record<string, ComponentType<never>> }> }>(
  '/content/ja/*/*.mdx',
)

export const UNITS: UnitMeta[] = Object.entries(frontmatters)
  .map(([path, fm]) => parseUnitMeta(path, fm))
  .sort((a, b) => a.order - b.order)

export const unitsOf = (course: string): UnitMeta[] => UNITS.filter((u) => u.course === course)
export const findUnit = (id: string): UnitMeta | undefined => UNITS.find((u) => u.id === id)

/** MDX 本文で使える部品 */
export const mdxComponents = { Play, Staff: MdxStaff, Keyboard: MdxKeyboard } as unknown as Record<string, ComponentType<never>>

export async function loadUnitBody(unit: UnitMeta) {
  const load = bodies[`/content/${LOCALE}/${unit.course}/${unit.slug}.mdx`]
  if (!load) throw new Error(`content not found: ${unit.id}`)
  return (await load()).default
}
