import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fireEvent, fn, within } from 'storybook/test'
import { DatePicker } from './DatePicker'

const onChange = fn()

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: { label: 'ご希望の日', onChange },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 名前（label）で見つかる／日付が変わると、「年-月-日」の文字で知らせる、を確かめる
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('ご希望の日')
    await expect(input).toHaveAttribute('type', 'date')
    fireEvent.change(input, { target: { value: '2026-10-20' } })
    await expect(onChange).toHaveBeenLastCalledWith('2026-10-20')
  },
}
export const WithRange: Story = { args: { min: '2026-10-01', max: '2026-12-31', hint: '10月1日から 12月31日までの日を選べます', defaultValue: '2026-11-15' } }
export const OutOfRange: Story = {
  args: { min: '2026-10-01', max: '2026-12-31', defaultValue: '2027-01-05' },
  // 範囲の外の日付が入っていると、エラーが自動で出て、入力欄に結びつく
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('ご希望の日')
    await expect(input).toBeInvalid()
    await expect(input).toHaveAccessibleDescription('2026/12/31 以前の日付を選んでください')
  },
}
export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-10-20' } }
