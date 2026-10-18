import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Select } from './Select'

const options = [
  { value: 'web', label: 'ウェブサイト' },
  { value: 'book', label: '絵本' },
  { value: 'app', label: 'アプリデザイン' },
  { value: 'old', label: '（受付終了）', disabled: true },
]

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: { label: '作品の種類', options },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: '選んでください' },
  // 名前（label）で見つけて、項目を選べることを確かめる
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText('作品の種類')
    await expect(select).toHaveValue('')
    await userEvent.selectOptions(select, '絵本')
    await expect(select).toHaveValue('book')
  },
}
export const WithHint: Story = { args: { hint: 'あとから変えられます', defaultValue: 'web' } }
export const WithError: Story = {
  args: { placeholder: '選んでください', error: '種類を選んでください' },
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText('作品の種類')
    await expect(select).toBeInvalid()
    await expect(select).toHaveAccessibleDescription('種類を選んでください')
  },
}
export const Disabled: Story = { args: { disabled: true, defaultValue: 'web' } }
