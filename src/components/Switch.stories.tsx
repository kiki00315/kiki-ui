import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Switch } from './Switch'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { label: '通知を受け取る' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // role="switch" で見つかる／Space キーで切り替わる（オン・オフが読み上げられる）、を確かめる
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch', { name: '通知を受け取る' })
    await expect(sw).not.toBeChecked()
    sw.focus()
    await userEvent.keyboard(' ')
    await expect(sw).toBeChecked()
  },
}
export const On: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
