import type { HTMLAttributes } from 'react'
import './Badge.css'

// 使える種類を、型で決める。色だけで意味を伝えないよう、必ず文字（children）を入れる
export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** 状態の種類。neutral = ふつう、success = 成功・公開中、warning = 注意、error = 失敗 */
  variant?: BadgeVariant
}

export function Badge({ variant = 'neutral', className = '', ...rest }: BadgeProps) {
  return <span className={`kk-badge kk-badge--${variant} ${className}`.trim()} {...rest} />
}
