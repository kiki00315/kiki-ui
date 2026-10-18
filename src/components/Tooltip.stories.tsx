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
