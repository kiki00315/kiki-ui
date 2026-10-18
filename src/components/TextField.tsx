import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import './TextField.css'

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** 入力欄の名前。画面に必ず出す（placeholder だけだと、入力すると消えてしまうため） */
  label: string
  /** 入力のヒント（「8 文字以上」など） */
  hint?: string
  /** エラーの文章。あると赤い枠になり、スクリーンリーダーにも伝わる */
  error?: string
}

export function TextField({ label, hint, error, id, className = '', ...rest }: TextFieldProps) {
  // id を自動で作って、label と入力欄、ヒント・エラーを結びつける
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`kk-field ${error ? 'kk-field--error' : ''} ${className}`.trim()}>
      <label className="kk-field__label" htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className="kk-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && <p className="kk-field__hint" id={hintId}>{hint}</p>}
      {error && <p className="kk-field__error" id={errorId}>{error}</p>}
    </div>
  )
}
