import { createContext, useContext } from 'react'

export type ToastVariant = 'neutral' | 'success' | 'error'

export type ToastOptions = {
  variant?: ToastVariant
  /** 自動で消えるまでの時間（ミリ秒）。初期値は 5000 */
  duration?: number
}

export type ToastApi = {
  show: (message: string, options?: ToastOptions) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

// 使い方：const toast = useToast(); toast.show('保存しました', { variant: 'success' })
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  // ToastProvider の外で呼ぶと、何も出ずに気づきにくいので、すぐエラーにする
  if (!api) throw new Error('useToast は <ToastProvider> の中で使ってください')
  return api
}
