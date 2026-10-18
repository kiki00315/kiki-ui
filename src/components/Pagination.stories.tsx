import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Pagination } from './Pagination'
import { getPageItems } from './pageItems'

// ページを覚えて、押したら切り替わる見本
function Demo({ pageCount, start = 1 }: { pageCount: number; start?: number }) {
  const [page, setPage] = useState(start)
  return <Pagination page={page} pageCount={pageCount} onChange={setPage} aria-label="記事の一覧" />
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: { page: 1, pageCount: 5, onChange: () => {}, 'aria-label': '記事の一覧' },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Few: Story = {
  render: () => <Demo pageCount={5} />,
  // いまのページは aria-current／最初のページでは「前へ」が押せない／「次へ」で進む、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: '記事の一覧' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: '1 ページ' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('button', { name: '前のページ' })).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: '次のページ' }))
    await expect(canvas.getByRole('button', { name: '2 ページ' })).toHaveAttribute('aria-current', 'page')
  },
}
export const Many: Story = {
  render: () => <Demo pageCount={20} start={10} />,
  // 多いときは、前後だけ見せて「…」で省く
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: '9 ページ' })).toBeInTheDocument()
    await expect(canvas.queryByRole('button', { name: '5 ページ' })).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: '20 ページ' }))
    await expect(canvas.getByRole('button', { name: '次のページ' })).toBeDisabled()
  },
}

// 出すページ番号の決め方（画面なしで確かめる）
export const PageItems: Story = {
  render: () => <Demo pageCount={20} start={1} />,
  play: async () => {
    await expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5])
    await expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20])
    await expect(getPageItems(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20])
    await expect(getPageItems(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20])
  },
}
