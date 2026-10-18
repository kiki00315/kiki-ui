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

// 場所・消えない・消す、の見本
function Options() {
  const toast = useToast()
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="secondary" onClick={() => toast.show('すぐ消えます', { duration: 80 })}>すぐ消える</Button>
      <Button variant="secondary" onClick={() => toast.show('閉じるまで残ります', { variant: 'error', duration: 0 })}>消えない</Button>
      <Button variant="secondary" onClick={() => toast.clear()}>全部消す</Button>
    </div>
  )
}

export const Sticky: Story = {
  args: { children: <Options /> },
  // duration が短いお知らせは自動で消え、0 のお知らせは残る／「全部消す」で、残っていたものも消える
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'すぐ消える' }))
    await userEvent.click(canvas.getByRole('button', { name: '消えない' }))
    await waitFor(() => expect(canvas.queryByText('すぐ消えます')).not.toBeInTheDocument())
    await expect(canvas.getByRole('alert')).toHaveTextContent('閉じるまで残ります')
    await new Promise((r) => setTimeout(r, 300))
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: '全部消す' }))
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument())
  },
}

export const TopStart: Story = {
  args: { position: 'top-start', children: <Burst /> },
  // 出す場所を、左上にできる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: '5 つ出す' }))
    await waitFor(() => expect(canvasElement.querySelector('.kk-toast-region--top-start')).not.toBeNull())
    const r = canvasElement.querySelector('.kk-toast-region')!.getBoundingClientRect()
    await expect(r.top).toBeLessThan(window.innerHeight / 2)
    await expect(r.left).toBeLessThan(window.innerWidth / 2)
  },
}
