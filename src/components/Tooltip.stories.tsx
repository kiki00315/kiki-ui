import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './Button'
import { Tooltip } from './Tooltip'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'CSS 変数をコピーします', children: <Button variant="secondary">コピー</Button> },
  // 上に出るので、上に余白をあける
  decorators: [(Story) => <div style={{ padding: '56px 120px' }}><Story /></div>],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Top: Story = {
  // キーボードで Tab → 説明が出る・ボタンに結びついている → 別のところへ移ると消える、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'コピー' })
    const tip = canvas.getByRole('tooltip', { hidden: true })
    await expect(tip).not.toBeVisible()
    await userEvent.tab()
    await expect(button).toHaveFocus()
    await waitFor(() => expect(tip).toBeVisible())
    await expect(button).toHaveAccessibleDescription('CSS 変数をコピーします')
    await userEvent.tab()
    await waitFor(() => expect(tip).not.toBeVisible())
  },
}
export const Bottom: Story = { args: { placement: 'bottom' } }

export const FlipsAtTopEdge: Story = {
  // 画面の上のはしにあるボタンでは、上に出したくても、入りきらないので下に出る
  decorators: [(Story) => <div style={{ position: 'fixed', top: 0, left: 120 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole('button', { name: 'コピー' }))
    await waitFor(() => expect(canvas.getByRole('tooltip')).toHaveAttribute('data-placement', 'bottom'))
  },
}

export const ShiftsAtLeftEdge: Story = {
  // 画面の左のはしでは、はみ出さないよう、横にずれる（左が 8px より外に出ない）
  decorators: [(Story) => <div style={{ position: 'fixed', top: 80, left: 0 }}><Story /></div>],
  args: { content: 'ここは、画面の左のはしに近い場所です' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole('button', { name: 'コピー' }))
    await waitFor(() => expect(canvas.getByRole('tooltip').getBoundingClientRect().left).toBeGreaterThanOrEqual(7))
  },
}

export const StaysAtTopWhenThereIsRoom: Story = {
  // 十分な広さがあるときは、そのまま上に出る
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole('button', { name: 'コピー' }))
    await waitFor(() => expect(canvas.getByRole('tooltip')).toHaveAttribute('data-placement', 'top'))
  },
}
