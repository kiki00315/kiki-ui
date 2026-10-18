import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { WEEKDAYS, addDays, addMonths, fromISO, monthWeeks, toISO } from './calendarDates'
import './Calendar.css'

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
  /** カレンダーの名前（「ご希望の日」など） */
  'aria-label': string
}

// WAI-ARIA の「日付の表（grid）」の作法にそろえる
//   ← →：前の日・次の日 ／ ↑ ↓：前の週・次の週 ／ Home・End：その週のはじめ・おわり
//   PageUp・PageDown：前の月・次の月（Shift をつけると、前の年・次の年）／ Enter・Space：選ぶ
//   Tab で入ると、フォーカスの置き場所は 1 か所だけ（選んだ日、なければ今日）
export function Calendar({ value, defaultValue, onChange, min, max, today: todayProp, ...rest }: CalendarProps) {
  const headingId = useId()
  // 本当の今日は、最初に 1 回だけ決める（描きなおすたびに Date を呼ぶと、日付をまたいだときに、表示がゆれるため）
  const [realToday] = useState(() => toISO(new Date()))
  const todayISO = todayProp ?? realToday
  const [inner, setInner] = useState<string | null>(defaultValue ?? null)
  const selected = value !== undefined ? value || null : inner

  const outOfRange = (iso: string) => (!!min && iso < min) || (!!max && iso > max)
  // 範囲の外に出ないよう、いちばん近い日にそろえる
  const clamp = (iso: string) => (min && iso < min ? min : max && iso > max ? max : iso)

  // フォーカスのある日（表示している月も、ここから決まる）
  const [focusISO, setFocusISO] = useState(() => clamp(selected ?? todayISO))
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({})
  // 矢印キーで動かしたときだけ、新しい日のボタンへフォーカスを移す（月を切り替えるボタンを押したときは、移さない）
  const moveFocus = useRef(false)
  useEffect(() => {
    if (moveFocus.current) { buttons.current[focusISO]?.focus(); moveFocus.current = false }
  }, [focusISO])

  const view = fromISO(focusISO)
  const weeks = monthWeeks(view.getFullYear(), view.getMonth())
  const isoOf = (day: number) => toISO(new Date(view.getFullYear(), view.getMonth(), day))

  const go = (next: string, byKeyboard: boolean) => {
    const target = clamp(next)
    if (target === focusISO) return
    moveFocus.current = byKeyboard
    setFocusISO(target)
  }

  const choose = (iso: string) => {
    if (outOfRange(iso)) return
    setInner(iso)
    setFocusISO(iso)
    onChange?.(iso)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const dow = fromISO(focusISO).getDay()
    let next: string | null = null
    if (e.key === 'ArrowLeft') next = addDays(focusISO, -1)
    else if (e.key === 'ArrowRight') next = addDays(focusISO, 1)
    else if (e.key === 'ArrowUp') next = addDays(focusISO, -7)
    else if (e.key === 'ArrowDown') next = addDays(focusISO, 7)
    else if (e.key === 'Home') next = addDays(focusISO, -dow)
    else if (e.key === 'End') next = addDays(focusISO, 6 - dow)
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
            {WEEKDAYS.map((w) => (
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
                return (
                  <td key={di} role="gridcell" aria-selected={selected === iso} aria-disabled={disabled || undefined} className="kk-calendar__cell">
                    <button
                      ref={(el) => { buttons.current[iso] = el }}
                      type="button"
                      className={`kk-calendar__day ${iso === todayISO ? 'kk-calendar__day--today' : ''}`.trim()}
                      tabIndex={iso === focusISO ? 0 : -1}
                      aria-current={iso === todayISO ? 'date' : undefined}
                      aria-label={`${view.getFullYear()}年${view.getMonth() + 1}月${day}日（${WEEKDAYS[di].short}）`}
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
    </div>
  )
}
