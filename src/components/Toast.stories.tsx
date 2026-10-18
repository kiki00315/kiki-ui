import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './Button'
import { ToastProvider } from './Toast'
import { useToast } from './toastContext'

// お知らせを出すボタン（useToast は、ToastProvider の中で使う）
function Demo() {
  const toast = useToast()
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" onClick={() => toast.show('お知らせです')}>ふつう</Button>
      <Button variant="secondary" onClick={() => toast.show('保存しました', { variant: 'success' })}>保存</Button>
      <Button variant="secondary" onClick={() => toast.show('送信に失敗しました', { variant: 'error' })}>失敗</Button>
    </div>
  )
}

const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  args: { children: <Demo /> },
} satisfies Meta<typeof ToastProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 押す → お知らせが出る（読み上げ用の role が付く）→ 閉じるボタンで消える、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: '保存' }))
    await expect(await canvas.findByRole('status')).toHaveTextContent('保存しました')
    await userEvent.click(canvas.getByRole('button', { name: '閉じる' }))
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
  },
}

export const ErrorIsAlert: Story = {
  // エラーは、すぐ読み上げられる role="alert" になる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: '失敗' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent('送信に失敗しました')
  },
}

// 上限（max）を超えると、古いものから消える
function Burst() {
  const toast = useToast()
  return <Button variant="secondary" onClick={() => { for (let i = 1; i <= 5; i++) toast.show(`お知らせ ${i}`) }}>5 つ出す</Button>
}

export const Limit: Story = {
  args: { max: 3, children: <Burst /> },
  // 5 つ出しても、見えているのは新しい 3 つだけ
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: '5 つ出す' }))
    await waitFor(() => expect(canvas.getAllByRole('status')).toHaveLength(3))
    const texts = canvas.getAllByRole('status').map((t) => t.textContent?.replace('×', ''))
    await expect(texts).toEqual(['お知らせ 3', 'お知らせ 4', 'お知らせ 5'])
  },
}
