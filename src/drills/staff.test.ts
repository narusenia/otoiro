import { describe, expect, it } from 'vitest'
import { staffDrill } from './staff'
import { midi } from '@/theory/pitch'
import { parseNote } from '@/theory/parse'

const rng = () => 0
const ctx = (weights = {}) => ({ weights, noteStyle: 'english' as const, rng })

describe('staffDrill', () => {
  it('asks silently and expects the note as a MIDI key', () => {
    const q = staffDrill.makeQuestion({ type: 'staff', items: ['A4', 'C5'] }, ctx())
    expect(q.play).toEqual([])
    expect(q.answer).toEqual({ kind: 'keys', correct: [midi(parseNote('A4'))] })
    expect(q.reveal).toEqual([[69]])
    expect(q.itemId).toBe('staff:treble:A4')
    expect(q.prompt).toBeTruthy()
  })
  it('keeps clef in the weight key and treats enharmonic spellings by MIDI', () => {
    const q = staffDrill.makeQuestion({ type: 'staff', items: ['Db3'], clef: 'bass' }, ctx())
    expect(q.itemId).toBe('staff:bass:Db3')
    expect(q.answer).toEqual({ kind: 'keys', correct: [49] }) // C#3 と同じ鍵
  })
  it('names the answer with octave', () => {
    const q = staffDrill.makeQuestion({ type: 'staff', items: ['F#4'] }, ctx())
    expect(q.explanation).toBe('F♯4')
  })
})
