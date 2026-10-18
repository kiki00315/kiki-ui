import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import './Drawer.css'

export type DrawerProps = {
  open: boolean
  /** 閉じるとき（Esc キー、暗幕のクリック、閉じるボタン）に呼ばれる。open を false にする処理を書く */
  onClose: () => void
  /** パネルの見出し。スクリーンリーダーが、まず読み上げる */
  title: string
  /** どちらの端から出すか。初期値は右 */
  side?: 'right' | 'left'
  children: ReactNode
}

// 横から出てくる、画面の高さいっぱいのパネル。Modal と同じ、標準の <dialog>（showModal）で作る。
// フォーカスの閉じ込め・Esc で閉じる・閉じたあとのフォーカスの戻りは、ブラウザに任せる
export function Drawer({ open, onClose, title, side = 'right', children }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`kk-drawer kk-drawer--${side}`}
      aria-labelledby={titleId}
      // 親が閉じたとき（プログラムで閉じたとき）は、「閉じられた」と知らせ直さない
      onClose={() => { if (open) onClose() }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="kk-drawer__panel">
        <div className="kk-drawer__head">
          <h2 className="kk-drawer__title" id={titleId}>{title}</h2>
          <button type="button" className="kk-drawer__close" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        <div className="kk-drawer__body">{children}</div>
      </div>
    </dialog>
  )
}
