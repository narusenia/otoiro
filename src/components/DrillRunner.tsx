import { CheckIcon, RotateCcwIcon, Volume2Icon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { playSteps } from '@/audio/engine'
import { registerKeySink } from '@/audio/keyInput'
import { Keyboard } from '@/components/Keyboard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DRILLS } from '@/drills'
import type { Question } from '@/drills/types'
import type { DrillConfig } from '@/learning/types'
import { markStudiedToday, updateState, useAppState } from '@/store'
import { isPassed, PASS_CORRECT, PASS_TOTAL, updateWeights } from '@/theory/quiz'
import { t } from '@/i18n'

type Phase = 'ready' | 'asking' | 'answered' | 'done'

export type DrillRunnerProps = {
  config: DrillConfig
  /** 出題数。合格判定を使うときは 10 固定 */
  total?: number
  /** true: 10 問中 8 問で合格の表示を出す（単元用）。false: 点数のみ（自由練習） */
  judgePass?: boolean
  /** 全問終了時に呼ばれる。単元では進捗保存に使う */
  onFinish?: (results: boolean[]) => void
}

export function DrillRunner({ config, total = PASS_TOTAL, judgePass = true, onFinish }: DrillRunnerProps) {
  const app = useAppState()
  const drill = DRILLS[config.type]
  const [phase, setPhase] = useState<Phase>('ready')
  const [q, setQ] = useState<Question>()
  const [results, setResults] = useState<boolean[]>([])
  const [picked, setPicked] = useState<string>()
  const [keys, setKeys] = useState<number[]>([])
  const [audioError, setAudioError] = useState(false)

  const answer = (correct: boolean) => {
    if (!q) return
    setResults((r) => [...r, correct])
    setPhase('answered')
    updateState((s) => ({ ...s, weights: updateWeights(s.weights, q.itemId, correct) }))
    markStudiedToday()
  }

  const pressKey = (m: number) => {
    if (phase !== 'asking' || q?.answer.kind !== 'keys') return
    const next = [...keys, m]
    setKeys(next)
    // 異名同音は同じ鍵として扱う（MIDI 番号で比較）
    if (next.length === q.answer.correct.length) answer(next.every((k, i) => k === (q.answer as { correct: number[] }).correct[i]))
  }

  // 画面下のピアノが開いていれば、それを回答鍵盤として使う（閉じているときは内蔵の鍵盤を出す）
  const useDock = app.settings.showPiano
  const waitingForKeys = phase === 'asking' && q?.answer.kind === 'keys'
  useEffect(() => (waitingForKeys && useDock ? registerKeySink(pressKey) : undefined))

  if (!drill) return <p className="text-muted-foreground">{t('drill.preparing')}</p>

  const play = (steps: number[][]) => {
    setAudioError(false)
    playSteps(steps).catch(() => setAudioError(true))
  }

  const ask = () => {
    const next = drill.makeQuestion(config, { weights: app.weights, noteStyle: app.settings.noteStyle, rng: Math.random })
    setQ(next)
    setPicked(undefined)
    setKeys([])
    setPhase('asking')
    // 五線譜リーディングなど、出題音を鳴らすと答えが分かるドリルは play が空
    if (next.play.length > 0) play(next.play)
  }

  const start = () => {
    setResults([])
    ask()
  }

  const advance = () => {
    if (results.length >= total) {
      setPhase('done')
      onFinish?.(results)
    } else ask()
  }

  if (phase === 'ready') {
    return (
      <Button size="lg" onClick={start}>
        <Volume2Icon data-icon="inline-start" />
        {t('drill.start', { total })}
      </Button>
    )
  }

  if (phase === 'done') {
    const correct = results.filter(Boolean).length
    const passed = isPassed(results)
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t('drill.score', { correct, done: results.length })}
          </CardTitle>
          <CardDescription>
            {judgePass
              ? passed
                ? t('drill.passed')
                : t('drill.almost', { total: PASS_TOTAL, need: PASS_CORRECT })
              : t('drill.finished')}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={start}>
            <RotateCcwIcon data-icon="inline-start" />
            {t('drill.retry')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!q) return null
  const answered = phase === 'answered'
  const last = results[results.length - 1]

  return (
    <div className="flex flex-col gap-4">
      <Progress value={(results.length / total) * 100} />
      {/* 正誤を読み上げ（視覚の Badge は live 領域ではないため） */}
      <p role="status" className="sr-only">
        {answered ? (last ? t('drill.correct') : t('drill.wrong')) : ''}
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('drill.progress', { n: results.length + (answered ? 0 : 1), total })}
            {answered && (
              <Badge variant={last ? 'default' : 'destructive'}>
                {last ? <CheckIcon data-icon="inline-start" /> : <XIcon data-icon="inline-start" />}
                {last ? t('drill.correct') : t('drill.wrong')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {q.prompt}
          {(q.play.length > 0 || answered) && (
            <Button variant="outline" onClick={() => play(answered ? (q.reveal ?? q.play) : q.play)}>
              <Volume2Icon data-icon="inline-start" />
              {answered ? t('drill.hearAnswer') : t('drill.hearAgain')}
            </Button>
          )}
          {audioError && <p className="text-destructive text-sm">{t('drill.audioError')}</p>}

          {q.answer.kind === 'choice' && (
            <div className="grid grid-cols-2 gap-2">
              {q.answer.choices.map((c) => {
                const isCorrect = c.id === (q.answer as { correctId: string }).correctId
                const isPicked = c.id === picked
                return (
                  <Button
                    key={c.id}
                    size="lg"
                    variant={answered ? (isCorrect ? 'default' : isPicked ? 'destructive' : 'outline') : 'outline'}
                    disabled={answered && !isCorrect && !isPicked}
                    onClick={() => {
                      if (answered) return
                      setPicked(c.id)
                      answer(isCorrect)
                    }}
                  >
                    {answered && isCorrect && <CheckIcon data-icon="inline-start" />}
                    {answered && isPicked && !isCorrect && <XIcon data-icon="inline-start" />}
                    {c.label}
                  </Button>
                )
              })}
            </div>
          )}

          {q.answer.kind === 'keys' && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-sm">
                {t('drill.pressKeys', { count: q.answer.correct.length, n: keys.length })}
              </p>
              {useDock ? (
                <p className="text-muted-foreground text-xs">{t('drill.usePiano')}</p>
              ) : (
                <Keyboard onPress={pressKey} disabled={answered} />
              )}
            </div>
          )}

          {answered && q.revealView}
          {answered && q.explanation && <p className="text-muted-foreground text-sm">{q.explanation}</p>}
        </CardContent>
        {answered && (
          <CardFooter>
            <Button onClick={advance}>{results.length >= total ? t('drill.showResult') : t('drill.next')}</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
