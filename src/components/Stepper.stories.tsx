import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Stepper } from './Stepper'

const steps = [
  { label: 'カートの確認', description: '商品と数を確かめます' },
  { label: 'お届け先' },
  { label: 'お支払い' },
  { label: '完了' },
]

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  args: { steps, current: 1, 'aria-label': 'ご注文の流れ' },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 名前つきの順番リスト／いまのステップだけ aria-current／色や形のほかに、状態の文字も読み上げに入る、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('list', { name: 'ご注文の流れ' })).toBeInTheDocument()
    const items = canvas.getAllByRole('listitem')
    await expect(items).toHaveLength(4)
    await expect(items[0]).toHaveTextContent('完了')
    await expect(items[1]).toHaveAttribute('aria-current', 'step')
    await expect(items[1]).toHaveTextContent('現在のステップ')
    await expect(items[2]).not.toHaveAttribute('aria-current')
    await expect(items[2]).toHaveTextContent('まだのステップ')
  },
}
export const First: Story = { args: { current: 0 } }
export const Last: Story = { args: { current: 3 } }
export const Narrow: Story = { decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>] }
