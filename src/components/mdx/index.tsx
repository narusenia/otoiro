import { PlayIcon } from 'lucide-react'
import { playSteps } from '@/audio/engine'
import { Keyboard, type KeyboardProps } from '@/components/Keyboard'
import { Staff, type StaffProps } from '@/components/Staff'
import { Button } from '@/components/ui/button'
import { noteColor } from '@/lib/pitch-color'
import { parseNotes } from '@/theory/parse'
import { midi } from '@/theory/pitch'

/**
 * MDX から使う部品。音は "C4 E4 G4" 形式の文字列で渡す。
 * <Play notes="C4 E4" mode="chord">和音を聴く</Play>
 */
export function Play({
  notes,
  mode = 'sequence',
  children = '聴く',
}: {
  notes: string
  /** sequence=順に鳴らす（旋律的）、chord=同時に鳴らす（和声的） */
  mode?: 'sequence' | 'chord'
  children?: React.ReactNode
}) {
  const ms = parseNotes(notes).map(midi)
  return (
    <Button variant="outline" onClick={() => void playSteps(mode === 'chord' ? [ms] : ms.map((m) => [m]))}>
      <PlayIcon data-icon="inline-start" />
      {children}
    </Button>
  )
}

/** <Staff notes="C4 E4 G4" clef="treble" fifths={1} colored /> */
export function MdxStaff({
  notes,
  colored = false,
  ...rest
}: Omit<StaffProps, 'notes' | 'colors'> & { notes: string; colored?: boolean }) {
  const parsed = parseNotes(notes)
  return <Staff notes={parsed} colors={colored ? parsed.map(noteColor) : undefined} {...rest} />
}

/** <Keyboard highlight="C4 E4 G4" /> ハイライトは 12 音色で塗る */
export function MdxKeyboard({ highlight = '', ...rest }: Omit<KeyboardProps, 'highlight'> & { highlight?: string }) {
  const map = Object.fromEntries(parseNotes(highlight).map((n) => [midi(n), noteColor(n)]))
  return <Keyboard highlight={map} {...rest} />
}
