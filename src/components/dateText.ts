// 入力欄の文字と、「2026-10-20」の形の日付を、行き来させる

/** '2026-10-20' → '2026/10/20'（画面に出す形） */
export function formatDate(iso: string): string {
  return iso.replaceAll('-', '/')
}

/**
 * 打たれた文字を、「2026-10-20」の形の日付にする。読めないとき、本当にない日付（2 月 30 日など）のときは null
 * 次のような書き方を、どれも受け付ける（日本語では、全角の数字や「年月日」で打つ人も多いため）
 *   2026/10/20 ・ 2026-10-20 ・ 2026.10.20 ・ 20261020 ・ ２０２６／１０／２０ ・ 2026年10月20日
 */
export function parseDate(text: string): string | null {
  const half = text
    .trim()
    // 全角の数字を、半角にする
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    // 区切りを、すべて「/」にそろえる
    .replace(/[／\-－ー.．年月]/g, '/')
    .replace(/日$/, '')
  let y: number, m: number, d: number
  const parts = half.split('/').filter((p) => p !== '')
  if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
    ;[y, m, d] = parts.map(Number)
  } else if (/^\d{8}$/.test(half)) {
    y = Number(half.slice(0, 4)); m = Number(half.slice(4, 6)); d = Number(half.slice(6, 8))
  } else return null
  if (y < 1000 || y > 9999) return null
  // 本当にある日付かを確かめる（Date は、2 月 30 日を、3 月 2 日に直してしまうので、直ったかどうかを見る）
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
