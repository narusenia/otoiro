/** 0=C 1=D 2=E 3=F 4=G 5=A 6=B */
export type Letter = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 綴りを保持する音高。C♯4 と D♭4 は別の Note（midi は同じ） */
export type Note = { letter: Letter; accidental: number; octave: number }

const LETTER_SEMITONE = [0, 2, 4, 5, 7, 9, 11]

export const note = (letter: Letter, accidental = 0, octave = 4): Note => ({ letter, accidental, octave })

export const midi = (n: Note): number => 12 * (n.octave + 1) + LETTER_SEMITONE[n.letter] + n.accidental

/** 文字を letterSteps 進め、実音が semitones 動くように臨時記号を決める */
export function transpose(n: Note, letterSteps: number, semitones: number): Note {
  const idx = n.letter + letterSteps
  const letter = (((idx % 7) + 7) % 7) as Letter
  const octave = n.octave + Math.floor(idx / 7)
  const natural = 12 * (octave + 1) + LETTER_SEMITONE[letter]
  return { letter, octave, accidental: midi(n) + semitones - natural }
}
