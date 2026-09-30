import type { DrillType, UnitMeta } from '@/learning/types'

const DRILL_TYPES: DrillType[] = ['interval', 'chord', 'staff', 'degree', 'melody']

/** `/content/ja/<course>/<slug>.mdx` と frontmatter から UnitMeta を作る。不備は内容の誤りなので例外で気づかせる */
export function parseUnitMeta(path: string, fm: Record<string, unknown>): UnitMeta {
  const m = /\/content\/[^/]+\/([^/]+)\/([^/]+)\.mdx$/.exec(path)
  if (!m) throw new Error(`unexpected content path: ${path}`)
  const [, course, slug] = m
  const fail = (why: string): never => {
    throw new Error(`${path}: frontmatter ${why}`)
  }
  if (typeof fm.title !== 'string') fail('title (string) is required')
  if (typeof fm.order !== 'number') fail('order (number) is required')
  const drill = fm.drill as { type?: unknown; items?: unknown } | undefined
  if (!drill || !DRILL_TYPES.includes(drill.type as DrillType)) fail(`drill.type must be one of ${DRILL_TYPES.join(', ')}`)
  if (!Array.isArray(drill?.items) || drill.items.length === 0) fail('drill.items must be a non-empty array')
  if (fm.requires !== undefined && !Array.isArray(fm.requires)) fail('requires must be an array')
  return {
    id: `${course}/${slug}`,
    course,
    slug,
    title: fm.title as string,
    summary: typeof fm.summary === 'string' ? fm.summary : '',
    order: fm.order as number,
    requires: fm.requires as string[] | undefined,
    drill: fm.drill as UnitMeta['drill'],
  }
}
