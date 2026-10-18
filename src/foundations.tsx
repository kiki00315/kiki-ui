import { useEffect, useState } from 'react'

// トークンの「いまの値」（16px など）を、CSS 変数から読み取る。
// 値を画面に直接書かないので、tokens.css を変えると、一覧の数字も自動で変わる
export function useTokenValue(name: string): string {
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim())
  }, [name])
  return value
}

// 一覧の 1 行（左：トークン名と値、右：見本）。余白と文字サイズのページで共通に使う
export function TokenRow({ name, children }: { name: string; children: React.ReactNode }) {
  const value = useTokenValue(name)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--color-line)', fontFamily: 'var(--font-main)' }}>
      <div style={{ fontSize: 13 }}>
        <code>{name}</code>
        <div style={{ color: 'var(--color-gray-text)' }}>{value}</div>
      </div>
      <div>{children}</div>
    </div>
  )
}
