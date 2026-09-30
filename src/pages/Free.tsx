import { useState } from 'react'
import { DrillRunner } from '@/components/DrillRunner'
import { Button } from '@/components/ui/button'
import { COURSES, UNITS } from '@/content'
import { DRILL_LABEL } from '@/learning/labels'
import { unlockedUnits } from '@/learning/progress'
import type { DrillConfig } from '@/learning/types'
import { useAppState } from '@/store'
import { t } from '@/i18n'

type Entry = { key: string; label: string; config: DrillConfig }

/** 解放済み単元を (コース, ドリル種別) ごとにまとめ、出題項目は和集合、他の設定は最後の単元のものを使う */
function buildMenu(unlocked: Set<string>): Entry[] {
  const groups = new Map<string, Entry>()
  for (const u of UNITS.filter((x) => unlocked.has(x.id))) {
    const key = `${u.course}:${u.drill.type}`
    const prev = groups.get(key)
    const course = COURSES.find((c) => c.id === u.course)?.title ?? u.course
    groups.set(key, {
      key,
      label: `${course} — ${DRILL_LABEL[u.drill.type]}`,
      config: { ...u.drill, items: [...new Set([...(prev?.config.items ?? []), ...u.drill.items])] },
    })
  }
  return [...groups.values()]
}

export default function Free() {
  const { progress } = useAppState()
  const menu = buildMenu(unlockedUnits(UNITS, progress))
  const [selected, setSelected] = useState<Entry>()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('free.title')}</h1>
      {selected ? (
        <>
          <p className="text-muted-foreground text-sm">{t('free.scope', { label: selected.label })}</p>
          <DrillRunner key={selected.key} config={selected.config} judgePass={false} />
          <Button variant="ghost" onClick={() => setSelected(undefined)}>
            {t('free.backToMenu')}
          </Button>
        </>
      ) : menu.length === 0 ? (
        <p className="text-muted-foreground">{t('free.empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {menu.map((e) => (
            <Button key={e.key} variant="outline" size="lg" onClick={() => setSelected(e)}>
              {e.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
