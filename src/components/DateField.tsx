import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Calendar } from './Calendar'
import { formatDate, parseDate } from './dateText'
import './TextField.css'
import './DateField.css'

export type DateFieldProps = {
  /** 入力欄の名前（「ご希望の日」など）。画面に必ず出す */
  label: string
  /** 選ばれている日（「2026-10-20」の形）。親が持つとき。空なら、まだ選んでいない */
  value?: string
  /** 最初の日。親が持たないとき */
  defaultValue?: string
  /** 日付が決まったとき、「2026-10-20」の形（消したときは ''）で知らせる */
  onChange?: (value: string) => void
  /** 選べる、いちばん早い日 */
  min?: string
  /** 選べる、いちばん遅い日 */
  max?: string
  /** 「今日」とする日。省略すると、本当の今日（見本・テスト用） */
  today?: string
  hint?: string
  /** エラーの文章（自分で決めたいとき）。省略すると、形がちがう・範囲の外のときに、自動で出る */
  error?: string
  disabled?: boolean
}

// 「打っても選んでもよい」日付の欄。
//   打つ：2026/10/20 のほか、全角の数字・「年月日」・区切りなしも読める。欄を離れる・Enter で確定する
//   選ぶ：右のボタンで、カレンダー（Calendar）が開く。日を選ぶと閉じて、フォーカスがボタンに戻る
export function DateField({ label, value, defaultValue, onChange, min, max, today, hint, error, disabled }: DateFieldProps) {
  const base = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const [inner, setInner] = useState(defaultValue ?? '')
  const selected = value !== undefined ? value : inner
  // 入力欄に出している文字。打っている途中は、選ばれている日と、ちがってよい
  const [text, setText] = useState(selected ? formatDate(selected) : '')
  const [open, setOpen] = useState(false)
  const [problem, setProblem] = useState('')

  const rangeProblem = (iso: string) =>
    min && iso < min ? `${formatDate(min)} 以降の日付を選んでください` : max && iso > max ? `${formatDate(max)} 以前の日付を選んでください` : ''

  // 親が value を持っているとき、親が値を変えたら（リセットなど）、入力欄の文字も合わせる。
  // 描いている最中に state を直す書き方（effect を使わないので、1 回余分に描きなおすことがない）
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    if (value !== undefined) { setText(value ? formatDate(value) : ''); setProblem('') }
  }

  const commit = (iso: string) => {
    setInner(iso)
    setText(iso ? formatDate(iso) : '')
    setProblem('')
    // 同じ日付のままなら、変わったと知らせない（欄を離れるたびに、onChange が呼ばれないように）
    if (iso !== selected) onChange?.(iso)
  }

  // 打った文字を確定する。空なら「消した」、読めなければエラー、範囲の外ならエラー
  const confirmText = () => {
    if (text.trim() === '') { if (selected) commit(''); else setProblem(''); return }
    const iso = parseDate(text)
    if (!iso) { setProblem('日付の形が正しくありません（例：2026/10/20）'); return }
    const range = rangeProblem(iso)
    if (range) { setProblem(range); return }
    commit(iso)
  }

  // 開いたら、カレンダーの中の、フォーカスの置き場所の日へフォーカスを移す
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()
  }, [open])

  // パネルの外を押したら閉じる
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 日本語の変換を確定する Enter では、日付の確定をしない
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); confirmText() }
  }

  const onWrapKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  const shownError = error ?? (problem || (selected ? rangeProblem(selected) : ''))
  const describedBy = [hint && `${base}-hint`, shownError && `${base}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`kk-field kk-datefield ${shownError ? 'kk-field--error' : ''}`.trim()} ref={wrapRef} onKeyDown={onWrapKeyDown}>
      <label className="kk-field__label" htmlFor={`${base}-input`}>{label}</label>
      <div className="kk-datefield__box">
        <input
          ref={inputRef}
          id={`${base}-input`}
          className="kk-field__input kk-datefield__input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="例：2026/10/20"
          value={text}
          disabled={disabled}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => { setText(e.target.value); setProblem('') }}
          onBlur={confirmText}
          onKeyDown={onInputKeyDown}
        />
        <button
          ref={buttonRef}
          type="button"
          className="kk-datefield__open"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? `${base}-panel` : undefined}
          aria-label="カレンダーを開く"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="kk-datefield__icon" aria-hidden="true" />
        </button>
        {open && (
          <div ref={panelRef} id={`${base}-panel`} role="dialog" aria-label={`${label}を選ぶカレンダー`} className="kk-datefield__panel">
            <Calendar
              aria-label={label}
              value={selected}
              min={min}
              max={max}
              today={today}
              onChange={(iso) => { commit(iso); setOpen(false); buttonRef.current?.focus() }}
            />
          </div>
        )}
      </div>
      {hint && <p className="kk-field__hint" id={`${base}-hint`}>{hint}</p>}
      {shownError && <p className="kk-field__error" id={`${base}-error`}>{shownError}</p>}
    </div>
  )
}
