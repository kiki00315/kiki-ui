import type { InputHTMLAttributes } from 'react'
import './Choice.css'

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'role'> & {
  /** 何を切り替えるか（「通知を受け取る」など）。オンかオフかを名前に入れない */
  label: string
}

// 中身は、標準のチェックボックスに role="switch" を付けたもの。
// Space キーでの切り替え・フォーカス・読み上げ（「オン」「オフ」）が、最初から正しく動く
export function Switch({ label, className = '', disabled, ...rest }: SwitchProps) {
  return (
    <label className={`kk-choice ${disabled ? 'kk-choice--disabled' : ''} ${className}`.trim()}>
      <input type="checkbox" role="switch" className="kk-choice__input" disabled={disabled} {...rest} />
      <span>{label}</span>
    </label>
  )
}
