import type { ReactNode } from 'react'
import './Alert.css'

export type AlertVariant = 'neutral' | 'success' | 'warning' | 'error'

export type AlertProps = {
  variant?: AlertVariant
  /** 見出し（任意）。短く、何についてのお知らせかを書く */
  title?: string
  children: ReactNode
  /** 閉じるボタンを出す。押したときの処理（表示をやめる処理）を渡す */
  onClose?: () => void
}

// 色だけで意味を伝えないよう、読み上げ用の文字（「エラー：」など）を先頭に入れる
const LABEL: Record<AlertVariant, string> = {
  neutral: 'お知らせ',
  success: '成功',
  warning: '注意',
  error: 'エラー',
}

// ページの中に置く、動かないお知らせ（Toast は、あとから出てきて消えるもの）。
// 失敗と注意は role="alert"（すぐ読み上げ）、ほかは role="status"（読み上げ中の文を邪魔しない）
export function Alert({ variant = 'neutral', title, children, onClose }: AlertProps) {
  const urgent = variant === 'error' || variant === 'warning'
  return (
    <div className={`kk-alert kk-alert--${variant}`} role={urgent ? 'alert' : 'status'}>
      <div className="kk-alert__body">
        <span className="kk-visually-hidden">{LABEL[variant]}：</span>
        {title && <p className="kk-alert__title">{title}</p>}
        <div className="kk-alert__text">{children}</div>
      </div>
      {onClose && (
        <button type="button" className="kk-alert__close" onClick={onClose} aria-label="閉じる">×</button>
      )}
    </div>
  )
}
