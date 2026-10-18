import { getPageItems } from './pageItems'
import './Pagination.css'

export type PaginationProps = {
  /** いまのページ（1 から数える） */
  page: number
  /** ページの総数 */
  pageCount: number
  onChange: (page: number) => void
  /** ページ送りの名前（「記事の一覧」など）。ナビゲーションの目印として読み上げられる */
  'aria-label': string
}

export function Pagination({ page, pageCount, onChange, ...rest }: PaginationProps) {
  const items = getPageItems(page, pageCount)
  return (
    <nav aria-label={rest['aria-label']}>
      <ul className="kk-pagination">
        <li>
          <button type="button" className="kk-pagination__button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="前のページ">‹</button>
        </li>
        {items.map((item, i) => (
          <li key={`${item}-${i}`}>
            {item === '…' ? (
              <span className="kk-pagination__gap" aria-hidden="true">…</span>
            ) : (
              <button
                type="button"
                className="kk-pagination__button"
                // いまのページは、色だけでなく aria-current でも伝える
                aria-current={item === page ? 'page' : undefined}
                aria-label={`${item} ページ`}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            )}
          </li>
        ))}
        <li>
          <button type="button" className="kk-pagination__button" disabled={page >= pageCount} onClick={() => onChange(page + 1)} aria-label="次のページ">›</button>
        </li>
      </ul>
    </nav>
  )
}
