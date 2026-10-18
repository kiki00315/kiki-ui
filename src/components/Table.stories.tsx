import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Badge } from './Badge'
import { Table } from './Table'
import type { TableColumn } from './Table'

type Work = { id: string; name: string; kind: string; year: number; status: '公開中' | '準備中' }

const rows: Work[] = [
  { id: '1', name: '色見本ジェネレーター', kind: 'ウェブツール', year: 2026, status: '公開中' },
  { id: '2', name: 'アイコンジェネレーター', kind: 'ウェブツール', year: 2026, status: '公開中' },
  { id: '3', name: 'カフェの注文アプリ', kind: 'アプリデザイン', year: 2025, status: '公開中' },
  { id: '4', name: 'オリジナル絵本', kind: '絵本', year: 2025, status: '準備中' },
]

const columns: TableColumn<Work>[] = [
  { key: 'name', header: '作品名', sortable: true },
  { key: 'kind', header: '種類', sortable: true },
  { key: 'year', header: '年', sortable: true, align: 'end' },
  { key: 'status', header: '状態', render: (r) => <Badge variant={r.status === '公開中' ? 'success' : 'neutral'}>{r.status}</Badge> },
]

const meta = {
  title: 'Components/Table',
  component: Table<Work>,
  tags: ['autodocs'],
  args: { caption: '作品の一覧', columns, rows, getRowId: (r: Work) => r.id },
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
} satisfies Meta<typeof Table<Work>>

export default meta
type Story = StoryObj<typeof meta>

const firstColumn = (canvas: { getAllByRole: (role: string) => HTMLElement[] }) => canvas.getAllByRole('rowheader').map((c) => c.textContent)

export const Default: Story = {
  // 名前つきの表／左端の列は行の見出し／見出しを押すと、昇順 → 降順 → 元の順に変わり、aria-sort と読み上げが付く、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('table', { name: '作品の一覧' })).toBeInTheDocument()
    await expect(firstColumn(canvas)).toEqual(['色見本ジェネレーター', 'アイコンジェネレーター', 'カフェの注文アプリ', 'オリジナル絵本'])
    const yearHeader = canvas.getByRole('columnheader', { name: '年' })
    await expect(yearHeader).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(within(yearHeader).getByRole('button'))
    await expect(yearHeader).toHaveAttribute('aria-sort', 'ascending')
    await expect(canvas.getByRole('status')).toHaveTextContent('年の昇順で並べ替えました')
    // 2025 年の 2 件が先に来る（同じ年は、元の順のまま）
    await expect(firstColumn(canvas).slice(0, 2)).toEqual(['カフェの注文アプリ', 'オリジナル絵本'])
    await userEvent.click(within(yearHeader).getByRole('button'))
    await expect(yearHeader).toHaveAttribute('aria-sort', 'descending')
    await userEvent.click(within(yearHeader).getByRole('button'))
    await expect(yearHeader).toHaveAttribute('aria-sort', 'none')
    await expect(firstColumn(canvas)[0]).toBe('色見本ジェネレーター')
    // 並べ替えできない列（状態）は、ボタンにならない
    await expect(within(canvas.getByRole('columnheader', { name: '状態' })).queryByRole('button')).toBeNull()
  },
}

export const SortByName: Story = {
  // 日本語の列も、読みの順（あいうえお順）で並ぶ
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(within(canvas.getByRole('columnheader', { name: '作品名' })).getByRole('button'))
    await expect(firstColumn(canvas)).toEqual(['アイコンジェネレーター', 'オリジナル絵本', 'カフェの注文アプリ', '色見本ジェネレーター'])
  },
}

export const Empty: Story = {
  args: { rows: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('データがありません')).toBeInTheDocument()
  },
}

// 幅がせまいとき：表の枠の中だけが横にスクロールする
export const Narrow: Story = {
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
}
