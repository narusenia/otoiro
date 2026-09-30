import { CheckIcon, RotateCcwIcon, Volume2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { playSteps } from '@/audio/engine'
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

  if (!drill) return <p className="text-muted-foreground">このドリルは準備中。</p>

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
    play(next.play)
  }

  const start = () => {
    setResults([])
    ask()
  }

  const answer = (correct: boolean) => {
    if (!q) return
    setResults((r) => [...r, correct])
    setPhase('answered')
    updateState((s) => ({ ...s, weights: updateWeights(s.weights, q.itemId, correct) }))
    markStudiedToday()
  }

  const advance = () => {
    if (results.length >= total) {
      setPhase('done')
      onFinish?.(results)
    } else ask()
  }

  const pressKey = (m: number) => {
    if (phase !== 'asking' || q?.answer.kind !== 'keys') return
    const next = [...keys, m]
    setKeys(next)
    if (next.length === q.answer.correct.length) answer(next.every((k, i) => k === (q.answer as { correct: number[] }).correct[i]))
  }

  if (phase === 'ready') {
    return (
      <Button size="lg" onClick={start}>
        <Volume2Icon data-icon="inline-start" />
        スタート（{total} 問）
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
            {correct} / {results.length} 問正解
          </CardTitle>
          <CardDescription>
            {judgePass
              ? passed
                ? '合格。次の単元が解放された。'
                : `あと少し。${PASS_TOTAL} 問中 ${PASS_CORRECT} 問正解で合格。`
              : 'お疲れさま。'}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={start}>
            <RotateCcwIcon data-icon="inline-start" />
            もう一度
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {results.length + (answered ? 0 : 1)} / {total} 問目
            {answered && (
              <Badge variant={last ? 'default' : 'destructive'}>
                {last ? <CheckIcon data-icon="inline-start" /> : <XIcon data-icon="inline-start" />}
                {last ? '正解' : '不正解'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {q.prompt}
          <Button variant="outline" onClick={() => play(answered && q.reveal ? q.reveal : q.play)}>
            <Volume2Icon data-icon="inline-start" />
            {answered ? '正解を聴く' : 'もう一度聴く'}
          </Button>
          {audioError && <p className="text-destructive text-sm">音を再生できなかった。画面をタップしてもう一度試す。</p>}

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
                鍵盤で {q.answer.correct.length} 音を順に押す（{keys.length} / {q.answer.correct.length}）
              </p>
              <Keyboard onPress={pressKey} disabled={answered} />
            </div>
          )}

          {answered && q.explanation && <p className="text-muted-foreground text-sm">{q.explanation}</p>}
        </CardContent>
        {answered && (
          <CardFooter>
            <Button onClick={advance}>{results.length >= total ? '結果を見る' : '次へ'}</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
