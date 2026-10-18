import { useEffect, useRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import './Choice.css'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  /** 選択肢の名前。画面に必ず出す。クリックしても切り替わる */
  label: string
  /** 「一部だけ選ばれている」状態（親の項目など）。見た目と読み上げが「一部」になる */
  indeterminate?: boolean
}

export function Checkbox({ label, indeterminate = false, className = '', disabled, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)
  // indeterminate は HTML の属性にはなく、JavaScript で設定するしかない
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className={`kk-choice ${disabled ? 'kk-choice--disabled' : ''} ${className}`.trim()}>
      <input ref={ref} type="checkbox" className="kk-choice__input" disabled={disabled} {...rest} />
      <span>{label}</span>
    </label>
  )
}
