import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Tabs } from './Tabs'

const tabs = [
  { id: 'web', label: 'ウェブ', content: <p>プロフィールサイトや、ウェブツールを作っています。</p> },
  { id: 'book', label: '絵本', content: <p>オリジナルの絵本を描いています。</p> },
  { id: 'app', label: 'アプリ', content: <p>カフェの注文アプリのデザインをしました。</p> },
  { id: 'old', label: '準備中', content: <p>まだ何もありません。</p>, disabled: true },
]

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { tabs, 'aria-label': '作品の種類' },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // ← → Home End で動く／選べないタブは飛ばす／開いているタブにだけ Tab で止まる、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const web = canvas.getByRole('tab', { name: 'ウェブ' })
    await userEvent.click(web)
    await userEvent.keyboard('{ArrowRight}')
    const book = canvas.getByRole('tab', { name: '絵本' })
    await expect(book).toHaveAttribute('aria-selected', 'true')
    await expect(book).toHaveFocus()
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('オリジナルの絵本')
    await expect(web).toHaveAttribute('tabindex', '-1')
    await userEvent.keyboard('{End}')
    // いちばん最後の「準備中」は選べないので、その前の「アプリ」で止まる
    await expect(canvas.getByRole('tab', { name: 'アプリ' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowRight}')
    // 右に進むと、いちばん最初に戻る
    await expect(web).toHaveAttribute('aria-selected', 'true')
  },
}
export const StartAtSecond: Story = { args: { defaultValue: 'book' } }
