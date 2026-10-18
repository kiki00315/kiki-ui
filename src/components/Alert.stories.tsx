import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Alert } from './Alert'

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { children: '内容を確かめてから、送信してください。' },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: { variant: 'neutral', title: 'お知らせ' },
  // 落ち着いたお知らせは role="status"。色だけでなく、読み上げ用の文字「お知らせ：」も入る
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status')
    await expect(status).toHaveTextContent('お知らせ：')
  },
}
export const Success: Story = { args: { variant: 'success', title: '保存しました', children: '変更は、すぐに公開されます。' } }
export const Warning: Story = { args: { variant: 'warning', title: '容量がもうすぐいっぱいです' } }
export const ErrorState: Story = {
  args: { variant: 'error', title: '送信に失敗しました', children: '通信の状態を確かめて、もう一度試してください。' },
  // 失敗は role="alert"（すぐ読み上げられる）
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('エラー：')
  },
}

// 閉じるボタンつき（表示をやめるのは、親の仕事）
function Closable() {
  const [shown, setShown] = useState(true)
  return shown ? <Alert variant="success" title="保存しました" onClose={() => setShown(false)}>変更は、すぐに公開されます。</Alert> : <p>閉じました</p>
}
export const WithClose: Story = {
  render: () => <Closable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: '閉じる' }))
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
  },
}
