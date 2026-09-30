import { describe, expect, it } from 'vitest'
import { applySession, resolveRequires, unlockedUnits } from './progress'
import { currentStreak, localDate, recordStudy } from './streak'
import type { UnitMeta } from './types'

const u = (course: string, slug: string, order: number, requires?: string[]): UnitMeta => ({
  id: `${course}/${slug}`, course, slug, title: slug, summary: '', order, requires,
  drill: { type: 'interval', items: [] },
})

const units = [u('interval', 'b', 2), u('interval', 'a', 1), u('interval', 'c', 3), u('chord', 'x', 1, ['interval/b'])]

describe('resolveRequires', () => {
  it('defaults to the previous unit in the course, first has none', () => {
    const r = resolveRequires(units)
    expect(r['interval/a']).toEqual([])
    expect(r['interval/b']).toEqual(['interval/a'])
    expect(r['interval/c']).toEqual(['interval/b'])
  })
  it('keeps explicit requires, including cross-course and empty', () => {
    expect(resolveRequires(units)['chord/x']).toEqual(['interval/b'])
    expect(resolveRequires([u('c', 'a', 1), u('c', 'b', 2, [])])['c/b']).toEqual([])
  })
})

describe('unlockedUnits', () => {
  it('unlocks only the first unit at the start', () => {
    expect([...unlockedUnits(units, {})].sort()).toEqual(['interval/a'])
  })
  it('unlocks the next unit and cross-course dependents after passing', () => {
    const p = { 'interval/a': { passed: true, best: 9, attempts: 1 }, 'interval/b': { passed: true, best: 8, attempts: 1 } }
    expect([...unlockedUnits(units, p)].sort()).toEqual(['chord/x', 'interval/a', 'interval/b', 'interval/c'])
  })
})

describe('applySession', () => {
  const run = (n: number) => Array.from({ length: 10 }, (_, i) => i < n)
  it('records a failing attempt without passing', () => {
    expect(applySession({}, 'a', run(7))).toEqual({ a: { passed: false, best: 7, attempts: 1 } })
  })
  it('passes at 8/10 and never un-passes, best is the max', () => {
    let p = applySession({}, 'a', run(8))
    expect(p.a.passed).toBe(true)
    p = applySession(p, 'a', run(3))
    expect(p.a).toEqual({ passed: true, best: 8, attempts: 2 })
  })
})

describe('streak', () => {
  it('starts, continues on consecutive days, resets after a gap, ignores same day', () => {
    let s = recordStudy({ last: null, count: 0 }, '2026-09-30')
    expect(s).toEqual({ last: '2026-09-30', count: 1 })
    expect(recordStudy(s, '2026-09-30')).toBe(s)
    s = recordStudy(s, '2026-10-01') // 月またぎ
    expect(s.count).toBe(2)
    s = recordStudy(s, '2026-10-04')
    expect(s).toEqual({ last: '2026-10-04', count: 1 })
  })
  it('currentStreak shows 0 once a day is missed', () => {
    const s = { last: '2026-09-30', count: 5 }
    expect(currentStreak(s, '2026-09-30')).toBe(5)
    expect(currentStreak(s, '2026-10-01')).toBe(5)
    expect(currentStreak(s, '2026-10-02')).toBe(0)
    expect(currentStreak({ last: null, count: 0 }, '2026-10-02')).toBe(0)
  })
  it('localDate formats with zero padding', () => {
    expect(localDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
