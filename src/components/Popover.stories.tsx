import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Popover } from './Popover'
import { Button } from './Button'

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: {
    label: '使い方',
    title: '使い方のヒント',
    children: (
      <>
        <p style={{ margin: '0 0 8px' }}>色を選んで、「置き換える」を押します。</p>
        <Button size="sm" variant="secondary">わかった</Button>
      </>
    ),
  },
  decorators: [(Story) => <div style={{ minHeight: 220, paddingTop: 80 }}><Story /></div>],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 開く → 名前つきのパネル（フォーカスが移る）→ Esc で閉じてボタンに戻る → 外を押しても閉じる、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: '使い方' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    const panel = await canvas.findByRole('dialog', { name: '使い方のヒント' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(panel).toHaveFocus())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
    await userEvent.click(trigger)
    await canvas.findByRole('dialog')
    await userEvent.click(document.body)
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

export const BottomEnd: Story = {
  args: { placement: 'bottom-end' },
  decorators: [(Story) => <div style={{ minHeight: 220, paddingTop: 80, display: 'flex', justifyContent: 'flex-end' }}><Story /></div>],
}
export const Top: Story = {
  args: { placement: 'top-start' },
  decorators: [(Story) => <div style={{ minHeight: 220, paddingTop: 140 }}><Story /></div>],
}
