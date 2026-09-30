import type { Note } from '@/theory/pitch'
import { midi } from '@/theory/pitch'

const MAJOR_SCALE_PC = [0, 2, 4, 5, 7, 9, 11]

/** ピッチクラス(0=C … 11=B)の固有色。文字色は --pitch-fg */
export const pitchClassColor = (pc: number): string => `var(--pitch-${((pc % 12) + 12) % 12})`

export const noteColor = (n: Note | number): string => pitchClassColor(typeof n === 'number' ? n : midi(n))

/** 移動ドの度数(1〜7)の色。ド=主音に C の色を割り当て、調が変わっても度数の色は固定 */
export const degreeColor = (degree: number): string => pitchClassColor(MAJOR_SCALE_PC[(((degree - 1) % 7) + 7) % 7])
