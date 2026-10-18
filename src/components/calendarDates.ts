// カレンダーで使う、日付の計算。日付は「2026-10-19」の形の文字（年-月-日）で持つ。
// ブラウザの時差で 1 日ずれないよう、Date は「その地域の年・月・日」で作る（UTC は使わない）

const pad = (n: number) => String(n).padStart(2, '0')

/** Date → '2026-10-19' */
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** '2026-10-19' → Date（その日の 0 時） */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso)
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))
}

/** n か月あとの、同じ日付（その月にない日付は、月末にする。例：1/31 の 1 か月後は 2/28） */
export function addMonths(iso: string, n: number): string {
  const d = fromISO(iso)
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return toISO(new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), lastDay)))
}

/** 週のはじまり。0 = 日曜、1 = 月曜 */
export type WeekStart = 0 | 1

/** その日が、週の何番目か（0 から。はじまりの曜日が 0） */
export function weekdayIndex(iso: string, weekStart: WeekStart): number {
  return (fromISO(iso).getDay() - weekStart + 7) % 7
}

/** その月の、日にちの並び。週のはじまりに合わせる。月のはじめ・おわりの空きは null */
export function monthWeeks(year: number, month: number, weekStart: WeekStart = 0): (number | null)[][] {
  const offset = (new Date(year, month, 1).getDay() - weekStart + 7) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
}

export const WEEKDAYS = [
  { short: '日', long: '日曜日' },
  { short: '月', long: '月曜日' },
  { short: '火', long: '火曜日' },
  { short: '水', long: '水曜日' },
  { short: '木', long: '木曜日' },
  { short: '金', long: '金曜日' },
  { short: '土', long: '土曜日' },
]

/** 見出しに並べる曜日（週のはじまりから順に） */
export function weekdayHeaders(weekStart: WeekStart) {
  return [...WEEKDAYS.slice(weekStart), ...WEEKDAYS.slice(0, weekStart)]
}
