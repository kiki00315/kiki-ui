import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import './TextField.css'
import './Select.css'

export type SelectOption = { value: string; label: string; disabled?: boolean }

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children'> & {
  /** 選ぶ項目の名前。画面に必ず出す */
  label: string
  /** 選べる項目の一覧 */
  options: SelectOption[]
  /** まだ何も選んでいないときに出す文（選べない項目として先頭に入る） */
  placeholder?: string
  hint?: string
  /** エラーの文章。あると赤い枠になり、スクリーンリーダーにも伝わる */
  error?: string
}

// ブラウザ標準の <select> をそのまま使う。キーボード操作・スマホの選択画面・読み上げが、最初から正しく動くため
export function Select({ label, options, placeholder, hint, error, id, className = '', ...rest }: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  const hintId = `${selectId}-hint`
  const errorId = `${selectId}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  // placeholder があるときは、何も選ばれていない状態（空の値）から始める
  const uncontrolledDefault = rest.value === undefined && rest.defaultValue === undefined && placeholder ? '' : undefined

  return (
    <div className={`kk-field ${error ? 'kk-field--error' : ''} ${className}`.trim()}>
      <label className="kk-field__label" htmlFor={selectId}>{label}</label>
      <select
        id={selectId}
        className="kk-field__input kk-select"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        defaultValue={uncontrolledDefault}
        {...rest}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
      {hint && <p className="kk-field__hint" id={hintId}>{hint}</p>}
      {error && <p className="kk-field__error" id={errorId}>{error}</p>}
    </div>
  )
}
