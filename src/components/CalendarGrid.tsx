import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { WEEKDAYS, addDays, addMonths, fromISO, monthWeeks, toISO, weekdayHeaders, weekdayIndex } from './calendarDates'
import type { WeekStart } from './calendarDates'
import './Calendar.css'

// 1 日ぶんの、選ばれ方。Calendar（1 日を選ぶ）と RangeCalendar（期間を選ぶ）で、これだけが違う
export type DayState = {
  /** 選ばれている日（期間なら、はじめから終わりまでの全部の日） */
  selected: boolean
  /** 期間の、はじめ・おわりの日（1 日だけ選ぶときは 'single'） */
  edge?: 'single' | 'start' | 'end'
  /** 期間の、まん中の日（はじめ・おわりの間） */
  inRange?: boolean
}

export type CalendarGridProps = {
  'aria-label': string
  min?: string
  max?: string
  today: string
  weekStart: WeekStart
  /** 最初にフォーカスを置く日（選ばれている日、なければ今日） */
  initialFocus: string
  dayState: (iso: string) => DayState
  onChoose: (iso: string) => void
  /** 読み上げだけで知らせる文（「開始日を選びました」など）。画面には出ない */
  announce?: string
}

// 日付の表そのもの（月の見出し・前後の月のボタン・日の表）と、キー操作。
// WAI-ARIA の「日付の表（grid）」の作法にそろえる
//   ← →：前の日・次の日 ／ ↑ ↓：前の週・次の週 ／ Home・End：その週のはじめ・おわり
//   PageUp・PageDown：前の月・次の月（Shift をつけると、前の年・次の年）／ Enter・Space：選ぶ
//   Tab で入ると、フォーカスの置き場所は 1 か所だけ
export function CalendarGrid({ min, max, today, weekStart, initialFocus, dayState, onChoose, announce, ...rest }: CalendarGridProps) {
  const headingId = useId()
  const outOfRange = (iso: string) => (!!min && iso < min) || (!!max && iso > max)
  // 範囲の外に出ないよう、いちばん近い日にそろえる
  const clamp = (iso: string) => (min && iso < min ? min : max && iso > max ? max : iso)

  // フォーカスのある日（表示している月も、ここから決まる）
  const [focusISO, setFocusISO] = useState(() => clamp(initialFocus))
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({})
  // 矢印キーで動かしたときだけ、新しい日のボタンへフォーカスを移す（月を切り替えるボタンを押したときは、移さない）
  const moveFocus = useRef(false)
  useEffect(() => {
    if (moveFocus.current) { buttons.current[focusISO]?.focus(); moveFocus.current = false }
  }, [focusISO])

  const view = fromISO(focusISO)
  const weeks = monthWeeks(view.getFullYear(), view.getMonth(), weekStart)
  const isoOf = (day: number) => toISO(new Date(view.getFullYear(), view.getMonth(), day))

  const go = (next: string, byKeyboard: boolean) => {
    const target = clamp(next)
    if (target === focusISO) return
    moveFocus.current = byKeyboard
    setFocusISO(target)
  }

  const choose = (iso: string) => {
    if (outOfRange(iso)) return
    setFocusISO(iso)
    onChoose(iso)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const pos = weekdayIndex(focusISO, weekStart)
    let next: string | null = null
    if (e.key === 'ArrowLeft') next = addDays(focusISO, -1)
    else if (e.key === 'ArrowRight') next = addDays(focusISO, 1)
    else if (e.key === 'ArrowUp') next = addDays(focusISO, -7)
    else if (e.key === 'ArrowDown') next = addDays(focusISO, 7)
    else if (e.key === 'Home') next = addDays(focusISO, -pos)
    else if (e.key === 'End') next = addDays(focusISO, 6 - pos)
    else if (e.key === 'PageUp') next = addMonths(focusISO, e.shiftKey ? -12 : -1)
    else if (e.key === 'PageDown') next = addMonths(focusISO, e.shiftKey ? 12 : 1)
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(focusISO); return }
    if (next) { e.preventDefault(); go(next, true) }
  }

  // 前の月・次の月のボタン（その月の日が、全部範囲の外なら、押せない）
  const prevMonthLast = toISO(new Date(view.getFullYear(), view.getMonth(), 0))
  const nextMonthFirst = toISO(new Date(view.getFullYear(), view.getMonth() + 1, 1))
  const canPrev = !min || prevMonthLast >= min
  const canNext = !max || nextMonthFirst <= max

  return (
    <div className="kk-calendar" role="group" aria-label={rest['aria-label']}>
      <div className="kk-calendar__head">
        <button type="button" className="kk-calendar__nav" disabled={!canPrev} onClick={() => go(addMonths(focusISO, -1), false)} aria-label="前の月">‹</button>
        {/* 月が変わったことを、読み上げで知らせる（aria-live） */}
        <h2 className="kk-calendar__title" id={headingId} aria-live="polite">{view.getFullYear()}年{view.getMonth() + 1}月</h2>
        <button type="button" className="kk-calendar__nav" disabled={!canNext} onClick={() => go(addMonths(focusISO, 1), false)} aria-label="次の月">›</button>
      </div>
      <table className="kk-calendar__grid" role="grid" aria-labelledby={headingId} onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {weekdayHeaders(weekStart).map((w) => (
              <th key={w.short} scope="col" abbr={w.long} className="kk-calendar__dow">{w.short}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                if (day === null) return <td key={di} className="kk-calendar__blank" />
                const iso = isoOf(day)
                const disabled = outOfRange(iso)
                const st = dayState(iso)
                return (
                  <td
                    key={di}
                    role="gridcell"
                    aria-selected={st.selected}
                    aria-disabled={disabled || undefined}
                    data-edge={st.edge}
                    data-in-range={st.inRange || undefined}
                    className="kk-calendar__cell"
                  >
                    <button
                      ref={(el) => { buttons.current[iso] = el }}
                      type="button"
                      className={`kk-calendar__day ${iso === today ? 'kk-calendar__day--today' : ''}`.trim()}
                      tabIndex={iso === focusISO ? 0 : -1}
                      aria-current={iso === today ? 'date' : undefined}
                      aria-label={`${view.getFullYear()}年${view.getMonth() + 1}月${day}日（${WEEKDAYS[fromISO(iso).getDay()].short}）`}
                      disabled={disabled}
                      onClick={() => choose(iso)}
                      onFocus={() => setFocusISO(iso)}
                    >
                      {day}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="kk-visually-hidden" role="status">{announce ?? ''}</p>
    </div>
  )
}
