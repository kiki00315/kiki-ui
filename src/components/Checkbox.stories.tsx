import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'メールで返信を受け取る' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 名前（label）の文字を押しても切り替わる／Space キーでも切り替わる、を確かめる
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', { name: 'メールで返信を受け取る' })
    await userEvent.click(within(canvasElement).getByText('メールで返信を受け取る'))
    await expect(box).toBeChecked()
    box.focus()
    await userEvent.keyboard(' ')
    await expect(box).not.toBeChecked()
  },
}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }

// 親（すべて）と子の例。子の一部だけ選ばれているとき、親は「一部」の状態になる
function Group() {
  const [items, setItems] = useState({ web: true, book: false, app: false })
  const values = Object.values(items)
  const all = values.every(Boolean)
  const some = values.some(Boolean) && !all
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Checkbox label="すべて" checked={all} indeterminate={some} onChange={(e) => setItems({ web: e.target.checked, book: e.target.checked, app: e.target.checked })} />
      <div style={{ display: 'grid', gap: 8, paddingLeft: 28 }}>
        <Checkbox label="ウェブ" checked={items.web} onChange={(e) => setItems({ ...items, web: e.target.checked })} />
        <Checkbox label="絵本" checked={items.book} onChange={(e) => setItems({ ...items, book: e.target.checked })} />
        <Checkbox label="アプリ" checked={items.app} onChange={(e) => setItems({ ...items, app: e.target.checked })} />
      </div>
    </div>
  )
}
export const Indeterminate: Story = {
  render: () => <Group />,
  // 子が 1 つだけ選ばれている → 親は「一部」。親を押すと、全部が選ばれる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const parent = canvas.getByRole('checkbox', { name: 'すべて' }) as HTMLInputElement
    await expect(parent.indeterminate).toBe(true)
    await userEvent.click(parent)
    await expect(canvas.getByRole('checkbox', { name: 'アプリ' })).toBeChecked()
    await expect(parent.indeterminate).toBe(false)
  },
}
