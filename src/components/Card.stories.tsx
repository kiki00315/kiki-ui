import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'

// 絵の代わりの、灰色の四角（本物の絵は、ポートフォリオ側にある）
const dummy = <div style={{ aspectRatio: '1', background: '#E8E8E8' }} />

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: { media: dummy, kind: 'ウェブツール', title: '色見本ジェネレーター' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Link: Story = { args: { href: '#' } }
export const WithoutMedia: Story = { args: { media: undefined } }
