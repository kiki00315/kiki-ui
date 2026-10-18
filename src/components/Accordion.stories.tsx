import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Accordion } from './Accordion'

const items = [
  { id: 'price', title: '料金はいくらですか？', content: <p>内容によって変わります。まずはご相談ください。</p> },
  { id: 'time', title: '納期はどのくらいですか？', content: <p>小さなサイトで、2 週間ほどが目安です。</p> },
  { id: 'tool', title: 'どんなツールを使いますか？', content: <p>Figma と、HTML・CSS・JavaScript です。</p> },
]

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: { items },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 押すと開く（aria-expanded が変わる）／ふつうは 1 つだけ開く／Enter でも開閉できる、を確かめる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const price = canvas.getByRole('button', { name: '料金はいくらですか？' })
    const time = canvas.getByRole('button', { name: '納期はどのくらいですか？' })
    await expect(price).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(price)
    await expect(price).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('region', { name: '料金はいくらですか？' })).toBeVisible()
    await userEvent.click(time)
    await expect(price).toHaveAttribute('aria-expanded', 'false')
    await expect(time).toHaveAttribute('aria-expanded', 'true')
    time.focus()
    await userEvent.keyboard('{Enter}')
    await expect(time).toHaveAttribute('aria-expanded', 'false')
  },
}
export const Multiple: Story = { args: { multiple: true, defaultOpen: ['price', 'tool'] } }
