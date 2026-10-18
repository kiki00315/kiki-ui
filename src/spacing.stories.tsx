import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenRow } from './foundations'

// 余白のトークン一覧。帯の長さが、そのまま余白の大きさ
const spaces = ['space-1', 'space-2', 'space-3', 'space-4', 'space-5']

function Spacing() {
  return (
    <div>
      {spaces.map((name) => (
        <TokenRow key={name} name={`--${name}`}>
          <div style={{ width: `var(--${name})`, height: 24, background: 'var(--color-gray)' }} />
        </TokenRow>
      ))}
      <p style={{ marginTop: 24, fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--color-gray-text)' }}>
        余白は 8px の倍数を基本にします。--space-5 は、作品カードの白いフチの幅です。
      </p>
    </div>
  )
}

const meta = { title: 'Foundations/Spacing', component: Spacing } satisfies Meta<typeof Spacing>
export default meta
export const All: StoryObj<typeof meta> = {}
