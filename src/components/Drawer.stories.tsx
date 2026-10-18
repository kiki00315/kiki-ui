import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './Button'
import { Drawer } from './Drawer'

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  args: { open: false, title: '絞り込み', onClose: () => {}, children: null },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

function Demo({ side }: { side?: 'right' | 'left' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>絞り込みを開く</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="絞り込み" side={side}>
        <p>種類や年で、作品を絞り込みます。</p>
        {Array.from({ length: 20 }, (_, i) => <p key={i}>項目 {i + 1}</p>)}
      </Drawer>
    </>
  )
}

export const Right: Story = {
  render: () => <Demo />,
  // 開く → 名前つきのダイアログ → 閉じるボタンで閉じる → フォーカスが、開いたボタンに戻る、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: '絞り込みを開く' })
    await userEvent.click(trigger)
    const drawer = await canvas.findByRole('dialog', { name: '絞り込み' })
    await expect(drawer).toBeVisible()
    await userEvent.click(within(drawer).getByRole('button', { name: '閉じる' }))
    await waitFor(() => expect(drawer).not.toBeVisible())
    await expect(trigger).toHaveFocus()
  },
}
export const Left: Story = { render: () => <Demo side="left" /> }
