import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Tree } from './Tree'

const onSelect = fn()

const nodes = [
  {
    id: 'src', label: 'src', children: [
      { id: 'components', label: 'components', children: [{ id: 'button', label: 'Button.tsx' }, { id: 'modal', label: 'Modal.tsx' }] },
      { id: 'tokens', label: 'tokens.css' },
    ],
  },
  { id: 'readme', label: 'README.md' },
]

const meta = {
  title: 'Components/Tree',
  component: Tree,
  tags: ['autodocs'],
  args: { nodes, 'aria-label': 'ファイル', onSelect },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
} satisfies Meta<typeof Tree>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // →で開く／もう一度→で最初の子へ／↓で移る／←で親へ戻る／←で閉じる／Enter で選ぶ、を確かめる
  play: async ({ canvasElement }) => {
    onSelect.mockClear()
    const canvas = within(canvasElement)
    const tree = canvas.getByRole('tree', { name: 'ファイル' })
    await expect(tree).toBeInTheDocument()
    const src = canvas.getByRole('treeitem', { name: /^src$/ })
    await expect(src).toHaveAttribute('aria-expanded', 'false')
    // Tab で入ると、最初の項目に、フォーカスの置き場所（tabindex=0）がある
    await userEvent.tab()
    await expect(src).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(src).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('treeitem', { name: /^components$/ })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect(canvas.getByRole('treeitem', { name: 'Button.tsx' })).toHaveFocus()
    await expect(canvas.getByRole('treeitem', { name: 'Button.tsx' })).toHaveAttribute('aria-level', '3')
    await userEvent.keyboard('{Enter}')
    await expect(onSelect).toHaveBeenLastCalledWith('button')
    await expect(canvas.getByRole('treeitem', { name: 'Button.tsx' })).toHaveAttribute('aria-selected', 'true')
    // ← は、子のない項目では「親へ戻る」
    await userEvent.keyboard('{ArrowLeft}')
    await expect(canvas.getByRole('treeitem', { name: /^components$/ })).toHaveFocus()
    // ← は、開いている項目では「閉じる」
    await userEvent.keyboard('{ArrowLeft}')
    await expect(canvas.getByRole('treeitem', { name: /^components$/ })).toHaveAttribute('aria-expanded', 'false')
    // End で、見えている最後の項目へ
    await userEvent.keyboard('{End}')
    await expect(canvas.getByRole('treeitem', { name: 'README.md' })).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(src).toHaveFocus()
  },
}

export const Expanded: Story = { args: { defaultExpanded: ['src', 'components'], defaultSelected: 'modal' } }

export const ClickToggle: Story = {
  // マウスで押すと、選ばれて、開け閉めされる（親の項目まで反応しない）
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('src'))
    await expect(canvas.getByRole('treeitem', { name: /^src$/ })).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(canvas.getByText('components'))
    await expect(canvas.getByRole('treeitem', { name: /^components$/ })).toHaveAttribute('aria-expanded', 'true')
    // 子を押したとき、親（src）は、閉じたりしない
    await userEvent.click(canvas.getByText('Modal.tsx'))
    await expect(canvas.getByRole('treeitem', { name: /^src$/ })).toHaveAttribute('aria-expanded', 'true')
  },
}
