import type { Meta, StoryObj } from '@storybook/react-vite'

// 色のトークン一覧。値は tokens.css の変数をそのまま使うので、tokens.css を変えるとここも変わる
const colors = ['bg', 'white', 'ink', 'title', 'gray', 'gray-text', 'line', 'error', 'error-bg', 'success-text', 'success-bg', 'warning-text', 'warning-bg', 'neutral-bg']

function Colors() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 140px)', gap: 16 }}>
      {colors.map((name) => (
        <div key={name} style={{ fontFamily: 'var(--font-main)', fontSize: 13 }}>
          <div style={{ height: 72, background: `var(--color-${name})`, border: '1px solid var(--color-line)' }} />
          <code>--color-{name}</code>
        </div>
      ))}
    </div>
  )
}

const meta = { title: 'Foundations/Colors', component: Colors } satisfies Meta<typeof Colors>
export default meta
export const All: StoryObj<typeof meta> = {}
