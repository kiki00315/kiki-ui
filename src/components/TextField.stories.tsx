import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { TextField } from './TextField'

const meta = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: { label: 'お名前' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 入力欄を「名前（label）」で見つけて、文字を打てることを確かめる
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('お名前')
    await userEvent.type(input, 'きき')
    await expect(input).toHaveValue('きき')
  },
}
export const WithHint: Story = { args: { label: 'メールアドレス', hint: '返信用に使います' } }
export const WithError: Story = {
  args: { label: 'メールアドレス', error: '@ を含めて入力してください', defaultValue: 'kiki' },
  // エラーの文章が、入力欄に結びついている（スクリーンリーダーに伝わる）ことを確かめる
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('メールアドレス')
    await expect(input).toBeInvalid()
    await expect(input).toHaveAccessibleDescription('@ を含めて入力してください')
  },
}
export const Disabled: Story = { args: { disabled: true } }
