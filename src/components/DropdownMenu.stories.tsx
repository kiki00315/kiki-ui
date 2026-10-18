import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { DropdownMenu } from './DropdownMenu'

const onEdit = fn()
const onDelete = fn()

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  args: {
    label: '操作',
    items: [
      { id: 'edit', label: '編集', onSelect: onEdit },
      { id: 'copy', label: '複製' },
      { id: 'archive', label: 'アーカイブ（準備中）', disabled: true },
      { id: 'delete', label: '削除', danger: true, onSelect: onDelete },
    ],
  },
  // 下にメニューが出るので、下に余白をあける
  decorators: [(Story) => <div style={{ minHeight: 220 }}><Story /></div>],
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 開く → 最初の項目にフォーカス → ↓↑ で移動（選べない項目は飛ばす）→ Esc で閉じてボタンに戻る、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: '操作' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('menu', { name: '操作' })).toBeVisible()
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: '編集' })).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: '複製' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    // 「アーカイブ」は選べないので飛ばして、「削除」へ
    await expect(canvas.getByRole('menuitem', { name: '削除' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    // いちばん下の次は、ぐるっと回って最初へ
    await expect(canvas.getByRole('menuitem', { name: '編集' })).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(canvas.getByRole('menuitem', { name: '削除' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.queryByRole('menu')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

export const SelectItem: Story = {
  // 項目を選ぶと、処理が動いて、メニューが閉じ、フォーカスがボタンに戻る
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: '操作' })
    await userEvent.click(trigger)
    await userEvent.click(await canvas.findByRole('menuitem', { name: '削除' }))
    await expect(onDelete).toHaveBeenCalledTimes(1)
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
    await expect(trigger).toHaveFocus()
  },
}

export const OpenWithArrowUp: Story = {
  // キーボードで ↑ を押して開くと、最後の項目にフォーカスが行く
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('button', { name: '操作' }).focus()
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: '削除' })).toHaveFocus())
  },
}

export const AlignEnd: Story = {
  args: { align: 'end' },
  decorators: [(Story) => <div style={{ minHeight: 220, display: 'flex', justifyContent: 'flex-end' }}><Story /></div>],
}
