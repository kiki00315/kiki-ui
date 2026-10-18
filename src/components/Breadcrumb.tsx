import './Breadcrumb.css'

export type BreadcrumbItem = {
  label: string
  /** 行き先。最後の項目（いまいるページ）には付けない */
  href?: string
}

export type BreadcrumbProps = {
  /** トップから、いまのページまでの順に並べる。最後の 1 つが「いまいるページ」になる */
  items: BreadcrumbItem[]
  /** パンくずの名前。初期値は「パンくずリスト」 */
  'aria-label'?: string
}

// <nav> + 順番つきリスト（<ol>）にする。いまいるページは aria-current="page" で伝える
export function Breadcrumb({ items, ...rest }: BreadcrumbProps) {
  const last = items.length - 1
  return (
    <nav aria-label={rest['aria-label'] ?? 'パンくずリスト'}>
      <ol className="kk-breadcrumb">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="kk-breadcrumb__item">
            {i === last || !item.href ? (
              // いまいるページ（または行き先のない項目）は、リンクにしない
              <span aria-current={i === last ? 'page' : undefined} className="kk-breadcrumb__current">{item.label}</span>
            ) : (
              <a href={item.href} className="kk-breadcrumb__link">{item.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
