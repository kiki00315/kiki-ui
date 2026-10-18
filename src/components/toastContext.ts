import { createContext, useContext } from 'react'

export type ToastVariant = 'neutral' | 'success' | 'error'

export type ToastOptions = {
  variant?: ToastVariant
  /** 自動で消えるまでの時間（ミリ秒）。初期値は 5000。0 にすると、自動では消えない（閉じるボタンを押すまで残る）。見落としたくない失敗などに使う */
  duration?: number
}

export type ToastApi = {
  /** お知らせを出す。あとで消せるよう、そのお知らせの番号（id）を返す */
  show: (message: string, options?: ToastOptions) => number
  /** 番号を指定して、1 つ消す */
  dismiss: (id: number) => void
  /** 出ているお知らせを、全部消す */
  clear: () => void
}

export const ToastContext = createContext<ToastApi | null>(null)

// 使い方：const toast = useToast(); toast.show('保存しました', { variant: 'success' })
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  // ToastProvider の外で呼ぶと、何も出ずに気づきにくいので、すぐエラーにする
  if (!api) throw new Error('useToast は <ToastProvider> の中で使ってください')
  return api
}
