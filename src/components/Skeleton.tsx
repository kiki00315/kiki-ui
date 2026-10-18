import type { CSSProperties } from 'react'
import './Skeleton.css'

export type SkeletonVariant = 'text' | 'rect' | 'circle'

export type SkeletonProps = {
  /** 形。text = 文章の 1 行、rect = 四角（画像やカード）、circle = 丸（アイコンなど） */
  variant?: SkeletonVariant
  /** 幅。数字なら px、文字なら CSS の値（'60%' など） */
  width?: number | string
  /** 高さ。text のときは文字の高さになるので、省略してよい */
  height?: number | string
  /** text のとき、何行ぶん出すか。最後の行は少し短くなる */
  lines?: number
}

// 読み込み中の「場所取り」。中身のある部品が出る前に、同じ大きさの灰色の形を見せて、ガタつきを防ぐ。
// 読み上げには意味がないので aria-hidden にする。「読み込み中」は、まわりの領域に aria-busy="true" を付けて伝える
export function Skeleton({ variant = 'text', width, height, lines = 1 }: SkeletonProps) {
  const style: CSSProperties = { width, height }
  if (variant === 'text' && lines > 1) {
    return (
      <div className="kk-skeleton-lines" aria-hidden="true" style={{ width }}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="kk-skeleton kk-skeleton--text" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </div>
    )
  }
  return <span className={`kk-skeleton kk-skeleton--${variant}`} style={style} aria-hidden="true" />
}
