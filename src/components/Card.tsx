import type { ReactNode } from 'react'
import './Card.css'

export type CardProps = {
  /** 作品の絵など。カードの上に出る */
  media?: ReactNode
  /** 作品の種類（「ウェブツール」など）。小さく出る */
  kind?: string
  /** 作品の名前 */
  title: string
  /** カードを押したときの行き先。あるときはカード全体がリンクになる */
  href?: string
}

// Works ページの作品カードと同じ形：白いフチ → 絵 → 「種類　名前　見る」
export function Card({ media, kind, title, href }: CardProps) {
  const body = (
    <>
      {media && <div className="kk-card__media">{media}</div>}
      <p className="kk-card__caption">
        {kind && <span className="kk-card__kind">{kind}</span>}
        <span className="kk-card__title">{title}</span>
        {href && <span className="kk-card__more" aria-hidden="true">見る</span>}
      </p>
    </>
  )
  return href ? (
    <a className="kk-card kk-card--link" href={href}>{body}</a>
  ) : (
    <div className="kk-card">{body}</div>
  )
}
