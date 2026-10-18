import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { RadioGroup } from './RadioGroup'

const options = [
  { value: 'web', label: 'ウェブサイト' },
  { value: 'book', label: '絵本' },
  { value: 'app', label: 'アプリデザイン' },
  { value: 'old', label: '（受付終了）', disabled: true },
]

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { legend: '作品の種類', options, defaultValue: 'web' },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // グループ名で見つかる／↓ キーで次の選択肢へ移って選ばれる（受付終了は飛ばす）、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('radiogroup', { name: '作品の種類' })).toBeInTheDocument()
    const web = canvas.getByRole('radio', { name: 'ウェブサイト' })
    await expect(web).toBeChecked()
    web.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('radio', { name: '絵本' })).toBeChecked()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    // いちばん下の「アプリデザイン」の次は、選べない項目を飛ばして最初に戻る
    await expect(canvas.getByRole('radio', { name: 'ウェブサイト' })).toBeChecked()
  },
}
export const WithError: Story = {
  args: { defaultValue: undefined, error: '種類を選んでください' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radiogroup', { name: '作品の種類' })).toHaveAccessibleDescription('種類を選んでください')
  },
}
export const Disabled: Story = { args: { disabled: true } }
