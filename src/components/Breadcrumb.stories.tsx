import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Breadcrumb } from './Breadcrumb'

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'ホーム', href: '/' },
      { label: 'Works', href: '/works' },
      { label: 'UIコンポーネント集' },
    ],
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 名前つきの nav になっている／最後の項目だけ aria-current でリンクではない、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: 'パンくずリスト' })).toBeInTheDocument()
    await expect(canvas.getAllByRole('link')).toHaveLength(2)
    const current = canvas.getByText('UIコンポーネント集')
    await expect(current).toHaveAttribute('aria-current', 'page')
    await expect(current.closest('a')).toBeNull()
  },
}
export const TwoLevels: Story = { args: { items: [{ label: 'ホーム', href: '/' }, { label: 'About' }] } }
