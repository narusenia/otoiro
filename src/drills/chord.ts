import { chordNotes, chordSymbol, chordTypeName, type ChordType } from '@/theory/chord'
import { noteName } from '@/theory/notation'
import { midi, note, type Letter } from '@/theory/pitch'
import { pickWeighted } from '@/theory/quiz'
import type { Drill } from './types'

const INVERSION_LABEL = ['基本形', '第1転回形', '第2転回形', '第3転回形']

const TYPES: ChordType[] = ['M', 'm', 'dim', 'aug', 'M7', '7', 'm7', 'm7b5', 'dim7']
const isChordType = (x: string): x is ChordType => (TYPES as string[]).includes(x)

/** 'M' 'm7b5' などの和音種別 id。不正なら RangeError */
export function parseChordType(id: string): ChordType {
  if (!isChordType(id)) throw new RangeError(`invalid chord type: ${id}`)
  return id
}

/**
 * config.mode: 'type'（既定）= 和音の種類を答える / 'inversion' = 転回形を答える
 * type モード:      items = 和音種別 id（M m dim aug M7 7 m7 m7b5 dim7）
 * inversion モード: items = 転回形の番号（'0' '1' '2' '3'）、config.chordTypes = 出題する和音種別（既定 ['M','m']）
 */
export const chordDrill: Drill = {
  makeQuestion(config, { weights, noteStyle, rng }) {
    const mode = (config.mode as string | undefined) ?? 'type'
    const root = note(Math.floor(rng() * 7) as Letter, 0, 3)

    if (mode === 'inversion') {
      const types = ((config.chordTypes as string[] | undefined) ?? ['M', 'm']).map(parseChordType)
      const type = types[Math.floor(rng() * types.length)]
      const itemId = pickWeighted(config.items.map((i) => `chord-inv:${i}`), weights, rng)
      const inversion = Number(itemId.slice('chord-inv:'.length))
      const notes = chordNotes(root, type, inversion)
      return {
        itemId,
        play: [notes.map(midi)],
        answer: {
          kind: 'choice',
          choices: config.items.map((i) => ({ id: i, label: INVERSION_LABEL[Number(i)] })),
          correctId: String(inversion),
        },
        explanation: `${chordSymbol(root, type, inversion, 'english')}（${chordTypeName(type)}・${INVERSION_LABEL[inversion]}）最低音は ${noteName(notes[0], noteStyle)}`,
      }
    }

    const itemId = pickWeighted(config.items.map((i) => `chord:${i}`), weights, rng)
    const id = itemId.slice('chord:'.length)
    const type = parseChordType(id)
    const notes = chordNotes(root, type)
    return {
      itemId,
      play: [notes.map(midi)],
      answer: {
        kind: 'choice',
        choices: config.items.map((i) => ({ id: i, label: chordTypeName(parseChordType(i)) })),
        correctId: id,
      },
      explanation: `${chordSymbol(root, type, 0, 'english')}（${chordTypeName(type)}）構成音: ${notes.map((n) => noteName(n, noteStyle)).join(' ')}`,
    }
  },
}
