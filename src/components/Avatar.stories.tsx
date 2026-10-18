import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { Avatar } from './Avatar'
import { getInitials } from './avatarInitials'

// 小さな丸い画像（インラインの SVG）。ネットワークなしで、画像が出る場合を見せるため
const image = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#BFD7EA"/><circle cx="48" cy="38" r="16" fill="#FFF"/><ellipse cx="48" cy="88" rx="30" ry="24" fill="#FFF"/></svg>')

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'きき' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Initials: Story = {
  // 画像がないときは、名前で読み上げられる（頭文字は読み上げない）
  play: async ({ canvasElement }) => {
    const avatar = within(canvasElement).getByRole('img', { name: 'きき' })
    await expect(avatar).toHaveTextContent('き')
  },
}
export const WithImage: Story = { args: { name: 'Kiki Won', src: image } }
export const BrokenImage: Story = {
  args: { name: 'Taro Yamada', src: 'http://localhost:1/missing.png' },
  // 画像が読み込めないときは、頭文字（TY）に切り替わる
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByRole('img', { name: 'Taro Yamada' })).toHaveTextContent('TY'))
  },
}
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar name="Kiki" size="sm" /><Avatar name="Kiki" size="md" /><Avatar name="Kiki" size="lg" />
      <Avatar name="き" size="lg" /><Avatar name="Sora" size="lg" /><Avatar name="Mimi" size="lg" />
    </div>
  ),
}

// 頭文字の決め方（画面なしで確かめる）
export const InitialsRule: Story = {
  render: () => <Avatar name="Taro Yamada" />,
  play: async () => {
    await expect(getInitials('Taro Yamada')).toBe('TY')
    await expect(getInitials('Kiki')).toBe('KI')
    await expect(getInitials('きき')).toBe('き')
    await expect(getInitials('  ')).toBe('?')
  },
}
