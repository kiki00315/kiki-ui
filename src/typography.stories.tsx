import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenRow } from './foundations'

const sizes = ['font-size-sm', 'font-size-md', 'font-size-lg']
const fonts = [
  { name: '--font-main', note: '見出し・短い文（しろくまフォント）' },
  { name: '--font-read', note: '長い文章（丸ゴシック。しろくまフォントは漢字が少ないため）' },
]
const sample = 'ご依頼・ご相談はお気軽にどうぞ。Works 2026'

function Typography() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-main)', fontWeight: 400, fontSize: 16 }}>文字サイズ</h2>
      {sizes.map((name) => (
        <TokenRow key={name} name={`--${name}`}>
          <span style={{ fontFamily: 'var(--font-main)', fontSize: `var(--${name})` }}>{sample}</span>
        </TokenRow>
      ))}
      <h2 style={{ marginTop: 40, fontFamily: 'var(--font-main)', fontWeight: 400, fontSize: 16 }}>フォント</h2>
      {fonts.map(({ name, note }) => (
        <TokenRow key={name} name={name}>
          <div style={{ fontFamily: `var(${name})`, fontSize: 'var(--font-size-md)' }}>{sample}</div>
          <div style={{ marginTop: 4, fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--color-gray-text)' }}>{note}</div>
        </TokenRow>
      ))}
    </div>
  )
}

const meta = { title: 'Foundations/Typography', component: Typography } satisfies Meta<typeof Typography>
export default meta
export const All: StoryObj<typeof meta> = {}
