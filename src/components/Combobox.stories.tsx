import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { Combobox } from './Combobox'

const onChange = fn()

const options = [
  { value: 'web', label: 'ウェブサイト' },
  { value: 'book', label: '絵本' },
  { value: 'app', label: 'アプリデザイン' },
  { value: 'tool', label: 'ウェブツール' },
  { value: 'old', label: '（受付終了）', disabled: true },
]

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: { label: '作品の種類', options, placeholder: '文字を打つと絞れます', onChange },
  decorators: [(Story) => <div style={{ width: 320, minHeight: 300 }}><Story /></div>],
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 文字を打つと候補が絞られる → ↓ で候補を選ぶ（フォーカスは入力欄のまま）→ Enter で決まる、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox', { name: '作品の種類' })
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await userEvent.type(input, 'ウェブ')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getAllByRole('option')).toHaveLength(2)
    await userEvent.keyboard('{ArrowDown}')
    const first = canvas.getByRole('option', { name: 'ウェブサイト' })
    await expect(input).toHaveAttribute('aria-activedescendant', first.id)
    await expect(input).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect(input).toHaveValue('ウェブツール')
    await expect(onChange).toHaveBeenLastCalledWith('tool')
    await waitFor(() => expect(canvas.queryByRole('listbox')).not.toBeInTheDocument())
  },
}

export const EmptyResult: Story = {
  // 合うものがないとき「見つかりません」と出る。Esc で閉じると、打った文字は消えて、元に戻る
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox', { name: '作品の種類' })
    await userEvent.type(input, 'ぜんぜん違う')
    await expect(canvas.queryAllByRole('option')).toHaveLength(0)
    await expect(canvas.getAllByText('見つかりません').length).toBeGreaterThan(0)
    await userEvent.keyboard('{Escape}')
    await expect(input).toHaveValue('')
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
  },
}

export const Selected: Story = { args: { defaultValue: 'book' } }
export const WithError: Story = {
  args: { error: '種類を選んでください' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: '作品の種類' })
    await expect(input).toBeInvalid()
    await expect(input).toHaveAccessibleDescription('種類を選んでください')
  },
}
export const Disabled: Story = { args: { disabled: true } }
