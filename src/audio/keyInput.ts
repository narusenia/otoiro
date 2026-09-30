/**
 * 鍵盤回答の受け口。画面下のピアノ（PianoDock）が押された鍵をここへ流し、
 * 鍵盤回答のドリルが登録した関数が受け取る。同時に 1 つだけ登録できる。
 */
type Sink = (midi: number) => void

let sink: Sink | null = null

/** 登録する。戻り値は解除関数（useEffect のクリーンアップに渡す） */
export function registerKeySink(fn: Sink): () => void {
  sink = fn
  return () => {
    if (sink === fn) sink = null
  }
}

export const sendKey = (midi: number): void => sink?.(midi)
