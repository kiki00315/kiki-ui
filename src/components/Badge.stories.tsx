import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: '公開中' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = { args: { variant: 'neutral', children: '下書き' } }
export const Success: Story = { args: { variant: 'success', children: '公開中' } }
export const Warning: Story = { args: { variant: 'warning', children: '確認待ち' } }
export const Failed: Story = { args: { variant: 'error', children: '失敗' } }
