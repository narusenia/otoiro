import { Suspense, useState } from 'react'
import { Link, useParams } from 'react-router'
import { DrillRunner } from '@/components/DrillRunner'
import { Button } from '@/components/ui/button'
import { findUnit, mdxComponents, unitBody, UNITS } from '@/content'
import { applySession, unlockedUnits } from '@/learning/progress'
import { updateState, useAppState } from '@/store'
import { t } from '@/i18n'

export default function Unit() {
  const { courseId = '', unitId = '' } = useParams()
  const { progress } = useAppState()
  const unit = findUnit(`${courseId}/${unitId}`)
  const [step, setStep] = useState<'lesson' | 'drill'>('lesson')

  if (!unit) return <p>{t('unit.notFound')}</p>
  const Body = unitBody(unit)
  const locked = !unlockedUnits(UNITS, progress).has(unit.id)

  return (
    <div className="flex flex-col gap-6">
      <Link to={`/course/${courseId}`} className="text-muted-foreground text-sm underline">
        {t('unit.backToCourse')}
      </Link>
      <h1 className="text-2xl font-semibold">{unit.title}</h1>
      {locked && (
        <p role="note" className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
          {t('unit.lockedWarning')}
        </p>
      )}
      {step === 'lesson' ? (
        <>
          <article className="prose dark:prose-invert max-w-none">
            <Suspense fallback={<p>{t('unit.loading')}</p>}>
              {/* unitBody は単元ごとにキャッシュ済みの部品を返す（描画のたびに作り直さない） */}
              {/* oxlint-disable-next-line react/static-components */}
              <Body components={mdxComponents} />
            </Suspense>
          </article>
          <Button size="lg" onClick={() => setStep('drill')}>
            {t('unit.toDrill')}
          </Button>
        </>
      ) : (
        <DrillRunner
          config={unit.drill}
          onFinish={(results) => updateState((s) => ({ ...s, progress: applySession(s.progress, unit.id, results) }))}
        />
      )}
    </div>
  )
}
