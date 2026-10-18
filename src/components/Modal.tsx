import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import './Modal.css'

export type ModalProps = {
  open: boolean
  /** 閉じるとき（Esc キー、暗幕のクリック、閉じるボタン）に呼ばれる。open を false にする処理を書く */
  onClose: () => void
  /** モーダルの見出し。スクリーンリーダーが、まずこれを読み上げる */
  title: string
  children: ReactNode
}

// HTML 標準の <dialog> を使う。showModal() にすると、ブラウザが次のことを自動でやってくれる
//   ・モーダルの外を操作できなくする（フォーカスの閉じ込め）
//   ・Esc キーで閉じる
//   ・閉じたあと、開く前に押していたボタンにフォーカスを戻す
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // open の変化に合わせて、dialog を開け閉めする
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="kk-modal"
      aria-labelledby={titleId}
      // Esc で閉じたときも、親の open を false にそろえる
      onClose={onClose}
      // 暗幕（dialog 自身の外側）を押したら閉じる。中身を押したときは閉じない
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="kk-modal__panel">
        <h2 className="kk-modal__title" id={titleId}>{title}</h2>
        <div className="kk-modal__body">{children}</div>
        <button type="button" className="kk-modal__close" onClick={onClose} aria-label="閉じる">×</button>
      </div>
    </dialog>
  )
}
