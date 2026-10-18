import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import './ConfirmDialog.css'

export type ConfirmDialogProps = {
  open: boolean
  /** 見出し（「削除しますか？」など）。何を確かめるのかを書く */
  title: string
  /** 説明 */
  children: ReactNode
  /** 「実行する」ボタンの文字。「OK」ではなく、何をするか（「削除する」）を書くと、まちがえにくい */
  confirmLabel?: string
  cancelLabel?: string
  /** 取り消せない操作のとき。最初のフォーカスが「キャンセル」に行き、うっかり Enter で実行しないようにする */
  danger?: boolean
  onConfirm: () => void
  /** キャンセルボタン・Esc・×・暗幕のクリックで呼ばれる */
  onCancel: () => void
}

// Modal の上に作った、「実行しますか？」の確認。
// 親が open を false にする（実行したあと・やめたあと）のは、親の仕事
export function ConfirmDialog({ open, title, children, confirmLabel = 'OK', cancelLabel = 'キャンセル', danger = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  // 開いたあと、最初のフォーカスを置く（取り消せない操作なら「キャンセル」、ふつうは「実行する」）
  useEffect(() => {
    if (open) (danger ? cancelRef.current : confirmRef.current)?.focus()
  }, [open, danger])

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="kk-confirm__message">{children}</div>
      <div className="kk-confirm__actions">
        <Button ref={cancelRef} variant="secondary" size="sm" onClick={onCancel}>{cancelLabel}</Button>
        <Button ref={confirmRef} variant="primary" size="sm" className={danger ? 'kk-confirm__danger' : ''} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
