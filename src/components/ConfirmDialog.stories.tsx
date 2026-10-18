import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'

const onConfirm = fn()
const onCancel = fn()

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  args: { open: false, title: '記事を削除しますか？', children: '削除した記事は、元に戻せません。', onConfirm: () => {}, onCancel: () => {} },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

// ボタンで開く見本（open は親が持つ）
function Demo({ danger }: { danger?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>削除…</Button>
      <ConfirmDialog
        open={open}
        title="記事を削除しますか？"
        confirmLabel="削除する"
        danger={danger}
        onConfirm={() => { onConfirm(); setOpen(false) }}
        onCancel={() => { onCancel(); setOpen(false) }}
      >
        削除した記事は、元に戻せません。
      </ConfirmDialog>
    </>
  )
}

export const Danger: Story = {
  render: () => <Demo danger />,
  // 取り消せない操作では、最初のフォーカスが「キャンセル」に行く／実行すると onConfirm だけが呼ばれる（onCancel は呼ばれない）、を確かめる
  play: async ({ canvasElement }) => {
    onConfirm.mockClear()
    onCancel.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: '削除…' }))
    const dialog = await canvas.findByRole('dialog', { name: '記事を削除しますか？' })
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'キャンセル' })).toHaveFocus())
    await userEvent.click(within(dialog).getByRole('button', { name: '削除する' }))
    await expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(dialog).not.toBeVisible())
    await expect(onCancel).not.toHaveBeenCalled()
  },
}

export const Normal: Story = {
  render: () => <Demo />,
  // ふつうの確認では、最初のフォーカスが「実行する」に行く。キャンセルすると onCancel が呼ばれる
  play: async ({ canvasElement }) => {
    onConfirm.mockClear()
    onCancel.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: '削除…' }))
    const dialog = await canvas.findByRole('dialog')
    await waitFor(() => expect(within(dialog).getByRole('button', { name: '削除する' })).toHaveFocus())
    await userEvent.click(within(dialog).getByRole('button', { name: 'キャンセル' }))
    await expect(onCancel).toHaveBeenCalledTimes(1)
    await expect(onConfirm).not.toHaveBeenCalled()
  },
}
