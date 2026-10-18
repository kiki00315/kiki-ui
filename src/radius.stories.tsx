import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenRow } from './foundations'

// 角丸のトークン一覧。四角の角の丸さが、そのまま値
const radii = [
  { name: 'radius-sm', note: '入力欄など、小さい部品' },
  { name: 'radius-pill', note: 'ボタン（左右が半円になる）' },
]

function Radius() {
  return (
    <div>
      {radii.map(({ name, note }) => (
        <TokenRow key={name} name={`--${name}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 160, height: 56, background: 'var(--color-white)', border: '1px solid var(--color-gray)', borderRadius: `var(--${name})` }} />
            <span style={{ fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--color-gray-text)' }}>{note}</span>
          </div>
        </TokenRow>
      ))}
    </div>
  )
}

const meta = { title: 'Foundations/Radius', component: Radius } satisfies Meta<typeof Radius>
export default meta
export const All: StoryObj<typeof meta> = {}
