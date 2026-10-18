import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import './Table.css'

export type TableColumn<T> = {
  /** 列の名前（データの項目名）。並べ替えの目印にもなる */
  key: string
  /** 列の見出し（画面に出る文字） */
  header: string
  /** true にすると、見出しを押して並べ替えられる */
  sortable?: boolean
  /** 文字の寄せ方。数字の列は 'end'（右）にすると見やすい */
  align?: 'start' | 'end'
  /** セルの中身を自分で作るとき（リンクやバッジを入れるときなど）。省略すると、データの値をそのまま文字にする */
  render?: (row: T) => ReactNode
  /** 並べ替えに使う値。省略すると、データの値を使う */
  sortValue?: (row: T) => string | number
}

export type TableProps<T> = {
  /** 表の名前（「作品の一覧」など）。表の上に出て、読み上げでも、表の名前として読まれる */
  caption: string
  columns: TableColumn<T>[]
  rows: T[]
  /** 行を見分ける目印（id など） */
  getRowId: (row: T) => string
  /** データが 0 件のときの文 */
  emptyText?: string
}

type Sort = { key: string; dir: 'asc' | 'desc' } | null

// 並べ替え用に、値を取り出す（数字は数字として、文字は日本語の順で比べる）
function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'ja', { numeric: true })
}

// 本物の <table>（<caption>・<th scope>）で作る。見出しを押すと並べ替わり、aria-sort で状態が伝わる。
// 横にはみ出すときは、表の枠の中だけがスクロールする（ページ全体は、横にずれない）
export function Table<T>({ caption, columns, rows, getRowId, emptyText = 'データがありません' }: TableProps<T>) {
  const captionId = useId()
  const [sort, setSort] = useState<Sort>(null)
  // 並べ替えたことを読み上げで知らせる文（画面には出さない）
  const [announce, setAnnounce] = useState('')

  const valueOf = (col: TableColumn<T>, row: T): string | number =>
    col.sortValue ? col.sortValue(row) : ((row as Record<string, unknown>)[col.key] as string | number) ?? ''

  const sorted = sort
    ? [...rows].sort((a, b) => {
        const col = columns.find((c) => c.key === sort.key)!
        const r = compare(valueOf(col, a), valueOf(col, b))
        return sort.dir === 'asc' ? r : -r
      })
    : rows

  // 見出しを押すたびに、昇順 → 降順 → 元の順 の順に変わる
  const toggle = (col: TableColumn<T>) => {
    const next: Sort = !sort || sort.key !== col.key ? { key: col.key, dir: 'asc' } : sort.dir === 'asc' ? { key: col.key, dir: 'desc' } : null
    setSort(next)
    setAnnounce(next ? `${col.header}の${next.dir === 'asc' ? '昇順' : '降順'}で並べ替えました` : '並べ替えを解除しました')
  }

  const ariaSort = (col: TableColumn<T>) => {
    if (!col.sortable) return undefined
    if (sort?.key !== col.key) return 'none'
    return sort.dir === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <div className="kk-table">
      <p className="kk-table__caption" id={captionId}>{caption}</p>
      {/* 横にはみ出すとき、キーボードでもスクロールできるよう、枠に tabIndex を付ける */}
      <div className="kk-table__scroll" role="region" aria-labelledby={captionId} tabIndex={0}>
        <table className="kk-table__table">
          <caption className="kk-visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" aria-sort={ariaSort(col)} className={`kk-table__th kk-table__cell--${col.align ?? 'start'}`}>
                  {col.sortable ? (
                    <button type="button" className="kk-table__sort" onClick={() => toggle(col)}>
                      <span>{col.header}</span>
                      <span className={`kk-table__arrow ${sort?.key === col.key ? `kk-table__arrow--${sort.dir}` : ''}`} aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td className="kk-table__empty" colSpan={columns.length}>{emptyText}</td></tr>
            ) : (
              sorted.map((row) => (
                <tr key={getRowId(row)}>
                  {columns.map((col, i) => {
                    const content = col.render ? col.render(row) : String(valueOf(col, row))
                    const cls = `kk-table__cell kk-table__cell--${col.align ?? 'start'}`
                    // 左端の列は、行の見出し（th scope="row"）にする。読み上げで「この行は〇〇」と伝わる
                    return i === 0
                      ? <th key={col.key} scope="row" className={`${cls} kk-table__rowhead`}>{content}</th>
                      : <td key={col.key} className={cls}>{content}</td>
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="kk-visually-hidden" role="status">{announce}</p>
    </div>
  )
}
