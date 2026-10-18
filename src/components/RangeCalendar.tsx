import { useState } from 'react'
import { toISO } from './calendarDates'
import type { WeekStart } from './calendarDates'
import { CalendarGrid } from './CalendarGrid'

export type DateRange = {
  /** はじまりの日（「2026-10-19」の形）。まだ選んでいなければ null */
  start: string | null
  /** おわりの日。まだ選んでいなければ null */
  end: string | null
}

export type RangeCalendarProps = {
  /** 選ばれている期間。親が持つとき */
  value?: DateRange
  /** 最初に選んでおく期間。親が持たないとき */
  defaultValue?: DateRange
  /** 日を選ぶたびに呼ばれる。1 回目は { start, end: null }、2 回目で { start, end } がそろう */
  onChange?: (range: DateRange) => void
  min?: string
  max?: string
  today?: string
  weekStart?: WeekStart
  'aria-label': string
}

const EMPTY: DateRange = { start: null, end: null }

const fmt = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

// 開始日と終了日を、2 回押して選ぶカレンダー。
//   1 回目：開始日（それまでの期間は、いったん消える）／ 2 回目：終了日（開始日より前を押したときは、そちらが新しい開始日になる）
//   開始日と終了日を同じ日にすると、1 日だけの期間になる
//   期間の、はじめから終わりまでの全部の日が aria-selected になり、選んだ結果は、読み上げでも知らせる
export function RangeCalendar({ value, defaultValue, onChange, min, max, today: todayProp, weekStart = 0, ...rest }: RangeCalendarProps) {
  const [realToday] = useState(() => toISO(new Date()))
  const today = todayProp ?? realToday
  const [inner, setInner] = useState<DateRange>(defaultValue ?? EMPTY)
  const range = value ?? inner
  const [announce, setAnnounce] = useState('')

  const update = (next: DateRange) => {
    setInner(next)
    onChange?.(next)
  }

  const choose = (iso: string) => {
    // 開始日だけ選ばれている途中で、開始日より後（同じ日を含む）を押した → 終了日にする
    if (range.start && !range.end && iso >= range.start) {
      update({ start: range.start, end: iso })
      setAnnounce(`${fmt(range.start)}から${fmt(iso)}までを選びました`)
    } else {
      // 1 回目、または、やり直し（期間がそろっているとき・開始日より前を押したとき）→ 新しい開始日にする
      update({ start: iso, end: null })
      setAnnounce(`開始日を${fmt(iso)}にしました。終了日を選んでください`)
    }
  }

  const dayState = (iso: string) => {
    const { start, end } = range
    if (start && iso === start && (!end || end === start)) return { selected: true, edge: end ? ('single' as const) : ('start' as const) }
    if (start && end && iso === start) return { selected: true, edge: 'start' as const }
    if (start && end && iso === end) return { selected: true, edge: 'end' as const }
    if (start && end && iso > start && iso < end) return { selected: true, inRange: true }
    return { selected: false }
  }

  return (
    <CalendarGrid
      aria-label={rest['aria-label']}
      min={min}
      max={max}
      today={today}
      weekStart={weekStart}
      initialFocus={range.start ?? today}
      dayState={dayState}
      onChoose={choose}
      announce={announce}
    />
  )
}
