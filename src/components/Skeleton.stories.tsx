import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Card } from './Card'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = { args: { variant: 'text', lines: 3 } }
export const Rect: Story = { args: { variant: 'rect', height: 160 } }
export const Circle: Story = { args: { variant: 'circle', width: 56, height: 56 } }

// 読み込み中のカード。まわりの領域に aria-busy を付けて、「読み込み中」を伝える
export const LoadingCard: Story = {
  render: () => (
    <div aria-busy="true" style={{ display: 'grid', gap: 12, padding: 38, background: 'var(--color-white)' }}>
      <Skeleton variant="rect" height={200} />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" lines={2} />
    </div>
  ),
  // 読み上げの対象にならない（aria-hidden）ことを確かめる
  play: async ({ canvasElement }) => {
    const shapes = canvasElement.querySelectorAll('.kk-skeleton')
    await expect(shapes.length).toBeGreaterThan(0)
    for (const s of shapes) await expect(s.closest('[aria-hidden="true"]')).not.toBeNull()
  },
}

// 読み込みが終わったあと（同じ大きさの本物が出る）
export const Loaded: Story = {
  render: () => <Card kind="ウェブツール" title="色見本ジェネレーター" media={<div style={{ aspectRatio: '1', background: '#E8E8E8' }} />} />,
}
