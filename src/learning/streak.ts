export type Streak = { last: string | null; count: number }

/** ローカル日付 YYYY-MM-DD */
export const localDate = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const dayNumber = (date: string) => Math.round(Date.parse(`${date}T00:00:00Z`) / 86_400_000)

/** 今日学習したことを記録。同日は変化なし、前日からは +1、途切れたら 1 に戻る */
export function recordStudy(streak: Streak, today: string): Streak {
  if (streak.last === today) return streak
  const continues = streak.last !== null && dayNumber(today) - dayNumber(streak.last) === 1
  return { last: today, count: continues ? streak.count + 1 : 1 }
}

/** 表示用。最終学習日が今日か昨日なら継続中、それ以前は 0 */
export function currentStreak(streak: Streak, today: string): number {
  if (streak.last === null) return 0
  return dayNumber(today) - dayNumber(streak.last) <= 1 ? streak.count : 0
}
