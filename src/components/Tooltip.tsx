import { cloneElement, useEffect, useId, useState } from 'react'
import type { ReactElement } from 'react'
import './Tooltip.css'

export type TooltipPlacement = 'top' | 'bottom'

export type TooltipProps = {
  /** ツールチップに出す短い説明。大事な情報は、ここだけに入れない（タッチ操作では出ないため） */
  content: string
  /** 説明を付ける部品。ボタンやリンクなど、キーボードで選べるものを 1 つだけ入れる */
  children: ReactElement<{ 'aria-describedby'?: string }>
  placement?: TooltipPlacement
}

// マウスを乗せたとき・キーボードでフォーカスしたときに出る。Esc で消せる（見えているものを隠せるように）
export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const id = useId()
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const visible = (hover || focus) && !dismissed

  // 見えている間だけ、Esc キーを見張る。マウスを乗せているだけ（フォーカスなし）でも消せるように、画面全体で受け取る
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDismissed(true) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible])

  return (
    <span
      className="kk-tooltip"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setDismissed(false) }}
      onFocus={() => setFocus(true)}
      onBlur={() => { setFocus(false); setDismissed(false) }}
    >
      {/* 部品に aria-describedby を付けて、スクリーンリーダーが説明を読み上げられるようにする */}
      {cloneElement(children, { 'aria-describedby': id })}
      {/* 見えていないときも DOM に残す（読み上げのため）。見た目だけ CSS で隠す */}
      <span role="tooltip" id={id} className={`kk-tooltip__bubble kk-tooltip__bubble--${placement}`} data-visible={visible}>
        {content}
      </span>
    </span>
  )
}
