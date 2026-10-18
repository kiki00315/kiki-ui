import { cloneElement, useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ReactElement } from 'react'
import './Tooltip.css'

export type TooltipPlacement = 'top' | 'bottom'

export type TooltipProps = {
  /** ツールチップに出す短い説明。大事な情報は、ここだけに入れない（タッチ操作では出ないため） */
  content: string
  /** 説明を付ける部品。ボタンやリンクなど、キーボードで選べるものを 1 つだけ入れる */
  children: ReactElement<{ 'aria-describedby'?: string }>
  /** 出したい位置。画面のはしで入りきらないときは、反対側に自動で出る */
  placement?: TooltipPlacement
}

// 画面のはしとの、あけておく余白（px）
const EDGE = 8

// マウスを乗せたとき・キーボードでフォーカスしたときに出る。Esc で消せる（見えているものを隠せるように）
export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const id = useId()
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const visible = (hover || focus) && !dismissed
  const wrapRef = useRef<HTMLSpanElement>(null)
  const bubbleRef = useRef<HTMLSpanElement>(null)
  // 実際に出す位置（入りきらないときは、placement の反対になる）と、横にずらす量
  const [actual, setActual] = useState<TooltipPlacement>(placement)
  const [shift, setShift] = useState(0)

  // 出す直前に、画面に入りきるかを測る。上に出したいのに上がせまければ下へ、横にはみ出すなら、はみ出さない分だけずらす
  const place = () => {
    const wrap = wrapRef.current?.getBoundingClientRect()
    const bubble = bubbleRef.current?.getBoundingClientRect()
    if (!wrap || !bubble) return
    const above = wrap.top - EDGE
    const below = window.innerHeight - wrap.bottom - EDGE
    const fits = (room: number) => bubble.height + EDGE <= room
    let next = placement
    if (placement === 'top' && !fits(above) && below > above) next = 'bottom'
    else if (placement === 'bottom' && !fits(below) && above > below) next = 'top'
    const left = wrap.left + wrap.width / 2 - bubble.width / 2
    const right = left + bubble.width
    const delta = left < EDGE ? EDGE - left : right > window.innerWidth - EDGE ? window.innerWidth - EDGE - right : 0
    setActual(next)
    setShift(Math.round(delta))
  }

  // 見えている間だけ、Esc キーを見張る。マウスを乗せているだけ（フォーカスなし）でも消せるように、画面全体で受け取る
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDismissed(true) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible])

  return (
    <span
      ref={wrapRef}
      className="kk-tooltip"
      onMouseEnter={() => { place(); setHover(true) }}
      onMouseLeave={() => { setHover(false); setDismissed(false) }}
      onFocus={() => { place(); setFocus(true) }}
      onBlur={() => { setFocus(false); setDismissed(false) }}
    >
      {/* 部品に aria-describedby を付けて、スクリーンリーダーが説明を読み上げられるようにする */}
      {cloneElement(children, { 'aria-describedby': id })}
      {/* 見えていないときも DOM に残す（読み上げのため）。見た目だけ CSS で隠す */}
      <span
        ref={bubbleRef}
        role="tooltip"
        id={id}
        className={`kk-tooltip__bubble kk-tooltip__bubble--${actual}`}
        data-visible={visible}
        data-placement={actual}
        style={{ '--kk-tip-shift': `${shift}px` } as CSSProperties}
      >
        {content}
      </span>
    </span>
  )
}
