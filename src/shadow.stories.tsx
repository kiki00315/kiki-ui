import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenRow } from './foundations'

// 影のトークン一覧。影は目立たせすぎない（紙の上に、そっと浮く）
const shadows = [{ name: 'shadow-lift', note: '作品カードに、マウスを乗せたときの影' }]

function Shadow() {
  return (
    <div>
      {shadows.map(({ name, note }) => (
        <TokenRow key={name} name={`--${name}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 16 }}>
            <div style={{ width: 160, height: 80, background: 'var(--color-white)', boxShadow: `var(--${name})` }} />
            <span style={{ fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--color-gray-text)' }}>{note}</span>
          </div>
        </TokenRow>
      ))}
    </div>
  )
}

const meta = { title: 'Foundations/Shadow', component: Shadow } satisfies Meta<typeof Shadow>
export default meta
export const All: StoryObj<typeof meta> = {}
