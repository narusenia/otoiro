import { describe, expect, it } from 'vitest'
import { parseUnitMeta } from './parse'

const ok = { title: 'T', order: 1, drill: { type: 'interval', items: ['P5'] } }

describe('parseUnitMeta', () => {
  it('reads course and slug from the path and defaults summary', () => {
    const u = parseUnitMeta('/content/ja/interval/perfect-intervals.mdx', ok)
    expect(u).toMatchObject({ id: 'interval/perfect-intervals', course: 'interval', slug: 'perfect-intervals', summary: '' })
  })
  it('keeps explicit requires', () => {
    expect(parseUnitMeta('/content/ja/chord/a.mdx', { ...ok, requires: ['interval/x'] }).requires).toEqual(['interval/x'])
  })
  it('rejects broken frontmatter with the file path in the message', () => {
    expect(() => parseUnitMeta('/content/ja/a/b.mdx', { ...ok, title: 1 })).toThrow(/b\.mdx.*title/)
    expect(() => parseUnitMeta('/content/ja/a/b.mdx', { ...ok, order: '1' })).toThrow(/order/)
    expect(() => parseUnitMeta('/content/ja/a/b.mdx', { ...ok, drill: { type: 'nope', items: ['x'] } })).toThrow(/drill\.type/)
    expect(() => parseUnitMeta('/content/ja/a/b.mdx', { ...ok, drill: { type: 'chord', items: [] } })).toThrow(/items/)
    expect(() => parseUnitMeta('/content/ja/a/b.mdx', { ...ok, requires: 'x' })).toThrow(/requires/)
  })
  it('rejects unexpected paths', () => {
    expect(() => parseUnitMeta('/other/x.mdx', ok)).toThrow(/path/)
  })
})
