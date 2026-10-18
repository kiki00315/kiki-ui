import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './toastContext'
import type { ToastApi, ToastVariant } from './toastContext'
import './Toast.css'

type ToastItem = { id: number; message: string; variant: ToastVariant; duration: number }

// 1 つ分のお知らせ。マウスを乗せている間・フォーカス中は、消えるまでの時間を止める（読み終わる前に消えないように）
function ToastView({ item, onClose }: { item: ToastItem; onClose: (id: number) => void }) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    // duration が 0 のお知らせは、自動では消さない
    if (paused || item.duration <= 0) return
    const timer = setTimeout(() => onClose(item.id), item.duration)
    return () => clearTimeout(timer)
  }, [paused, item.id, item.duration, onClose])

  return (
    <div
      className={`kk-toast kk-toast--${item.variant}`}
      // エラーは、すぐ読み上げてほしいので role="alert"。ほかは、読み上げ中の文を邪魔しない role="status"
      role={item.variant === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="kk-toast__message">{item.message}</span>
      <button type="button" className="kk-toast__close" onClick={() => onClose(item.id)} aria-label="閉じる">×</button>
    </div>
  )
}

// アプリ全体を包む。どこからでも useToast() で、お知らせを出せるようになる
export type ToastPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'

export type ToastProviderProps = {
  children: ReactNode
  /** 同時に出しておく数の上限。超えたら、いちばん古いものから消える。初期値は 3 */
  max?: number
  /** お知らせを出す場所（画面の四隅）。初期値は右下（bottom-end）。ほかの部品のじゃまにならない隅を選ぶ */
  position?: ToastPosition
}

export function ToastProvider({ children, max = 3, position = 'bottom-end' }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const close = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), [])
  const api = useMemo<ToastApi>(() => ({
    show: (message, { variant = 'neutral', duration = 5000 } = {}) => {
      const id = nextId.current++
      // 上限を超えた分は、古いほうから外す（画面が、お知らせでうまらないように）
      setItems((list) => [...list, { id, message, variant, duration }].slice(-max))
      return id
    },
    dismiss: close,
    clear: () => setItems([]),
  }), [max, close])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={`kk-toast-region kk-toast-region--${position}`}>
        {items.map((t) => <ToastView key={t.id} item={t} onClose={close} />)}
      </div>
    </ToastContext.Provider>
  )
}
