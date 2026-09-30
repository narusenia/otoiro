import { Suspense, useState } from 'react'
import { Link, useParams } from 'react-router'
import { DrillRunner } from '@/components/DrillRunner'
import { Button } from '@/components/ui/button'
import { findUnit, mdxComponents, unitBody, UNITS } from '@/content'
import { applySession, unlockedUnits } from '@/learning/progress'
import { updateState, useAppState } from '@/store'

export default function Unit() {
  const { courseId = '', unitId = '' } = useParams()
  const { progress } = useAppState()
  const unit = findUnit(`${courseId}/${unitId}`)
  const [step, setStep] = useState<'lesson' | 'drill'>('lesson')

  if (!unit) return <p>単元が見つからない。</p>
  const Body = unitBody(unit)
  const locked = !unlockedUnits(UNITS, progress).has(unit.id)

  return (
    <div className="flex flex-col gap-6">
      <Link to={`/course/${courseId}`} className="text-muted-foreground text-sm underline">
        コースに戻る
      </Link>
      <h1 className="text-2xl font-semibold">{unit.title}</h1>
      {locked && (
        <p role="note" className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
          前の単元にまだ合格していない。このまま進めてもよい。
        </p>
      )}
      {step === 'lesson' ? (
        <>
          <article className="prose dark:prose-invert max-w-none">
            <Suspense fallback={<p>読み込み中…</p>}>
              {/* unitBody は単元ごとにキャッシュ済みの部品を返す（描画のたびに作り直さない） */}
              {/* oxlint-disable-next-line react/static-components */}
              <Body components={mdxComponents} />
            </Suspense>
          </article>
          <Button size="lg" onClick={() => setStep('drill')}>
            練習へ進む
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
