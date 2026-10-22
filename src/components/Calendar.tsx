import { useState } from 'react'
import { toISO } from './calendarDates'
import type { WeekStart } from './calendarDates'
import { CalendarGrid } from './CalendarGrid'

export type CalendarProps = {
  /** 選ばれている日（「2026-10-19」の形）。親が持つとき。空なら、まだ選んでいない */
  value?: string
  /** 最初に選んでおく日。親が持たないとき */
  defaultValue?: string
  onChange?: (value: string) => void
  /** 選べる、いちばん早い日 */
  min?: string
  /** 選べる、いちばん遅い日 */
  max?: string
  /** 「今日」とする日（「2026-10-19」の形）。省略すると、本当の今日。テストや見本で、日付を固定したいときに使う */
  today?: string
  /** 週のはじまり。0 = 日曜（初期値）、1 = 月曜 */
  weekStart?: WeekStart
  /** カレンダーの名前（「ご希望の日」など） */
  'aria-label': string
}

// 1 日を選ぶカレンダー。表とキー操作は CalendarGrid（WAI-ARIA の日付の表）が持ち、ここは「どの日が選ばれているか」だけを持つ
export function Calendar({ value, defaultValue, onChange, min, max, today: todayProp, weekStart = 0, ...rest }: CalendarProps) {
  // 本当の今日は、最初に 1 回だけ決める（描きなおすたびに Date を呼ぶと、日付をまたいだときに、表示がゆれるため）
  const [realToday] = useState(() => toISO(new Date()))
  const today = todayProp ?? realToday
  const [inner, setInner] = useState<string | null>(defaultValue ?? null)
  const selected = value !== undefined ? value || null : inner

  return (
    <CalendarGrid
      aria-label={rest['aria-label']}
      min={min}
      max={max}
      today={today}
      weekStart={weekStart}
      initialFocus={selected ?? today}
      dayState={(iso) => (iso === selected ? { selected: true, edge: 'single' } : { selected: false })}
      onChoose={(iso) => { setInner(iso); onChange?.(iso) }}
    />
  )
}
