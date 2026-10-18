import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

// 使える種類と大きさを、型で決める。ここにない値を書くと、エディタでエラーになる
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 見た目の種類。primary = いちばん目立つ、secondary = ふつう、ghost = 枠も背景もない */
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: ButtonProps) {
  // type を省略すると form の中で送信されてしまうので、初期値は 'button' にしておく
  return <button type={type} className={`kk-btn kk-btn--${variant} kk-btn--${size} ${className}`.trim()} {...rest} />
}
