import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './Button'
import { Modal } from './Modal'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: { open: false, title: 'お問い合わせ', onClose: () => {}, children: null },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

// ボタンで開閉できる見本（open は親が持つ）
function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>モーダルを開く</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="お問い合わせ">
        <p>ご依頼・ご相談はお気軽にどうぞ。</p>
        <div style={{ marginTop: 16 }}><Button size="sm" onClick={() => setOpen(false)}>OK</Button></div>
      </Modal>
    </>
  )
}

export const Default: Story = {
  render: () => <Demo />,
  // 開く → 見出しで見つかる → 閉じるボタンで閉じる → フォーカスが「開くボタン」に戻る、までを確かめる
  // （Esc キーは、ブラウザ本来の動き。テスト用の疑似キー入力には反応しないので、ここでは試さない）
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'モーダルを開く' })
    await userEvent.click(trigger)
    const dialog = await within(canvasElement).findByRole('dialog', { name: 'お問い合わせ' })
    await expect(dialog).toBeVisible()
    await userEvent.click(within(dialog).getByRole('button', { name: '閉じる' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    await expect(trigger).toHaveFocus()
  },
}
