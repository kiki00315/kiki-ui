import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Progress } from './Progress'

const meta = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { label: 'アップロード', value: 40 },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { showValue: true },
  // 名前つきの progressbar で、いまの値が伝わる、を確かめる
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar', { name: 'アップロード' })
    await expect(bar).toHaveAttribute('value', '40')
    await expect(bar).toHaveAttribute('max', '100')
    await expect(within(canvasElement).getByText('40%')).toBeInTheDocument()
  },
}
export const Done: Story = { args: { value: 100, showValue: true } }
export const CustomMax: Story = { args: { label: '読んだページ', value: 3, max: 12, showValue: true } }
export const Indeterminate: Story = {
  args: { value: undefined, label: '読み込み中' },
  // 値がないとき（どれくらいかわからない）は、value 属性がなく、数字も出さない
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar', { name: '読み込み中' })
    await expect(bar).not.toHaveAttribute('value')
    // ブラウザは、値のない progress の position を -1 で表す
    await expect((bar as HTMLProgressElement).position).toBe(-1)
  },
}
