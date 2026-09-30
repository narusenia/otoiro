import * as Tone from 'tone'

export type Timbre = 'piano' | 'sine'

const SAMPLE_DIR = '/samples/salamander/'
// C2〜C7、短3度間隔。範囲外・間の音は Sampler が最寄りのサンプルを移調して鳴らす
const SAMPLE_URLS: Record<string, string> = Object.fromEntries(
  [2, 3, 4, 5, 6, 7].flatMap((o) =>
    (o === 7 ? ['C'] : ['C', 'Ds', 'Fs', 'A']).map((n) => [n.replace('s', '#') + o, `${n}${o}.mp3`]),
  ),
)

type Instrument = Tone.Sampler | Tone.PolySynth

let timbre: Timbre = 'piano'
let piano: Tone.Sampler | undefined
let sine: Tone.PolySynth | undefined
let pianoReady: Promise<unknown> | undefined

function instrument(t: Timbre): Instrument {
  if (t === 'sine') {
    sine ??= new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.4 },
      volume: -8,
    }).toDestination()
    return sine
  }
  if (!piano) {
    piano = new Tone.Sampler({ urls: SAMPLE_URLS, baseUrl: SAMPLE_DIR, release: 1 }).toDestination()
    pianoReady = Tone.loaded()
  }
  return piano
}

export const setTimbre = (t: Timbre) => {
  timbre = t
}

/** iOS Safari 等は最初のユーザー操作内で AudioContext を再開する必要がある。タップ/クリックのハンドラから呼ぶ */
export async function unlockAudio(): Promise<void> {
  await Tone.start()
  instrument(timbre)
  await pianoReady
}

export type PlayOptions = {
  /** 各ステップの間隔（秒） */
  stepSeconds?: number
  /** 各音の長さ（秒） */
  noteSeconds?: number
}

/**
 * 各ステップ（= MIDI 番号の配列）を順に鳴らす。1 ステップ内の複数音は同時発音（和音・和声的音程）。
 * 単音=[[60]]、旋律的音程=[[60],[64]]、和音=[[60,64,67]]、カデンツ=[[..],[..],..]。
 * 全ステップの再生が終わったら resolve する。
 * ponytail: stopAll は発音を止めるだけで、待機中の Promise は自然終了まで残る
 */
export async function playSteps(steps: number[][], { stepSeconds = 0.7, noteSeconds = 0.65 }: PlayOptions = {}) {
  await unlockAudio()
  const inst = instrument(timbre)
  const start = Tone.now() + 0.05
  steps.forEach((step, i) => {
    const notes = step.map((m) => Tone.Frequency(m, 'midi').toNote())
    inst.triggerAttackRelease(notes, noteSeconds, start + i * stepSeconds)
  })
  const total = (steps.length - 1) * stepSeconds + noteSeconds
  await new Promise((r) => setTimeout(r, total * 1000 + 100))
}

export function stopAll() {
  piano?.releaseAll()
  sine?.releaseAll()
}
