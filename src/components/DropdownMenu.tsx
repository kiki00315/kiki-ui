import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import './DropdownMenu.css'

export type MenuItem = {
  id: string
  label: string
  disabled?: boolean
  /** 取り消せない操作（削除など）。赤く見せる */
  danger?: boolean
  onSelect?: () => void
}

export type DropdownMenuProps = {
  /** メニューを開くボタンの文字 */
  label: string
  items: MenuItem[]
  /** メニューをボタンの左にそろえるか、右にそろえるか */
  align?: 'start' | 'end'
}

// WAI-ARIA の「メニューボタン」の作法にそろえる
//   ボタン：Enter / Space / ↓ で開き、最初の項目へ。↑ で開くと、最後の項目へ
//   メニュー：↑↓ で移動（端でぐるっと回る）、Home / End、Esc で閉じてボタンに戻る、Tab で閉じる、項目を押すと実行して閉じる
export function DropdownMenu({ label, items, align = 'start' }: DropdownMenuProps) {
  const menuId = useId()
  const [open, setOpen] = useState(false)
  // 開いたときに、どの項目へフォーカスするか（null は、決まっていない）。画面の描きなおしを起こさないよう、ref で持つ
  const focusAt = useRef<'first' | 'last' | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // 選べる項目（disabled でないもの）の位置の一覧
  const enabledIndexes = () => items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0)

  const close = (returnFocus: boolean) => {
    setOpen(false)
    focusAt.current = null
    if (returnFocus) triggerRef.current?.focus()
  }

  // 開いたら、決めておいた項目へフォーカスを移す
  useEffect(() => {
    if (!open || !focusAt.current) return
    const list = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0)
    const target = focusAt.current === 'first' ? list[0] : list[list.length - 1]
    if (target !== undefined) itemRefs.current[target]?.focus()
    // 1 回だけ移す（items が変わって、この処理がもう一度動いても、フォーカスを取り戻さない）
    focusAt.current = null
  }, [open, items])

  // メニューの外を押したら閉じる（フォーカスは、押した先に任せる）
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  })

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      focusAt.current = e.key === 'ArrowDown' ? 'first' : 'last'
      setOpen(true)
    }
  }

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = enabledIndexes()
    const current = itemRefs.current.findIndex((el) => el === document.activeElement)
    const pos = list.indexOf(current)
    let next: number | undefined
    if (e.key === 'ArrowDown') next = list[(pos + 1) % list.length]
    else if (e.key === 'ArrowUp') next = list[(pos - 1 + list.length) % list.length]
    else if (e.key === 'Home') next = list[0]
    else if (e.key === 'End') next = list[list.length - 1]
    else if (e.key === 'Escape') { e.preventDefault(); close(true); return }
    else if (e.key === 'Tab') { close(false); return }
    if (next !== undefined) { e.preventDefault(); itemRefs.current[next]?.focus() }
  }

  return (
    <div className="kk-menu" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className="kk-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => { if (open) close(false); else { focusAt.current = 'first'; setOpen(true) } }}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{label}</span>
        <span className="kk-menu__caret" aria-hidden="true" />
      </button>
      {open && (
        <div id={menuId} role="menu" aria-label={label} className={`kk-menu__list kk-menu__list--${align}`} onKeyDown={onMenuKeyDown}>
          {items.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => { itemRefs.current[i] = el }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              className={`kk-menu__item ${item.danger ? 'kk-menu__item--danger' : ''}`.trim()}
              onClick={() => { item.onSelect?.(); close(true) }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
