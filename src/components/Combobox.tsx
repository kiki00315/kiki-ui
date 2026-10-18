import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import './TextField.css'
import './Combobox.css'

export type ComboboxOption = { value: string; label: string; disabled?: boolean }

export type ComboboxProps = {
  /** 選ぶ項目の名前。画面に必ず出す */
  label: string
  options: ComboboxOption[]
  /** 選ばれている値（親が持つとき） */
  value?: string
  /** 最初に選んでおく値（親が持たないとき） */
  defaultValue?: string
  onChange?: (value: string | null) => void
  placeholder?: string
  hint?: string
  /** エラーの文章。あると赤い枠になり、入力欄に結びつく */
  error?: string
  /** 候補が 1 つもないときの文 */
  emptyText?: string
  disabled?: boolean
}

// WAI-ARIA の「コンボボックス（リストつき）」の作法にそろえる
//   入力欄に文字を打つと候補が絞られる。↑↓ で候補を選び（フォーカスは入力欄のまま）、Enter で決める。Esc で閉じる
export function Combobox({ label, options, value, defaultValue, onChange, placeholder, hint, error, emptyText = '見つかりません', disabled }: ComboboxProps) {
  const base = useId()
  const listId = `${base}-list`
  const hintId = `${base}-hint`
  const errorId = `${base}-error`
  const inputRef = useRef<HTMLInputElement>(null)

  // 選ばれている値（親が value を渡したら親が決める。渡さなければ自分で覚える）
  const [inner, setInner] = useState<string | null>(defaultValue ?? null)
  const selected = value !== undefined ? value : inner
  const selectedLabel = options.find((o) => o.value === selected)?.label ?? ''

  const [text, setText] = useState(selectedLabel)
  const [open, setOpen] = useState(false)
  // 文字を打ったか（打つまでは、全部の候補を見せる。選んだ項目の名前だけで絞ってしまわないため）
  const [typed, setTyped] = useState(false)
  const [active, setActive] = useState(-1)

  const shown = typed ? options.filter((o) => o.label.toLowerCase().includes(text.trim().toLowerCase())) : options
  const enabled = shown.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0)

  const optionId = (i: number) => `${base}-opt-${i}`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  const commit = (opt: ComboboxOption) => {
    setInner(opt.value)
    setText(opt.label)
    setTyped(false)
    setOpen(false)
    setActive(-1)
    onChange?.(opt.value)
  }

  const closeAndRestore = () => {
    // 閉じるとき、入力欄の文字を「選ばれている項目の名前」に戻す（途中の文字を残さない）
    setOpen(false)
    setActive(-1)
    setTyped(false)
    setText(selectedLabel)
  }

  const move = (dir: 1 | -1) => {
    if (enabled.length === 0) return
    const pos = enabled.indexOf(active)
    // 候補をまだ選んでいない状態で開いたあとの最初の ↑↓ は、選ばれている項目から始める（なければ、端から）
    const selectedAt = shown.findIndex((o) => o.value === selected)
    if (pos === -1 && !typed && selectedAt >= 0 && !shown[selectedAt].disabled) { setActive(selectedAt); return }
    const next = pos === -1 ? (dir === 1 ? 0 : enabled.length - 1) : (pos + dir + enabled.length) % enabled.length
    setActive(enabled[next])
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!open) setOpen(true); move(-1) }
    else if (e.key === 'Enter') {
      // 候補を選んでいるときだけ決める（フォームの送信は止める）
      if (open && active >= 0 && shown[active]) { e.preventDefault(); commit(shown[active]) }
    } else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); closeAndRestore() }
    } else if (e.key === 'Tab') closeAndRestore()
  }

  return (
    <div className={`kk-field kk-combobox ${error ? 'kk-field--error' : ''}`.trim()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) closeAndRestore() }}>
      <label className="kk-field__label" htmlFor={`${base}-input`}>{label}</label>
      <div className="kk-combobox__box">
        <input
          ref={inputRef}
          id={`${base}-input`}
          className="kk-field__input kk-combobox__input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          placeholder={placeholder}
          disabled={disabled}
          value={text}
          onChange={(e) => { setText(e.target.value); setTyped(true); setOpen(true); setActive(-1) }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <span className="kk-combobox__caret" aria-hidden="true" />
        {open && (
          <ul id={listId} role="listbox" aria-label={label} className="kk-combobox__list">
            {shown.length === 0 && <li className="kk-combobox__empty" role="presentation">{emptyText}</li>}
            {shown.map((o, i) => (
              <li
                key={o.value}
                id={optionId(i)}
                role="option"
                aria-selected={o.value === selected}
                aria-disabled={o.disabled || undefined}
                className={`kk-combobox__option ${i === active ? 'kk-combobox__option--active' : ''}`.trim()}
                // マウスで押しても、入力欄からフォーカスが外れないようにする（外れると、候補が閉じてしまう）
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { if (!o.disabled) { commit(o); inputRef.current?.focus() } }}
                onMouseMove={() => { if (!o.disabled) setActive(i) }}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* 候補の数を、読み上げで知らせる（画面には出さない） */}
      <p className="kk-visually-hidden" role="status">{open ? (shown.length === 0 ? emptyText : `${shown.length} 件の候補があります`) : ''}</p>
      {hint && <p className="kk-field__hint" id={hintId}>{hint}</p>}
      {error && <p className="kk-field__error" id={errorId}>{error}</p>}
    </div>
  )
}
