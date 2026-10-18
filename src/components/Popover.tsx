import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import './Popover.css'

export type PopoverProps = {
  /** パネルを開くボタンの文字 */
  label: string
  /** パネルの名前。スクリーンリーダーが、パネルに入ったときに読み上げる。初期値は、ボタンの文字 */
  title?: string
  /** パネルの出る位置（ボタンの下の左そろえ・右そろえ、上の左そろえ） */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start'
  children: ReactNode
}

// ボタンの近くに出る、小さなパネル（Modal のように画面全体はふさがない）。
// 開くとフォーカスがパネルに移り、Esc で閉じてボタンに戻る。外を押す・フォーカスが外に出ると、閉じる
export function Popover({ label, title, placement = 'bottom-start', children }: PopoverProps) {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // 開いたら、フォーカスをパネルに移す（キーボードで、中身を読んだり操作したりできるように）
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  // パネルの外を押したら閉じる（フォーカスは、押した先に任せる）
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      className="kk-popover"
      ref={wrapRef}
      onKeyDown={onKeyDown}
      // Tab でフォーカスが、ボタンとパネルの外に出たら閉じる
      onBlur={(e) => { if (open && !e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false) }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="kk-popover__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open && (
        <div ref={panelRef} id={panelId} role="dialog" aria-label={title ?? label} tabIndex={-1} className={`kk-popover__panel kk-popover__panel--${placement}`}>
          {children}
        </div>
      )}
    </div>
  )
}
