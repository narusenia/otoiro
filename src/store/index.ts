import { get, set } from 'idb-keyval'
import { useSyncExternalStore } from 'react'
import type { Timbre } from '@/audio/engine'
import type { Progress } from '@/learning/types'
import { localDate, recordStudy, type Streak } from '@/learning/streak'
import type { NoteNameStyle } from '@/theory/notation'
import type { Weights } from '@/theory/quiz'

/**
 * 保存層。永続化先（IndexedDB）はこのファイルだけが知る。
 * 将来クラウド同期へ移すときは loadState / persist を差し替える。
 * IndexedDB が使えない環境（プライベートモード等）ではメモリのみで動作する。
 */
export type Theme = 'system' | 'light' | 'dark'

export type AppState = {
  settings: { timbre: Timbre; noteStyle: NoteNameStyle; theme: Theme; showPiano: boolean }
  progress: Progress
  /** 出題項目ごとの苦手重み（キーはドリル側が決める項目 id。例: interval:M3） */
  weights: Weights
  streak: Streak
}

export const DEFAULT_STATE: AppState = {
  settings: { timbre: 'piano', noteStyle: 'doremi', theme: 'system', showPiano: true },
  progress: {},
  weights: {},
  streak: { last: null, count: 0 },
}

const KEY = 'otoiro:v1'

let state: AppState = DEFAULT_STATE
const listeners = new Set<() => void>()

/** 保存済みの値を既定値へ重ねる（項目追加に強くする） */
const merge = (saved: Partial<AppState> | undefined): AppState => ({
  ...DEFAULT_STATE,
  ...saved,
  settings: { ...DEFAULT_STATE.settings, ...saved?.settings },
})

/** アプリ起動時に 1 回だけ呼ぶ */
export async function loadState(): Promise<void> {
  try {
    state = merge(await get<Partial<AppState>>(KEY))
  } catch {
    state = DEFAULT_STATE
  }
}

async function persist() {
  try {
    await set(KEY, state)
  } catch {
    // 保存できない環境ではメモリのみ
  }
}

export function updateState(fn: (s: AppState) => AppState): void {
  state = fn(state)
  listeners.forEach((l) => l())
  void persist()
}

export const useAppState = (): AppState =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
  )

/** 今日学習したことを記録（ドリルの回答時に呼ぶ） */
export const markStudiedToday = () =>
  updateState((s) => ({ ...s, streak: recordStudy(s.streak, localDate()) }))
