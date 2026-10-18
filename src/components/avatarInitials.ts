// 頭文字を決める。「Taro Yamada」→ TY、「Kiki」→ KI、「きき」→ き
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length >= 2) return (Array.from(parts[0])[0] + Array.from(parts[1])[0]).toUpperCase()
  const chars = Array.from(parts[0])
  // 英字だけなら 2 文字、日本語などなら 1 文字
  return chars.slice(0, /^[A-Za-z0-9._-]+$/.test(parts[0]) ? 2 : 1).join('').toUpperCase()
}
