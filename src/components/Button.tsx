import type { ComponentPropsWithRef } from 'react'
import './Button.css'

// 使える種類と大きさを、型で決める。ここにない値を書くと、エディタでエラーになる
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

// ComponentPropsWithRef にすると、親から ref（フォーカスを移したいときなど）を渡せる（React 19 では、ref も普通の引数）
export type ButtonProps = ComponentPropsWithRef<'button'> & {
  /** 見た目の種類。primary = いちばん目立つ、secondary = ふつう、ghost = 枠も背景もない */
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: ButtonProps) {
  // type を省略すると form の中で送信されてしまうので、初期値は 'button' にしておく
  return <button type={type} className={`kk-btn kk-btn--${variant} kk-btn--${size} ${className}`.trim()} {...rest} />
}
