import { describe, expect, it } from 'vitest'
import { parseChordType } from '@/drills/chord'
import { parseIntervalId } from '@/drills/interval'
import { resolveRequires } from '@/learning/progress'
import { parseKey, parseNote } from '@/theory/parse'
import { parseUnitMeta } from './parse'

// content/ja の全単元を機械検査する。単元を足したときの書き間違いをここで止める
const frontmatters = import.meta.glob<Record<string, unknown>>('/content/ja/*/*.mdx', { eager: true, import: 'frontmatter' })
const units = Object.entries(frontmatters).map(([path, fm]) => parseUnitMeta(path, fm))
const ids = new Set(units.map((u) => u.id))

describe('content units', () => {
  it('has units', () => {
    expect(units.length).toBeGreaterThan(0)
  })

  it('has unique order within a course', () => {
    const seen = new Set<string>()
    for (const u of units) {
      const k = `${u.course}#${u.order}`
      expect(seen.has(k), `duplicate order: ${k}`).toBe(false)
      seen.add(k)
    }
  })

  it('references only existing units and has no dependency cycle', () => {
    const req = resolveRequires(units)
    for (const u of units) for (const r of req[u.id]) expect(ids.has(r), `${u.id} requires unknown ${r}`).toBe(true)
    const visiting = new Set<string>()
    const done = new Set<string>()
    const visit = (id: string) => {
      if (done.has(id)) return
      expect(visiting.has(id), `cycle at ${id}`).toBe(false)
      visiting.add(id)
      req[id].forEach(visit)
      visiting.delete(id)
      done.add(id)
    }
    ids.forEach(visit)
  })

  it('has drill items valid for the drill type', () => {
    for (const u of units) {
      const { type, items } = u.drill
      const where = `${u.id} (${type})`
      for (const item of items) {
        const check = () => {
          if (type === 'interval') parseIntervalId(item)
          else if (type === 'chord') {
            if (u.drill.mode === 'inversion') expect(['0', '1', '2', '3']).toContain(item)
            else parseChordType(item)
          } else if (type === 'staff') parseNote(item)
          else expect(['1', '2', '3', '4', '5', '6', '7']).toContain(item) // degree / melody
        }
        expect(check, `${where}: bad item ${item}`).not.toThrow()
      }
      if (u.drill.keys) for (const k of u.drill.keys as string[]) expect(() => parseKey(k), `${where}: bad key ${k}`).not.toThrow()
      if (type === 'chord' && u.drill.mode === 'inversion')
        for (const t of (u.drill.chordTypes as string[]) ?? ['M', 'm']) expect(() => parseChordType(t)).not.toThrow()
      if (type === 'melody') {
        const len = u.drill.length as number
        expect(len >= 3 && len <= 8, `${where}: length 3-8`).toBe(true)
      }
    }
  })
})
