import { useEffect, useRef } from 'react'
import { playSteps } from '@/audio/engine'
import { cn } from '@/lib/utils'
import { pitchClassColor } from '@/lib/pitch-color'
import { letterName, type NoteNameStyle } from '@/theory/notation'
import type { Letter } from '@/theory/pitch'

const WHITE_PC = [0, 2, 4, 5, 7, 9, 11]
const BLACK_PC = [1, 3, 6, 8, 10]
// 黒鍵は常に ♯ 表記で読み上げ（異名同音の区別は回答判定側で扱う）
const PC_LETTER: Record<number, [Letter, number]> = {
  0: [0, 0], 1: [0, 1], 2: [1, 0], 3: [1, 1], 4: [2, 0], 5: [3, 0],
  6: [3, 1], 7: [4, 0], 8: [4, 1], 9: [5, 0], 10: [5, 1], 11: [6, 0],
}

const WHITE_W = 44 // px
const BLACK_W = 28

export type KeyboardProps = {
  /** 表示範囲の MIDI 番号（両端含む）。白鍵で始まり白鍵で終わること */
  from?: number
  to?: number
  /** MIDI 番号 → 塗りつぶし色（CSS color）。既定は無し */
  highlight?: Record<number, string>
  /** 全鍵の下端に 12 音色の帯を表示（学習補助） */
  showColors?: boolean
  labelStyle?: NoteNameStyle
  /** 鍵を押したとき（音は playOnPress が true なら自動で鳴る） */
  onPress?: (midi: number) => void
  playOnPress?: boolean
  disabled?: boolean
  className?: string
}

export function Keyboard({
  from = 60,
  to = 83,
  highlight = {},
  showColors = true,
  labelStyle = 'doremi',
  onPress,
  playOnPress = true,
  disabled = false,
  className,
}: KeyboardProps) {
  const midis = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const whites = midis.filter((m) => WHITE_PC.includes(m % 12))
  const blacks = midis.filter((m) => BLACK_PC.includes(m % 12))
  const scroller = useRef<HTMLDivElement>(null)

  // 初期表示で中央付近（既定は C4 付近）が見えるようにスクロール
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const target = whites.findIndex((m) => m >= 60)
    if (target >= 0) el.scrollLeft = Math.max(0, target * WHITE_W - el.clientWidth / 2 + WHITE_W)
    // 範囲が変わったときだけ再計算
  }, [from, to])

  const press = (m: number) => {
    onPress?.(m)
    if (playOnPress) void playSteps([[m]], { noteSeconds: 0.8 })
  }
  const label = (m: number) => {
    const [letter, acc] = PC_LETTER[m % 12]
    return letterName(letter, acc, labelStyle)
  }
  const stripe = (m: number) =>
    showColors ? { boxShadow: `inset 0 -6px 0 0 ${pitchClassColor(m)}` } : undefined

  return (
    <div ref={scroller} className={cn('overflow-x-auto rounded-lg border bg-card pb-1', className)}>
      <div className="relative h-40" style={{ width: whites.length * WHITE_W }}>
        <div className="flex h-full">
          {whites.map((m) => (
            <button
              key={m}
              type="button"
              disabled={disabled}
              aria-label={`${label(m)}${Math.floor(m / 12) - 1}`}
              onClick={() => press(m)}
              style={{ width: WHITE_W, ...stripe(m), ...(highlight[m] ? { backgroundColor: highlight[m], color: 'var(--pitch-fg)' } : {}) }}
              className={cn(
                'flex shrink-0 touch-manipulation items-end justify-center border-r bg-background pb-3 text-xs text-muted-foreground transition-[filter] active:brightness-90 disabled:opacity-60',
                highlight[m] && 'text-[var(--pitch-fg)]',
              )}
            >
              {m % 12 === 0 ? `${label(m)}${Math.floor(m / 12) - 1}` : label(m)}
            </button>
          ))}
        </div>
        {blacks.map((m) => {
          const left = whites.filter((w) => w < m).length * WHITE_W - BLACK_W / 2
          return (
            <button
              key={m}
              type="button"
              disabled={disabled}
              aria-label={`${label(m)}${Math.floor(m / 12) - 1}`}
              onClick={() => press(m)}
              style={{
                left,
                width: BLACK_W,
                ...(highlight[m] ? { backgroundColor: highlight[m] } : {}),
                ...(showColors ? { boxShadow: `inset 0 -5px 0 0 ${pitchClassColor(m)}` } : {}),
              }}
              className={cn(
                'absolute top-0 h-24 touch-manipulation rounded-b-md bg-foreground transition-[filter] active:brightness-125 disabled:opacity-60',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
