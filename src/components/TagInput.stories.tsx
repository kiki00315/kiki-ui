import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test'
import { TagInput } from './TagInput'

const onChange = fn()

const meta = {
  title: 'Components/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  args: { label: 'タグ', placeholder: '打って Enter', onChange },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof TagInput>

export default meta
type Story = StoryObj<typeof meta>

const tagsOf = (el: HTMLElement) => within(el).queryAllByRole('listitem').map((li) => li.textContent?.replace('×', ''))

export const Default: Story = {
  // Enter・カンマ・読点で、タグになる／Backspace で最後を消す／同じタグは入らない、を確かめる
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'タグ' })
    await userEvent.type(input, 'デザイン{Enter}')
    await userEvent.type(input, 'React,')
    await userEvent.type(input, 'アクセシビリティ、')
    await expect(tagsOf(canvasElement)).toEqual(['デザイン', 'React', 'アクセシビリティ'])
    await expect(onChange).toHaveBeenLastCalledWith(['デザイン', 'React', 'アクセシビリティ'])
    await userEvent.type(input, 'React{Enter}')
    await expect(tagsOf(canvasElement)).toHaveLength(3)
    await expect(canvas.getByRole('status')).toHaveTextContent('もう入っています')
    await userEvent.keyboard('{Backspace}')
    await expect(tagsOf(canvasElement)).toEqual(['デザイン', 'React'])
    await expect(canvas.getByRole('status')).toHaveTextContent('を削除しました')
  },
}

export const Composing: Story = {
  // 日本語の変換中（isComposing）の Enter では、タグにならない。確定したあとの Enter で、タグになる
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'タグ' }) as HTMLInputElement
    await userEvent.type(input, 'にほんご')
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    await expect(tagsOf(canvasElement)).toEqual([])
    await expect(input).toHaveValue('にほんご')
    await userEvent.keyboard('{Enter}')
    await expect(tagsOf(canvasElement)).toEqual(['にほんご'])
  },
}

export const RemoveAndPaste: Story = {
  args: { defaultValue: ['one', 'two'] },
  // ×ボタンで消せる（名前は「〇〇を削除」）／貼り付けた文字は、区切りでタグに分かれ、最後の分は入力欄に残る
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'oneを削除' }))
    await expect(tagsOf(canvasElement)).toEqual(['two'])
    const input = canvas.getByRole('textbox', { name: 'タグ' }) as HTMLInputElement
    await userEvent.click(input)
    await userEvent.paste('x,y,z')
    await expect(tagsOf(canvasElement)).toEqual(['two', 'x', 'y'])
    await expect(input).toHaveValue('z')
  },
}

export const MaxTags: Story = {
  args: { maxTags: 2, defaultValue: ['one', 'two'], hint: '2 個まで' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'タグ' })
    await userEvent.type(input, 'three{Enter}')
    await expect(tagsOf(canvasElement)).toEqual(['one', 'two'])
    await expect(canvas.getByRole('status')).toHaveTextContent('2 個までです')
  },
}

export const WithError: Story = {
  args: { error: 'タグを 1 つ以上入れてください' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'タグ' })
    await expect(input).toBeInvalid()
    await expect(input).toHaveAccessibleDescription('タグを 1 つ以上入れてください')
  },
}
