import { useEffect, useRef } from 'react'
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'
import { cn } from '@/lib/utils'
import type { Note } from '@/theory/pitch'
import { t } from '@/i18n'

// 調号（♯♭の数 -7..7）→ VexFlow の長調名。短調は同じ調号の平行長調を渡す
const MAJOR_BY_FIFTHS = ['Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#']

const LETTER = ['c', 'd', 'e', 'f', 'g', 'a', 'b']

export type StaffProps = {
  notes: Note[]
  clef?: 'treble' | 'bass'
  /** 調号。正=♯の数、負=♭の数（-7〜7） */
  fifths?: number
  /** 音符ごとの色（CSS color）。省略した音は文字色 */
  colors?: (string | undefined)[]
  className?: string
}

const vexKey = (n: Note) =>
  `${LETTER[n.letter]}${n.accidental > 0 ? '#'.repeat(n.accidental) : 'b'.repeat(-n.accidental)}/${n.octave}`

export function Staff({ notes, clef = 'treble', fifths = 0, colors = [], className }: StaffProps) {
  const host = useRef<HTMLDivElement>(null)
  const signature = notes.map(vexKey).join(' ') + `|${clef}|${fifths}|${colors.join(',')}`

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.innerHTML = ''

    const keySpec = MAJOR_BY_FIFTHS[fifths + 7]
    const width = 90 + Math.abs(fifths) * 14 + Math.max(notes.length, 1) * 54
    const height = 170
    const renderer = new Renderer(el, Renderer.Backends.SVG)
    renderer.resize(width, height)
    const ctx = renderer.getContext()
    ctx.setFillStyle('currentColor')
    ctx.setStrokeStyle('currentColor')

    const stave = new Stave(4, 40, width - 8)
    stave.addClef(clef).addKeySignature(keySpec)
    stave.setContext(ctx).draw()

    if (notes.length > 0) {
      const staveNotes = notes.map((n, i) => {
        const sn = new StaveNote({ keys: [vexKey(n)], duration: 'q', clef })
        // stem・加線は setStyle の対象外で既定の黒になるため個別に指定
        const raw = colors[i]
        const c = raw ? `color-mix(in oklab, ${raw} calc(100% - var(--staff-darken)), black)` : 'currentColor'
        const style = { fillStyle: c, strokeStyle: c }
        sn.setStyle(style)
        sn.setStemStyle(style)
        sn.setLedgerLineStyle(style)
        return sn
      })
      const voice = new Voice({ numBeats: staveNotes.length, beatValue: 4 })
      voice.addTickables(staveNotes)
      Accidental.applyAccidentals([voice], keySpec)
      new Formatter().joinVoices([voice]).format([voice], width - stave.getNoteStartX() - 20)
      voice.draw(ctx, stave)
    }

    const svg = el.querySelector('svg')
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      svg.style.width = '100%'
      svg.style.maxWidth = `${width}px`
      svg.style.height = 'auto'
    }
    // 依存は signature（notes/colors は毎回新しい配列のため）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  return <div ref={host} className={cn('text-foreground', className)} role="img" aria-label={t('staff.label')} />
}
