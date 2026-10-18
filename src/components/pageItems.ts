// 出すページ番号を決める。多いときは、前後だけ見せて、あいだを「…」にする
//   例：1 2 3 4 5 … 20 ／ 1 … 9 10 11 … 20 ／ 1 … 16 17 18 19 20
export function getPageItems(page: number, pageCount: number): (number | '…')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, '…', pageCount]
  if (page >= pageCount - 3) return [1, '…', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
  return [1, '…', page - 1, page, page + 1, '…', pageCount]
}
